const express = require("express");
const router = express.Router();

const {
  projects,
  members,
  timetables,
  getNextProjectId,
  getNextMemberId
} = require("../store/memoryStore");

const {
  findProjectById,
  findProjectByCode,
  isProjectFull
} = require("../utils/projectUtils");

/* ================= 헬스 체크 ================= */
router.get("/health", (req, res) => {
  res.json({ ok: true });
});

/* ================= 프로젝트 생성 ================= */
router.post("/project/create", (req, res) => {
  const projectId = getNextProjectId();
  const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  projects.push({ projectId, joinCode });

  res.json({
    projectId,
    joinCode,
    inviteLink: `http://localhost:4000/?project=${projectId}`
  });
});

/* ================= 링크 참가 ================= */
router.post("/project/:projectId/join/link", (req, res) => {
  const projectId = Number(req.params.projectId);
  const { nickname } = req.body;

  const project = findProjectById(projectId);
  if (!project) {
    return res.status(404).json({ error: "project not found" });
  }

  if (isProjectFull(projectId)) {
    return res.status(403).json({ error: "project full" });
  }

  const member = {
    memberId: getNextMemberId(),
    projectId,
    nickname
  };
  members.push(member);

  res.json(member);
});

/* ================= 코드 참가 ================= */
router.post("/project/join/code", (req, res) => {
  const { joinCode, nickname } = req.body;

  const project = findProjectByCode(joinCode);
  if (!project) {
    return res.status(403).json({ error: "invalid code" });
  }

  if (isProjectFull(project.projectId)) {
    return res.status(403).json({ error: "project full" });
  }

  const member = {
    memberId: getNextMemberId(),
    projectId: project.projectId,
    nickname
  };
  members.push(member);

  res.json(member);
});

/* ================= 전체 시간표 조회 ================= */
router.get("/project/:projectId/timetable", (req, res) => {
  const projectId = Number(req.params.projectId);
  res.json(timetables.filter(t => t.projectId === projectId));
});

/* ================= 빈 시간표 조회 (추가 기능) ================= */
router.get("/project/:projectId/empty-slots", (req, res) => {
  const projectId = Number(req.params.projectId);

  // ✅ 프론트 / socket 기준과 통일
  const DAYS = [0, 1, 2, 3, 4];          // 월~금
  const SLOTS = Array.from({ length: 26 }, (_, i) => i); // 09:00~21:30

  const result = [];

  for (const day of DAYS) {
    for (const slot of SLOTS) {
      const cell = timetables.find(
        t =>
          t.projectId === projectId &&
          t.day === day &&
          t.slot === slot
      );

      // ✅ 아무도 선택 안 한 슬롯만
      if (!cell || cell.members.length === 0) {
        result.push({ day, slot });
      }
    }
  }

  res.json(result);
});

module.exports = router;
