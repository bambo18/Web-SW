let projectSeq = 1;
let memberSeq = 1;

const projects = [];
const members = [];
const timetables = [];

module.exports = {
  projects,
  members,
  timetables,
  getNextProjectId: () => projectSeq++,
  getNextMemberId: () => memberSeq++
};
