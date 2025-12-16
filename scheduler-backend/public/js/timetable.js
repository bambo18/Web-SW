const timetableEl = document.getElementById("timetable");

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

function toggleSlot(td){
  socket.emit("toggle-slot", {
    projectId,
    memberId,
    nickname: document.getElementById("nickname").value,
    day:  +td.dataset.d,
    slot: +td.dataset.s
  });
}

function renderCell(td, members){
  td.innerHTML = "";
  members.forEach(m => {
    const div = document.createElement("div");
    div.innerText = m.nickname;
    div.style.background = colorOf(m.nickname);
    td.appendChild(div);
  });
}

function loadTimetable(){
  apiLoadTimetable(projectId).then(data => {
    document
      .querySelectorAll("td[data-d]")
      .forEach(td => td.innerHTML = "");

    data.forEach(c => {
      const td = document.querySelector(
        `td[data-d="${c.day}"][data-s="${c.slot}"]`
      );
      if(td) renderCell(td, c.members);
    });
  });
}

socket.on("timetable-update", (cell) => {
  const td = document.querySelector(
    `td[data-d="${cell.day}"][data-s="${cell.slot}"]`
  );
  if (td) renderCell(td, cell.members);
});
