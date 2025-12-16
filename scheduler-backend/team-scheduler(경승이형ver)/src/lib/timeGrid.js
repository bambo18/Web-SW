export const DAYS = ["월", "화", "수", "목", "금"];

export const START_HOUR = 12;   // 데이터 기준 시작
export const END_HOUR = 21.5;    // 데이터 기준 끝(21:00)

export const VIEW_START_HOUR = 12; // ✅ 화면 기본 시작(12:00)

export const SLOTS_PER_DAY = (END_HOUR - START_HOUR) * 2; // 26
export const VIEW_START_INDEX = (VIEW_START_HOUR - START_HOUR) * 2; // 12시면 6
export const VIEW_SLOTS_PER_DAY = SLOTS_PER_DAY - VIEW_START_INDEX; // 20

export function timeLabels(startIndex = 0, count = SLOTS_PER_DAY) {
  const labels = [];
  for (let i = 0; i < count; i++) {
    const idx = startIndex + i;
    const minutesFromStart = idx * 30;
    const h = START_HOUR + Math.floor(minutesFromStart / 60);
    const m = minutesFromStart % 60;
    labels.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
  return labels;
}

export function slotId(dayIndex, timeIndex) {
  return dayIndex * SLOTS_PER_DAY + timeIndex; // timeIndex는 "데이터 기준 인덱스"
}

export function addMinutesToLabel(label, minutesToAdd) {
  const [hh, mm] = label.split(":").map(Number);
  const total = hh * 60 + mm + minutesToAdd;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
