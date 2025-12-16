const { projects, members, timetables } = require("../store/memoryStore");

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
  let cell = timetables.find(
    t => t.projectId === projectId && t.day === day && t.slot === slot
  );

  if (!cell) {
    cell = { projectId, day, slot, members: [] };
    timetables.push(cell);
  }

  return cell;
}

module.exports = {
  findProjectById,
  findProjectByCode,
  isProjectFull,
  getOrCreateCell
};
