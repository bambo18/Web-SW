// 전역 상태 관리

let projectId = null;
let memberId  = null;

let joinCode   = null;
let inviteLink = null;

// 색상 관련
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
    colorMap[name] =
      palette[Object.keys(colorMap).length % palette.length];
  }
  return colorMap[name];
}
const socket = io();
