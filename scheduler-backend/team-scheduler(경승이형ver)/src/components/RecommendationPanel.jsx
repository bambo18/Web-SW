export default function RecommendationPanel({ blocks, onPick }) {
  return (
    <div className="panel">
      <div className="panelTitle">추천 가능 시간대</div>
      {blocks.length === 0 ? (
        <p className="muted">공통 가능 시간이 없습니다.</p>
      ) : (
        <div className="recList">
          {blocks.map((b, idx) => (
            <button key={idx} className="recItem" onClick={() => onPick?.(b)}>
              <div><strong>{b.day}</strong> {b.start} ~ {b.end}</div>
              <div className="muted">{Math.round((b.minutes / 60) * 10) / 10}시간</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
