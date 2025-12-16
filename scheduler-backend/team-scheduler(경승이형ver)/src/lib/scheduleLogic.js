import { DAYS, SLOTS_PER_DAY, timeLabels, addMinutesToLabel } from "./timeGrid";

export function createDefaultAvailability(value = true) {
  return Array.from({ length: DAYS.length * SLOTS_PER_DAY }, () => value);
}

export function computeCommonAvailability(memberAvailabilities) {
  if (!memberAvailabilities || memberAvailabilities.length === 0) return null;

  const len = memberAvailabilities[0].length;
  const common = Array.from({ length: len }, () => true);

  for (let i = 0; i < len; i++) {
    for (let m = 0; m < memberAvailabilities.length; m++) {
      if (!memberAvailabilities[m][i]) {
        common[i] = false;
        break;
      }
    }
  }
  return common;
}

export function findRecommendedBlocks(commonAvailability, minSlots = 2, topN = 8) {
  if (!commonAvailability) return [];

  const labels = timeLabels();
  const results = [];

  for (let dayIndex = 0; dayIndex < DAYS.length; dayIndex++) {
    const base = dayIndex * SLOTS_PER_DAY;
    let i = 0;

    while (i < SLOTS_PER_DAY) {
      if (!commonAvailability[base + i]) { i++; continue; }

      let j = i;
      while (j < SLOTS_PER_DAY && commonAvailability[base + j]) j++;

      const length = j - i;
      if (length >= minSlots) {
        const startLabel = labels[i];
        const endLabel = addMinutesToLabel(labels[j - 1], 30);
        results.push({
          dayIndex,
          day: DAYS[dayIndex],
          startIndex: i,
          endIndexExclusive: j,
          start: startLabel,
          end: endLabel,
          slots: length,
          minutes: length * 30,
        });
      }
      i = j;
    }
  }

  results.sort((a, b) => {
    if (b.slots !== a.slots) return b.slots - a.slots;
    if (a.dayIndex !== b.dayIndex) return a.dayIndex - b.dayIndex;
    return a.startIndex - b.startIndex;
  });

  return results.slice(0, topN);
}
