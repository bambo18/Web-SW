const path = require("path");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const PORT = 4000;

let projectSeq = 1;
let memberSeq = 1;

const projects = [];
const members = [];
const timetables = [];

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ================= 헬스 체크 ================= */
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

/* ================= 프로젝트 생성 ================= */
app.post("/project/create", (req, res) => {
  const projectId = projectSeq++;
  const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  projects.push({ projectId, joinCode });

  res.json({
    projectId,
    joinCode,
    inviteLink: `http://localhost:${PORT}/?project=${projectId}`
  });
});

/* ================= 링크 참가 ================= */
app.post("/project/:projectId/join/link", (req, res) => {
  const projectId = Number(req.params.projectId);
  const { nickname } = req.body;

  const project = projects.find(p => p.projectId === projectId);
  if (!project) return res.status(404).json({ error: "project not found" });

  const count = members.filter(m => m.projectId === projectId).length;
  if (count >= 6) return res.status(403).json({ error: "project full" });

  const member = {
    memberId: memberSeq++,
    projectId,
    nickname
  };
  members.push(member);

  res.json(member);
});

/* ================= 코드 참가 ================= */
app.post("/project/join/code", (req, res) => {
  const { joinCode, nickname } = req.body;

  const project = projects.find(p => p.joinCode === joinCode);
  if (!project) return res.status(403).json({ error: "invalid code" });

  const count = members.filter(m => m.projectId === project.projectId).length;
  if (count >= 6) return res.status(403).json({ error: "project full" });

  const member = {
    memberId: memberSeq++,
    projectId: project.projectId,
    nickname
  };
  members.push(member);

  res.json(member);
});

/* ================= 전체 시간표 조회 (초기 로딩용) ================= */
app.get("/project/:projectId/timetable", (req, res) => {
  const projectId = Number(req.params.projectId);
  const result = timetables.filter(t => t.projectId === projectId);
  res.json(result);
});

/* ================= socket.io ================= */

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("🔌 socket connected", socket.id);

  socket.on("join-project", (projectId) => {
    socket.join(`project-${projectId}`);
  });

  socket.on("toggle-slot", (data) => {
    const { projectId, memberId, nickname, day, slot } = data;

    let cell = timetables.find(
      t => t.projectId === projectId && t.day === day && t.slot === slot
    );

    if (!cell) {
      cell = { projectId, day, slot, members: [] };
      timetables.push(cell);
    }

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
    console.log("❌ socket disconnected", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`✅ Server running http://localhost:${PORT}`);
});
