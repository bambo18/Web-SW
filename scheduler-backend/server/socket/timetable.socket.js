const { timetables } = require("../store/memoryStore");
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

    const cell = getOrCreateCell(projectId, day, slot);

    const exists = cell.members.find(m => m.memberId === memberId);

    if (exists) {
      cell.members = cell.members.filter(m => m.memberId !== memberId);
    } else {
      if (cell.members.length >= 6) return;
      cell.members.push({ memberId, nickname });
    }

    io.to(`project-${projectId}`).emit("timetable-update", cell);
  });

  socket.on("disconnect", () => {
    const { projectId, memberId } = socket.user;
    if (!projectId || !memberId) return;

    for (const cell of timetables) {
      if (cell.projectId !== projectId) continue;
      cell.members = cell.members.filter(m => m.memberId !== memberId);
      io.to(`project-${projectId}`).emit("timetable-update", cell);
    }

    console.log(`❌ member ${memberId} auto-removed`);
  });
};
