// ================================
// UI / 화면 전환 & 버튼 로직
// ================================

// HTML 요소 캐싱
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
// 입장
// ----------------
function enter(){
  const nickname = nicknameInput.value.trim();
  if(!nickname) {
    alert("아이디 입력");
    return;
  }

  const pid = new URLSearchParams(location.search).get("project");

  if(pid){
    apiJoinByLink(pid, nickname).then(d => {
      projectId = d.projectId;
      memberId  = d.memberId;
      showTable();
    });
  } else {
    mainScreen.classList.add("hidden");
    menuScreen.classList.remove("hidden");
    welcomeText.innerText = `${nickname}님 환영합니다`;
  }
}

// ----------------
// 프로젝트 생성
// ----------------
function createProject(){
  apiCreateProject().then(d => {
    projectId  = d.projectId;
    joinCode   = d.joinCode;
    inviteLink = d.inviteLink;

    shareCode.value = joinCode;
    shareLink.value = inviteLink;

    return apiJoinByLink(projectId, nicknameInput.value);
  }).then(m => {
    memberId = m.memberId;
    showTable();
  });
}

// ----------------
// 참가 코드로 참가
// ----------------
function joinByCode(){
  const code = joinCodeInput.value.trim();
  if(!code){
    alert("참가 코드를 입력하세요");
    return;
  }

  apiJoinByCode(code, nicknameInput.value)
    .then(d => {
      projectId = d.projectId;
      memberId  = d.memberId;
      showTable();
    })
    .catch(err => alert(err.message));
}

// ----------------
// 시간표 화면 표시
// ----------------
function showTable(){
  mainScreen.classList.add("hidden");
  menuScreen.classList.add("hidden");
  timetableScreen.classList.remove("hidden");

  drawTable();
  loadTimetable();

  setInterval(loadTimetable, 3000);
}

// ----------------
// 공유 모달
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
