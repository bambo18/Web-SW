const express = require("express");
const router = express.Router();

const store = require("../store");
const {
  projects,
  members,
  timetables,
  getNextProjectId,
  getNextMemberId,
  init: storeInit
} = store;

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
router.post("/project/create", async (req, res) => {
  console.log("🔥 /project/create API CALLED");

  try {
    // mysqlStore: getNextProjectId 는 async
    const projectId = await getNextProjectId();
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const project = { projectId, joinCode };

    // 프로젝트 저장
    if (typeof store.createProject === "function") {
      await store.createProject(project);
    } else {
      projects.push(project);
    }

    // 🔥 생성자는 자동 참가
    const memberId = await getNextMemberId();
    const nickname = req.body.nickname || "HOST";

    const member = { memberId, projectId, nickname };

    if (typeof store.createMember === "function") {
      await store.createMember(member);
    } else {
      members.push(member);
    }

    res.json({
      projectId,
      joinCode,
      memberId,
      inviteLink: `http://localhost:4000/?project=${projectId}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= 링크 참가 ================= */
router.post("/project/:projectId/join/link", (req, res) => {
  const projectId = Number(req.params.projectId);
  const { nickname } = req.body;

  const project = findProjectById(projectId);
  if (!project) {
    return res.status(404).json({ error: "project not found" });
  }

  if (typeof storeInit === "function" && storeInit.__initialized !== true) {
    const maybeInit = storeInit();
    if (maybeInit && typeof maybeInit.then === "function") maybeInit.catch(() => {});
    storeInit.__initialized = true;
  }

  if (isProjectFull(projectId)) {
    return res.status(403).json({ error: "project full" });
  }

  const maybeMemberId = getNextMemberId();

  const finalizeJoin = (memberId) => {
    const member = { memberId, projectId, nickname };
    if (typeof store.createMember === "function") {
      store.createMember(member)
        .then(() => res.json(member))
        .catch(err => res.status(500).json({ error: err.message }));
      return;
    }
    members.push(member);
    res.json(member);
  };

  if (maybeMemberId && typeof maybeMemberId.then === "function") {
    maybeMemberId.then(id => finalizeJoin(id))
                 .catch(err => res.status(500).json({ error: err.message }));
    return;
  }
  finalizeJoin(maybeMemberId);
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

  const maybeMemberId = getNextMemberId();
  const finalizeJoin = (memberId) => {
    const member = { memberId, projectId: project.projectId, nickname };
    if (typeof store.createMember === "function") {
      store.createMember(member)
        .then(() => res.json(member))
        .catch(err => res.status(500).json({ error: err.message }));
      return;
    }
    members.push(member);
    res.json(member);
  };

  if (maybeMemberId && typeof maybeMemberId.then === "function") {
    maybeMemberId.then(id => finalizeJoin(id))
                 .catch(err => res.status(500).json({ error: err.message }));
    return;
  }
  finalizeJoin(maybeMemberId);
});

/* ================= 전체 시간표 조회 ================= */
router.get("/project/:projectId/timetable", (req, res) => {
  const projectId = Number(req.params.projectId);
  res.json(timetables.filter(t => t.projectId === projectId));
});

/* ================= 빈 시간표 조회 ================= */
router.get("/project/:projectId/empty-slots", (req, res) => {
  const projectId = Number(req.params.projectId);

  const DAYS = [0, 1, 2, 3, 4];
  const SLOTS = Array.from({ length: 26 }, (_, i) => i);

  const result = [];

  for (const day of DAYS) {
    for (const slot of SLOTS) {
      const cell = timetables.find(
        t => t.projectId === projectId && t.day === day && t.slot === slot
      );
      if (!cell || cell.members.length === 0) {
        result.push({ day, slot });
      }
    }
  }

  res.json(result);
});

module.exports = router;
