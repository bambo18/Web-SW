const store = require("../store");
const { timetables, init: storeInit, updateCellMembers } = store;
const { getOrCreateCell } = require("../utils/projectUtils");

module.exports = function timetableSocket(io, socket) {
  console.log("🔌 socket connected:", socket.id);

  socket.user = {
    projectId: null,
    memberId: null
  };

  socket.on("join-project", ({ projectId, memberId }) => {
    socket.join(`project-${projectId}`);
    socket.user.projectId = projectId;
    socket.user.memberId = memberId;
  });

  socket.on("toggle-slot", (data) => {
    const { projectId, memberId, nickname, day, slot } = data;

    // Ensure store is initialized (async for mysql)
    if (typeof storeInit === 'function' && storeInit.__initialized !== true) {
      const maybeInit = storeInit();
      if (maybeInit && typeof maybeInit.then === 'function') maybeInit.catch(() => {});
      storeInit.__initialized = true;
    }

    const cell = getOrCreateCell(projectId, day, slot);

    const exists = cell.members.find(m => m.memberId === memberId);

    if (exists) {
      const next = cell.members.filter(m => m.memberId !== memberId);
      if (typeof updateCellMembers === 'function') {
        updateCellMembers(cell, next).then(() => io.to(`project-${projectId}`).emit("timetable-update", cell)).catch(()=>{});
        return;
      }
      cell.members = next;
    } else {
      if (cell.members.length >= 6) return;
      const next = [...cell.members, { memberId, nickname }];
      if (typeof updateCellMembers === 'function') {
        updateCellMembers(cell, next).then(() => io.to(`project-${projectId}`).emit("timetable-update", cell)).catch(()=>{});
        return;
      }
      cell.members = next; // in-memory
    }

    io.to(`project-${projectId}`).emit("timetable-update", cell);
  });

  socket.on("disconnect", () => {
    const { projectId, memberId } = socket.user;
    if (!projectId || !memberId) return;

    for (const cell of timetables) {
      if (cell.projectId !== projectId) continue;
      const next = cell.members.filter(m => m.memberId !== memberId);
      if (typeof updateCellMembers === 'function') {
        updateCellMembers(cell, next).then(() => io.to(`project-${projectId}`).emit("timetable-update", cell)).catch(()=>{});
      } else {
        cell.members = next;
        io.to(`project-${projectId}`).emit("timetable-update", cell);
      }
    }

    console.log(`❌ member ${memberId} auto-removed`);
  });
};
