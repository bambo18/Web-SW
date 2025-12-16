export default function MemberList({ members, selectedUserId, onSelect }) {
  return (
    <div className="panel">
      <div className="panelTitle">팀원</div>
      <div className="memberList">
        {members.map((m) => (
          <button
            key={m.userId}
            className={"memberItem " + (m.userId === selectedUserId ? "active" : "")}
            onClick={() => onSelect(m.userId)}
          >
            <span className="dot" />
            {m.nickname}
            {m.isMe ? <span className="badge">나</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
