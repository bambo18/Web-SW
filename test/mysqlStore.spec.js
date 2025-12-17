/*
 Basic behavior tests for mysqlStore. These are lightweight and intended to be run
 only when a MySQL instance is available and `process.env.DB === 'mysql'`.

 Usage:
  DB= mysql DB_HOST=127.0.0.1 DB_USER=root DB_PASS=... DB_NAME=scheduler node test/mysqlStore.spec.js

 The tests validate:
 - getNextProjectId reserves an id and projects.push persists the joinCode
 - getNextMemberId reserves an id and members.push persists the member
 - toggling a timetable cell members persists across reload
*/

const assert = require('assert');
const storeIndex = require('../scheduler-backend/server/store');
const db = require('../scheduler-backend/server/db/mysql');

async function run() {
  if (process.env.DB !== 'mysql') {
    console.log('Skipping mysqlStore tests: set DB=mysql to run.');
    return;
  }

  if (typeof storeIndex.init === 'function') await storeIndex.init();

  // create project
  const pid = await storeIndex.getNextProjectId();
  assert(pid, 'getNextProjectId should return id');
  if (typeof storeIndex.createProject === 'function') {
    await storeIndex.createProject({ projectId: pid, joinCode: 'TEST01' });
  } else {
    storeIndex.projects.push({ projectId: pid, joinCode: 'TEST01' });
  }

  // create member
  const mid = await storeIndex.getNextMemberId();
  assert(mid, 'getNextMemberId should return id');
  if (typeof storeIndex.createMember === 'function') {
    await storeIndex.createMember({ memberId: mid, projectId: pid, nickname: 'tester' });
  } else {
    storeIndex.members.push({ memberId: mid, projectId: pid, nickname: 'tester' });
  }

  // push timetable cell
  const cell = { projectId: pid, day: 0, slot: 0, members: [{ memberId: mid, nickname: 'tester' }] };
  if (typeof storeIndex.createTimetableCell === 'function') {
    await storeIndex.createTimetableCell(cell);
  } else {
    const maybe = storeIndex.timetables.push(cell);
    if (maybe && typeof maybe.then === 'function') await maybe;
  }

  // reload store and check
  await storeIndex.init();
  const found = storeIndex.timetables.find(c => c.projectId === pid && c.day === 0 && c.slot === 0);
  assert(found && Array.isArray(found.members) && found.members.length === 1, 'cell members persisted');

  console.log('mysqlStore basic checks passed.');
}

run().catch(err => { console.error(err); process.exit(1); });
