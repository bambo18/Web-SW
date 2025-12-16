// 서버 API 통신 전용

function apiCreateProject() {
  return fetch("/project/create", {
    method: "POST"
  }).then(r => r.json());
}

function apiJoinByLink(projectId, nickname) {
  return fetch(`/project/${projectId}/join/link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nickname })
  }).then(r => r.json());
}

function apiJoinByCode(joinCode, nickname) {
  return fetch("/project/join/code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ joinCode, nickname })
  }).then(async r => {
    if (!r.ok) {
      const msg = await r.json();
      throw new Error(msg.error || "참가 실패");
    }
    return r.json();
  });
}

function apiLoadTimetable(projectId) {
  return fetch(`/project/${projectId}/timetable`)
    .then(r => r.json());
}

function apiToggleSlot(data) {
  return fetch("/timetable/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json());
}
