import { useState } from "react";
import JoinPage from "./pages/JoinPage";
import RoomPage from "./pages/RoomPage";
import "./styles.css";

export default function App() {
  const [session, setSession] = useState(null); // { roomId, nickname }

  if (!session) {
    return <JoinPage onEnter={(s) => setSession(s)} />;
  }

  return (
    <RoomPage
      roomId={session.roomId}
      nickname={session.nickname}
      onExit={() => setSession(null)}
    />
  );
}
