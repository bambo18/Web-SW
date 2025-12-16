import { useRef, useState } from "react";
import {
  DAYS,
  VIEW_START_INDEX,
  VIEW_SLOTS_PER_DAY,
  timeLabels,
  slotId,
} from "../lib/timeGrid";

export default function ScheduleGrid({
  mode,
  availability,
  commonAvailability,
  focusRange,
  onToggle, // ✅ 클릭 + 드래그 모두 toggle
}) {
  const times = timeLabels(VIEW_START_INDEX, VIEW_SLOTS_PER_DAY);
  const isEditable = mode === "edit";

  const [dragging, setDragging] = useState(false);
  const touchedRef = useRef(new Set());     // 드래그 중 중복 토글 방지
  const didDragRef = useRef(false);
  const downPosRef = useRef({ x: 0, y: 0 });

  const getOn = (dayIndex, timeIndex) => {
    const id = slotId(dayIndex, timeIndex);
    if (mode === "common") return !!commonAvailability?.[id];
    return !!availability?.[id];
  };

  const isFocused = (dayIndex, timeIndex) => {
    if (!focusRange) return false;
    if (focusRange.dayIndex !== dayIndex) return false;
    return (
      timeIndex >= focusRange.startIndex &&
      timeIndex < focusRange.endIndexExclusive
    );
  };

  const toggleOnce = (id) => {
    if (!isEditable) return;
    if (touchedRef.current.has(id)) return;
    touchedRef.current.add(id);
    onToggle?.(id); // ✅ 항상 invert
  };

  const start = (dayIndex, timeIndex, e) => {
    if (!isEditable) return;

    didDragRef.current = false;
    downPosRef.current = { x: e.clientX, y: e.clientY };
    touchedRef.current = new Set();
    setDragging(true);

    const id = slotId(dayIndex, timeIndex);
    toggleOnce(id); // ✅ 첫 칸도 즉시 invert
  };

  const move = (dayIndex, timeIndex, e) => {
    if (!dragging) return;

    const dx = Math.abs(e.clientX - downPosRef.current.x);
    const dy = Math.abs(e.clientY - downPosRef.current.y);
    if (dx + dy >= 3) didDragRef.current = true;

    const id = slotId(dayIndex, timeIndex);
    toggleOnce(id);
  };

  const end = () => {
    setDragging(false);
    touchedRef.current = new Set();
  };

  return (
    <div className="gridWrap">
      <div className="grid2" style={{ userSelect: "none", touchAction: "none" }}>
        <div className="corner" />
        {DAYS.map((d) => (
          <div key={d} className="dayTopHeader">{d}</div>
        ))}

        {times.map((t, viewRow) => {
          const timeIndex = VIEW_START_INDEX + viewRow;
          return (
            <div key={t} className="timeRow">
              <div className="timeSideHeader">{t}</div>

              {DAYS.map((_, dayIndex) => {
                const id = slotId(dayIndex, timeIndex);
                const on = getOn(dayIndex, timeIndex);
                const focused = isFocused(dayIndex, timeIndex);

                return (
                  <button
                    key={id}
                    className={
                      "cell " +
                      (on ? "on " : "off ") +
                      (isEditable ? "clickable " : "disabled ") +
                      (focused ? "focused " : "")
                    }
                    onPointerDown={(e) => start(dayIndex, timeIndex, e)}
                    onPointerEnter={(e) => move(dayIndex, timeIndex, e)}
                    onPointerUp={end}
                    onPointerCancel={end}
                    title={isEditable ? "클릭/드래그: 토글" : "조회 전용"}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
