const { getOrCreateCell } = require("../utils/projectUtils");

module.exports = function timetableSocket(io, socket) {
  console.log("🔌 socket connected:", socket.id);

  socket.on("join-project", (projectId) => {
    socket.join(`project-${projectId}`);
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
    console.log("❌ socket disconnected:", socket.id);
  });
};
