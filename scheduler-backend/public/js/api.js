// 서버 API 통신 전용 (기존 유지)

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
  }).then(async r => {
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "참가 실패");
    return data;
  });
}

function apiJoinByCode(joinCode, nickname) {
  return fetch("/project/join/code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ joinCode, nickname })
  }).then(async r => {
    const msg = await r.json();
    if (!r.ok) throw new Error(msg.error || "참가 실패");
    return msg;
  });
}

function apiLoadTimetable(projectId) {
  return fetch(`/project/${projectId}/timetable`).then(r => r.json());
}

// ❗기존에 있던 함수라 남겨두지만, 서버에 이 엔드포인트가 없으면 사용하지 마!
// (지금은 socket.emit("toggle-slot")로 처리)
function apiToggleSlot(data) {
  return fetch("/timetable/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json());
}

// (추가 기능) 빈 시간표 가져오기 - 아직 UI에 연결 안 해도 OK
function fetchEmptySlots(projectId) {
  return fetch(`/project/${projectId}/empty-slots`).then(r => r.json());
}
