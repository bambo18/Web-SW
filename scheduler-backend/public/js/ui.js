// ================================
// UI / 화면 전환 & 버튼 로직 (기존 유지)
// ================================

const mainScreen      = document.getElementById("mainScreen");
const menuScreen      = document.getElementById("menuScreen");
const timetableScreen = document.getElementById("timetableScreen");

const nicknameInput   = document.getElementById("nickname");
const joinCodeInput   = document.getElementById("joinCodeInput");
const welcomeText     = document.getElementById("welcome");

const shareModal = document.getElementById("shareModal");
const shareCode  = document.getElementById("shareCode");
const shareLink  = document.getElementById("shareLink");

// ----------------
// 입장 (기존 유지 + nickname 전역 저장)
// ----------------
function enter(){
  const nick = nicknameInput.value.trim();
  if(!nick) {
    alert("아이디 입력");
    return;
  }
  nickname = nick; // ✅ state.js 전역 변수에 저장

  const pid = new URLSearchParams(location.search).get("project");

  if(pid){
    apiJoinByLink(pid, nickname).then(d => {
      projectId = d.projectId;
      memberId  = d.memberId;
      showTable();
    }).catch(e => alert(e.message));
  } else {
    mainScreen.classList.add("hidden");
    menuScreen.classList.remove("hidden");
    welcomeText.innerText = `${nickname}님 환영합니다`;
  }
}

// ----------------
// 프로젝트 생성 (기존 유지)
// ----------------
function createProject(){
  apiCreateProject().then(d => {
    projectId  = d.projectId;
    joinCode   = d.joinCode;
    inviteLink = d.inviteLink;

    // ✅ 공유 모달 값 세팅 유지
    shareCode.value = joinCode;
    shareLink.value = inviteLink;

    return apiJoinByLink(projectId, nicknameInput.value.trim());
  }).then(m => {
    memberId = m.memberId;
    nickname = nicknameInput.value.trim(); // 안전하게 한번 더
    showTable();
  }).catch(e => alert(e.message));
}

// ----------------
// 참가 코드로 참가 (기존 유지)
// ----------------
function joinByCode(){
  const code = joinCodeInput.value.trim();
  if(!code){
    alert("참가 코드를 입력하세요");
    return;
  }

  nickname = nicknameInput.value.trim();

  apiJoinByCode(code, nickname)
    .then(d => {
      projectId = d.projectId;
      memberId  = d.memberId;
      showTable();
    })
    .catch(err => alert(err.message));
}

// ----------------
// 시간표 화면 표시 (기존 유지 + ✅ join-project payload 수정)
// ----------------
function showTable(){
  mainScreen.classList.add("hidden");
  menuScreen.classList.add("hidden");
  timetableScreen.classList.remove("hidden");

  drawTable();
  loadTimetable();

  // ✅ 서버쪽 disconnect 자동제거가 memberId를 알아야 해서 payload로 보냄
  socket.emit("join-project", { projectId, memberId });
}

// ----------------
// 공유 모달 (기존 유지)
// ----------------
function openShare(){
  shareModal.style.display = "flex";
}

function closeShare(){
  shareModal.style.display = "none";
}

function copyShare(){
  navigator.clipboard.writeText(shareLink.value);
}
function showAllTimetable(){
  if(showingEmpty){
    showingEmpty = false;
    loadTimetable();        // 원래 시간표로 복귀
  } else {
    showEmptyTimetable();   // 빈 시간표 표시
  }
}

