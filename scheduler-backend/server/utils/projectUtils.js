const store = require("../store");
const { projects, members, timetables, init: storeInit } = store;

function findProjectById(projectId) {
  return projects.find(p => p.projectId === projectId);
}

function findProjectByCode(joinCode) {
  return projects.find(p => p.joinCode === joinCode);
}

function isProjectFull(projectId) {
  return members.filter(m => m.projectId === projectId).length >= 6;
}

function getOrCreateCell(projectId, day, slot) {
  // If using mysql store, timetables.push is async; but timetables may already contain the cell.
  let cell = timetables.find(
    t => t.projectId === projectId && t.day === day && t.slot === slot
  );

  if (!cell) {
    const newCell = { projectId, day, slot, members: [] };
    if (typeof store.createTimetableCell === 'function') {
      // Persist async but return in-memory cell immediately for compatibility with sync callers.
      store.createTimetableCell(newCell).catch(() => {});
      cell = newCell;
    } else {
      timetables.push(newCell);
      cell = newCell;
    }
  }

  return cell;
}

module.exports = {
  findProjectById,
  findProjectByCode,
  isProjectFull,
  getOrCreateCell
};
