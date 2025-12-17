# Copilot / AI agent instructions for Web-SW

Purpose: give an AI coding agent immediate, repo-specific context so it can be productive.

- **High-level architecture**:
  - Backend: Node/Express + Socket.IO at `scheduler-backend/server`. Entry: [scheduler-backend/server/server.js](scheduler-backend/server/server.js#L1).
  - Frontend: Vite + React app in `scheduler-backend/team-scheduler(경승이형ver)` (entry: [team-scheduler(경승이형ver)/src/main.jsx](scheduler-backend/team-scheduler(경승이형ver)/src/main.jsx#L1)).
  - Data: in-memory store at [scheduler-backend/server/store/memoryStore.js](scheduler-backend/server/store/memoryStore.js#L1) — volatile, no DB.

- **Why things are structured this way**:
  - This project is a demo scheduler: backend serves a small REST surface and real-time updates via Socket.IO; frontend currently contains a demo UI (uses dummy data in React) and a separate socket client dependency.
  - Simplicity and teachability: state is kept in-memory and utilities (e.g., `getOrCreateCell`) live in `server/utils`.

- **Key files & responsibilities**:
  - [scheduler-backend/server/app.js](scheduler-backend/server/app.js#L1): express setup and static hosting of `public/`.
  - [scheduler-backend/server/routes/project.routes.js](scheduler-backend/server/routes/project.routes.js#L1): REST API (create project, join by link/code, fetch timetables, empty-slot helper, health).
  - [scheduler-backend/server/socket/timetable.socket.js](scheduler-backend/server/socket/timetable.socket.js#L1): socket handlers and events (`join-project`, `toggle-slot`, `timetable-update`).
  - [scheduler-backend/server/store/memoryStore.js](scheduler-backend/server/store/memoryStore.js#L1): project/member/timetables arrays and id generators.
  - [scheduler-backend/team-scheduler(경승이형ver)/src/lib/timeGrid.js](scheduler-backend/team-scheduler(경승이형ver)/src/lib/timeGrid.js#L1): canonical time grid constants and `slotId()` mapping used across UI and logic.
  - [scheduler-backend/team-scheduler(경승이형ver)/src/lib/scheduleLogic.js](scheduler-backend/team-scheduler(경승이형ver)/src/lib/scheduleLogic.js#L1): recommendation logic for common availability.
  - [scheduler-backend/team-scheduler(경승이형ver)/src/components/ScheduleGrid.jsx](scheduler-backend/team-scheduler(경승이형ver)/src/components/ScheduleGrid.jsx#L1): grid interaction patterns — click toggles, drag toggles, `onToggle` semantics.

- **Important behavioral details (discoverable rules)**:
  - Max members per project: 6 (checked in `isProjectFull` and socket toggling prevents >6 members per cell).
  - `slotId(dayIndex, timeIndex)` uses `SLOTS_PER_DAY` (26) so index arithmetic must stay consistent between server "data index" and client UI.
  - Socket flow: clients emit `join-project` with `{ projectId, memberId }`, emit `toggle-slot` to change a cell; server broadcasts `timetable-update` for that cell.
  - `empty-slots` endpoint returns slots nobody has selected (server uses DAYS [0..4] and 26 slots per day — matches front-end constants).

- **Run / dev / debug commands**:
  - Backend: run from `scheduler-backend`:

    npm install
    npm start    # runs node server.js; server listens on port 4000

  - Frontend (Vite): run from `scheduler-backend/team-scheduler(경승이형ver)`:

    npm install
    npm run dev  # vite dev server

  - Notes: backend serves `public/` statically; the React app in `team-scheduler(경승이형ver)` is separate and uses `socket.io-client` if integrated.

- **Patterns for code changes**:
  - Prefer editing `server/utils/projectUtils.js` for shared business logic used by both HTTP routes and sockets.
  - Keep indexes and time constants consistent with `timeGrid.js` when modifying scheduling logic.
  - When adding persistence, migrate `memoryStore` to a module that keeps the same exported shape (`projects`, `members`, `timetables`, id getters) to minimize changes.

- **Testing & safety notes**:
  - There are no automated tests in the repo. Changes to server data manipulation should be validated by running the backend and using the endpoints or socket clients.
  - Be aware that `memoryStore` resets on server restart — any end-to-end tests should create required entities (projects/members) first.

- **When merging or changing behavior**:
  - Update both server and example frontend if you change API shapes; existing front-end code uses dummy data (see `RoomPage.jsx`) — consider wiring it to the backend endpoints in `project.routes.js` and `timetable.socket.js`.

If anything here is unclear or you want more detail (examples of small PRs, wiring the React demo to the backend, or adding persistence), tell me which area to expand.
