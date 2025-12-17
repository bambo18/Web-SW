/*
 * mysqlStore.js - corrected, minimal patch
 * Changes made:
 *  - Use `pool.execute` and proper destructuring ([rows]) for mysql2 results.
 *    This fixes incorrect assumptions about return shapes (bugfix).
 *  - Removed async side-effects from Proxy.set: Proxy.set is now synchronous
 *    and does not perform DB writes. This avoids returning Promises from set.
 *  - Disallow direct `.push()` in mysql mode to avoid silent async behavior.
 *    Provide explicit async creators: `createProject`, `createMember`, `createTimetableCell`.
 *  - Added `updateCellMembers(cell, newMembers)` async helper to persist cell members.
 *
 * Rationale/comments are inline where changes are important.
 */

const db = require('../db/mysql');
const pool = db.pool; // use pool.execute for correct mysql2 return shape

// In-memory mirrors for array semantics
const projects = [];
const members = [];
const timetables = []; // will hold proxied cell objects

// Helpers
async function loadAll() {
  // load projects
  const [pjRows] = await pool.execute('SELECT projectId, joinCode FROM projects');
  projects.length = 0;
  for (const r of pjRows) projects.push({ projectId: r.projectId, joinCode: r.joinCode });

  // load members
  const [msRows] = await pool.execute('SELECT memberId, projectId, nickname FROM members');
  members.length = 0;
  for (const r of msRows) members.push({ memberId: r.memberId, projectId: r.projectId, nickname: r.nickname });

  // load timetable cells and their members
  const [cells] = await pool.execute('SELECT id, projectId, day, slot FROM timetable_cells');
  timetables.length = 0;
  for (const c of cells) {
    const [cellMembers] = await pool.execute('SELECT memberId, nickname FROM timetable_cell_members WHERE cell_id = ?', [c.id]);
    const obj = { projectId: c.projectId, day: c.day, slot: c.slot, _id: c.id, members: cellMembers.map(m => ({ memberId: m.memberId, nickname: m.nickname })) };
    timetables.push(wrapCell(obj));
  }
}

// Wrap a cell object with a Proxy. Proxy.set MUST be synchronous and MUST NOT perform DB writes.
function wrapCell(cell) {
  if (!Array.isArray(cell.members)) cell.members = [];

  const handler = {
    set(target, prop, value) {
      // Synchronous mutation only. Persistence must be done via updateCellMembers().
      target[prop] = value;
      return true;
    }
  };

  return new Proxy(cell, handler);
}

// Persist members within a transaction. This function performs DB work and is used
// by the explicit async updater `updateCellMembers` below.
async function persistCellMembers(cell, newMembers) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    let cellId = cell._id;
    if (!cellId) {
      const [insertRes] = await conn.execute('INSERT INTO timetable_cells (projectId, day, slot) VALUES (?, ?, ?)', [cell.projectId, cell.day, cell.slot]);
      cellId = insertRes.insertId;
      cell._id = cellId;
    }

    await conn.execute('DELETE FROM timetable_cell_members WHERE cell_id = ?', [cellId]);

    if (newMembers && newMembers.length > 0) {
      const vals = [];
      const placeholders = [];
      for (const m of newMembers) {
        placeholders.push('(?, ?, ?)');
        vals.push(cellId, m.memberId || null, m.nickname || '');
      }
      await conn.execute('INSERT INTO timetable_cell_members (cell_id, memberId, nickname) VALUES ' + placeholders.join(', '), vals);
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// Disallow direct push() in mysql mode to prevent silent async behavior.
// Callers should use the explicit async creators below.
function makeArrayProxy(arr) {
  return new Proxy(arr, {
    get(target, prop) {
      if (prop === 'push') return function () {
        throw new Error('Direct push() is disabled in mysqlStore. Use createProject/createMember/createTimetableCell instead.');
      };
      return target[prop];
    }
  });
}

// Internal helpers that perform DB operations and return created/updated items.
// These use correct destructuring for mysql2 results.
async function onProjectPush(item) {
  if (item.projectId) {
    await pool.execute('UPDATE projects SET joinCode = ? WHERE projectId = ?', [item.joinCode || null, item.projectId]);
    return item;
  }
  const [res] = await pool.execute('INSERT INTO projects (joinCode) VALUES (?)', [item.joinCode || null]);
  item.projectId = res.insertId;
  return item;
}

async function onMemberPush(item) {
  if (item.memberId) {
    await pool.execute('UPDATE members SET projectId = ?, nickname = ? WHERE memberId = ?', [item.projectId || null, item.nickname || '', item.memberId]);
    return item;
  }
  const [res] = await pool.execute('INSERT INTO members (projectId, nickname) VALUES (?, ?)', [item.projectId || null, item.nickname || '']);
  item.memberId = res.insertId;
  return item;
}

async function onTimetablePush(item) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.execute('SELECT id FROM timetable_cells WHERE projectId = ? AND day = ? AND slot = ? FOR UPDATE', [item.projectId, item.day, item.slot]);
    let cellId = rows.length ? rows[0].id : null;
    if (!cellId) {
      const [r] = await conn.execute('INSERT INTO timetable_cells (projectId, day, slot) VALUES (?, ?, ?)', [item.projectId, item.day, item.slot]);
      cellId = r.insertId;
    }

    await conn.execute('DELETE FROM timetable_cell_members WHERE cell_id = ?', [cellId]);
    if (item.members && item.members.length > 0) {
      const vals = [];
      const placeholders = [];
      for (const m of item.members) {
        placeholders.push('(?, ?, ?)');
        vals.push(cellId, m.memberId || null, m.nickname || '');
      }
      await conn.execute('INSERT INTO timetable_cell_members (cell_id, memberId, nickname) VALUES ' + placeholders.join(', '), vals);
    }

    await conn.commit();
    item._id = cellId;
    return wrapCell(item);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// Reserve-new-ID functions
async function getNextProjectId() {
  const [res] = await pool.execute('INSERT INTO projects (joinCode) VALUES (NULL)');
  return res.insertId || null;
}

async function getNextMemberId() {
  const [res] = await pool.execute('INSERT INTO members (projectId, nickname) VALUES (NULL, "")');
  return res.insertId || null;
}

// Initialize: load DB contents
async function init() {
  await loadAll();
}

const projectsProxy = makeArrayProxy(projects);
const membersProxy = makeArrayProxy(members);
const timetablesProxy = makeArrayProxy(timetables);

// Explicit async creators for mysql mode. These replace direct push() usage.
async function createProject(item) {
  console.log("🧱 mysqlStore.createProject", item);

  const created = await onProjectPush(item);
  projects.push(created);
  return created;
}

async function createMember(item) {
  const created = await onMemberPush(item);
  members.push(created);
  return created;
}

async function createTimetableCell(item) {
  const created = await onTimetablePush(item);
  timetables.push(created);
  return created;
}

// Explicit updater for cell members. This function performs DB persistence
// inside a transaction and only updates the in-memory object AFTER success.
async function updateCellMembers(cell, newMembers) {
  await persistCellMembers(cell, newMembers);
  // update in-memory AFTER DB commit
  cell.members = newMembers;
}

module.exports = {
  projects: projectsProxy,
  members: membersProxy,
  timetables: timetablesProxy,
  getNextProjectId,
  getNextMemberId,
  init,
  // explicit async helpers
  createProject,
  createMember,
  createTimetableCell,
  updateCellMembers
};
