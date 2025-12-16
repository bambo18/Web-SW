// socket 연결
const socket = io();

const timetableEl = document.getElementById("timetable");

// 시간표 그리기 (기존 유지)
function drawTable(){
  let html =
    "<tr><th>시간</th><th>월</th><th>화</th><th>수</th><th>목</th><th>금</th></tr>";

  for(let h = 9; h < 22; h++){
    for(let m of [0, 30]){
      const slot = (h - 9) * 2 + (m ? 1 : 0);

      html += `<tr>
        <th>${String(h).padStart(2,"0")}:${m ? "30" : "00"}</th>`;

      for(let d = 0; d < 5; d++){
        html += `<td data-d="${d}" data-s="${slot}" onclick="toggleSlot(this)"></td>`;
      }

      html += "</tr>";
    }
  }

  timetableEl.innerHTML = html;
}

// 셀 렌더링 (기존 색상 기능 복구/유지)
function renderCell(td, members){
  td.innerHTML = "";
  td.classList.remove("empty-slot"); // ✅ 추가

  (members || []).forEach(m => {
    const div = document.createElement("div");
    div.innerText = m.nickname;
    div.style.background = colorOf(m.nickname);
    td.appendChild(div);
  });
}


// 초기 로딩용
function loadTimetable(){
  showingEmpty = false; // 빈 시간표 모드 해제

  apiLoadTimetable(projectId).then(data => {
    // 🔥 모든 셀 완전 초기화
    document.querySelectorAll("td[data-d]").forEach(td => {
      td.innerHTML = "";
      td.classList.remove("empty-slot"); // ← 이 줄이 핵심
    });

    data.forEach(c => {
      const td = document.querySelector(
        `td[data-d="${c.day}"][data-s="${c.slot}"]`
      );
      if(td) renderCell(td, c.members);
    });
  });
}



function showEmptyTimetable(){
  showingEmpty = true;

  // 전체 셀 초기화
  document.querySelectorAll("td[data-d]").forEach(td => {
    td.innerHTML = "";
    td.classList.remove("empty-slot");
  });

  fetchEmptySlots(projectId).then(slots => {
    slots.forEach(({ day, slot }) => {
      const td = document.querySelector(
        `td[data-d="${day}"][data-s="${slot}"]`
      );
      if(td){
        td.classList.add("empty-slot");
        td.innerText = "비어있음";
      }
    });
  });
}

function toggleSlot(td){
  if (!projectId || !memberId) return;
  if (showingEmpty) return; // ✅ 추가

  socket.emit("toggle-slot", {
    projectId,
    memberId,
    nickname,
    day: Number(td.dataset.d),
    slot: Number(td.dataset.s)
  });
}

socket.on("timetable-update", (cell) => {
  if(showingEmpty) return; // ✅ 추가

  const td = document.querySelector(
    `td[data-d="${cell.day}"][data-s="${cell.slot}"]`
  );
  if (td) renderCell(td, cell.members);
});

