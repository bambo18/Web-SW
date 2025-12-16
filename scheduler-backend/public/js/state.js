// 전역 상태 관리 (기존 방식 유지)
let projectId = null;
let memberId  = null;

let joinCode   = null;
let inviteLink = null;

let nickname = ""; // ✅ 추가: 입장 시 저장해두기
let showingEmpty = false; // ✅ 빈 시간표 표시 중인지 여부

// 색상 관련 (기존 유지)
const palette = [
  "#c7d2fe",
  "#bbf7d0",
  "#fde68a",
  "#fecaca",
  "#ddd6fe",
  "#bae6fd"
];

const colorMap = {};

function colorOf(name){
  if(!colorMap[name]){
    colorMap[name] = palette[Object.keys(colorMap).length % palette.length];
  }
  return colorMap[name];
}
