import { useMemo, useState } from "react";

function randomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function JoinPage({ onEnter }) {
  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState("");

  const nick = nickname.trim();
  const canEnter = useMemo(() => nick.length >= 1, [nick]);
  const canJoin = canEnter && code.trim().length >= 4;

  return (
    <div className="page">
      <div className="card wide">
        <div className="header">
          <h1>팀 시간표 공유</h1>
          <p className="muted">닉네임만 입력하면 바로 참여할 수 있습니다.</p>
        </div>

        {/* 닉네임: 공통 입력 */}
        <label className="label">닉네임</label>
        <input
          className="input"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="예: 민수"
        />

        {/* 두 칸 레이아웃 */}
        <div className="split">
          {/* 참가하기 */}
          <div className="pane">
            <div className="paneTitle">참가하기</div>
            <p className="muted small">초대코드를 입력하고 참가합니다.</p>

            <label className="label">초대코드</label>
            <input
              className="input"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="예: AB12CD"
            />

            <button
              className="btn full"
              disabled={!canJoin}
              onClick={() => onEnter({ roomId: code.trim().toUpperCase(), nickname: nick })}
            >
              참가하기
            </button>
          </div>

          {/* 초대하기(프로젝트 생성) */}
          <div className="pane">
            <div className="paneTitle">초대하기</div>
            <p className="muted small">새 프로젝트를 만들고 초대코드를 공유합니다.</p>

            <button
              className="btn full primary"
              disabled={!canEnter}
              onClick={() => onEnter({ roomId: randomCode(), nickname: nick })}
            >
              프로젝트 만들기
            </button>

            <div className="hint muted">
              생성 후 상단의 코드 복사 버튼으로 팀원에게 전달하세요.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
