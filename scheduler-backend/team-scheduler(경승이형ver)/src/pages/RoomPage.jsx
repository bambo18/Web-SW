import { useMemo, useState } from "react";
import MemberList from "../components/MemberList";
import ScheduleGrid from "../components/ScheduleGrid";
import RecommendationPanel from "../components/RecommendationPanel";
import {
  createDefaultAvailability,
  computeCommonAvailability,
  findRecommendedBlocks,
} from "../lib/scheduleLogic";

function makeUser(userId, nickname, isMe = false) {
  return { userId, nickname, isMe };
}

export default function RoomPage({ roomId, nickname, onExit }) {
  // 더미 팀원
  const [members] = useState(() => [
    makeUser("me", nickname, true),
    makeUser("u2", "팀원A"),
    makeUser("u3", "팀원B"),
  ]);

  // 더미 스케줄
  const [schedules, setSchedules] = useState(() => {
    const me = createDefaultAvailability(true);
    const a = createDefaultAvailability(true);
    const b = createDefaultAvailability(true);

    // 예시로 몇 구간 막아두기
    for (let i = 10; i < 16; i++) a[i] = false;
    for (let i = 30; i < 40; i++) b[i] = false;

    return { me, u2: a, u3: b };
  });

  const [mode, setMode] = useState("edit"); // edit | common
  const [selectedUserId, setSelectedUserId] = useState("me");
  const [focusRange, setFocusRange] = useState(null);

  // 공통 가능 시간 계산(전체 멤버 기준)
  const common = useMemo(() => {
    const avails = members.map((m) => schedules[m.userId]).filter(Boolean);
    return computeCommonAvailability(avails);
  }, [members, schedules]);

  const blocks = useMemo(() => findRecommendedBlocks(common, 2, 5), [common]);

  // ✅ 현재 화면에 보여줄 스케줄(선택된 팀원)
  const viewingAvailability = useMemo(() => {
    return schedules[selectedUserId] ?? schedules.me;
  }, [schedules, selectedUserId]);

  // ✅ '나' 선택 + edit 모드일 때만 편집 허용
  const canEdit = mode === "edit" && selectedUserId === "me";

  // ✅ 클릭: 토글 (나만)
  const toggleSlot = (slotId) => {
    if (!canEdit) return;

    setSchedules((prev) => {
      const next = { ...prev };
      const cur = [...next.me];
      cur[slotId] = !cur[slotId];
      next.me = cur;
      return next;
    });
  };

  // ✅ 드래그: 값 고정 설정 (나만)
  const setSlot = (slotId, value) => {
    if (!canEdit) return;

    setSchedules((prev) => {
      const next = { ...prev };
      const cur = [...next.me];
      cur[slotId] = value; // 토글이 아니라 "설정"
      next.me = cur;
      return next;
    });
  };

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      alert("초대코드를 복사했습니다.");
    } catch {
      alert("복사 실패. 코드: " + roomId);
    }
  };

  return (
    <div className="room">
      <div className="topbar">
        <div className="topLeft">
          <strong>프로젝트</strong> <span className="code">{roomId}</span>
          <button className="btn small" onClick={copyInvite}>복사</button>
        </div>
        <div className="topRight">
          <button
            className={"btn small " + (mode === "edit" ? "primary" : "")}
            onClick={() => setMode("edit")}
          >
            내 일정
          </button>
          <button
            className={"btn small " + (mode === "common" ? "primary" : "")}
            onClick={() => setMode("common")}
          >
            공통 시간
          </button>
          <button className="btn small" onClick={onExit}>나가기</button>
        </div>
      </div>

      <div className="layout">
        <div className="sidebar">
          <MemberList
            members={members}
            selectedUserId={selectedUserId}
            onSelect={(id) => {
              setSelectedUserId(id);
              setFocusRange(null);
            }}
          />

          <RecommendationPanel
            blocks={blocks}
            onPick={(b) =>
              setFocusRange({
                dayIndex: b.dayIndex,
                startIndex: b.startIndex,
                endIndexExclusive: b.endIndexExclusive,
              })
            }
          />
        </div>

        <div className="main">
          {mode === "edit" && selectedUserId !== "me" ? (
            <p className="muted">현재는 팀원 일정 조회 중입니다. (수정 불가)</p>
          ) : null}

          <ScheduleGrid
            mode={mode}
            availability={viewingAvailability}
            commonAvailability={common}
            focusRange={focusRange}
            onToggle={toggleSlot}  // ✅ 클릭 토글
            onSet={setSlot}        // ✅ 드래그 일괄
            canEdit={canEdit}      // (ScheduleGrid에서 클릭/드래그 허용 판단용)
          />
        </div>
      </div>
    </div>
  );
}
