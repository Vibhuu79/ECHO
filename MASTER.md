# 🔊 ECHO — Master Progress Document

> **⚠️ AGENT DIRECTIVE: Any agent working on this project MUST read this document IN FULL before starting any phase, iteration, or task. This is the single source of truth for project context and progress.**

---

## Project Identity

| Field | Value |
|-------|-------|
| **Name** | Echo |
| **Tagline** | Talk beyond hesitation. |
| **Type** | Context-aware anonymous nearby interaction platform |
| **Core Problem** | People in shared spaces (colleges, offices) want to connect with those around them but hesitate because they don't know how to start a conversation. |
| **What Echo IS** | A social barrier-breaking tool. Anonymous, nearby, context-aware. |
| **What Echo is NOT** | Not a dating app. Not social media. Not a messaging replacement. |

---

## Documentation Reference

All detailed documentation lives in [`docs/`](file:///g:/My%20Projects/Echo/docs). **Read the relevant doc before working on its phase.**

| # | Document | Path | Read Before Phase |
|---|----------|------|-------------------|
| 1 | Product Vision | [Vision.md](file:///g:/My%20Projects/Echo/docs/Vision.md) | All phases |
| 2 | Features | [Features.md](file:///g:/My%20Projects/Echo/docs/Features.md) | All phases |
| 3 | User Flows | [UserFlow.md](file:///g:/My%20Projects/Echo/docs/UserFlow.md) | Phase 1+ |
| 4 | Architecture | [Architecture.md](file:///g:/My%20Projects/Echo/docs/Architecture.md) | Phase 0 |
| 5 | Database Schema | [Database.md](file:///g:/My%20Projects/Echo/docs/Database.md) | Phase 0, 1 |
| 6 | REST API | [API.md](file:///g:/My%20Projects/Echo/docs/API.md) | Phase 1+ |
| 7 | Real-time / Sockets | [Realtime.md](file:///g:/My%20Projects/Echo/docs/Realtime.md) | Phase 2, 3 |
| 8 | Privacy & Safety | [Privacy-Safety.md](file:///g:/My%20Projects/Echo/docs/Privacy-Safety.md) | Phase 1, 6 |
| 9 | UI/UX Design | [UI-UX.md](file:///g:/My%20Projects/Echo/docs/UI-UX.md) | All phases |
| 10 | Roadmap | [Roadmap.md](file:///g:/My%20Projects/Echo/docs/Roadmap.md) | All phases |
| 11 | UI/UX & Tech Changelog | [PROJECT_CHANGELOG.md](file:///g:/My%20Projects/Echo/PROJECT_CHANGELOG.md) | All phases |

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend** | React + TypeScript (Vite) | Web app, mobile-first responsive |
| **Styling** | CSS (modern, minimal, dark-mode-first) | Glassmorphism, micro-animations |
| **Backend** | Node.js + Express.js | Modular / feature-based structure |
| **Database** | MongoDB (Mongoose ODM) | 2dsphere indexes for geospatial |
| **Real-time** | Socket.IO | Chat, presence, waves, sparks |
| **Cache/Presence** | Redis | Online status, typing, rate limits, trust scores |
| **Auth** | Email OTP + JWT (access + refresh tokens) | No passwords. Nodemailer or Resend. |
| **Notifications** | Firebase Cloud Messaging (FCM) | Push notifications (Phase 7) |
| **Location** | Browser Geolocation API + MongoDB geospatial | Never expose exact GPS coordinates |

---

## V1 MVP Feature Summary

### 3 Main Tabs: **Nearby** | **Sparks** | **Saved**

#### Identity
- Email OTP login (any email, no password)
- Username (3-20 chars, not unique) + EchoID (6-char, unique, backend-generated, e.g. `#A8KD2F`)
- Tap username → shows EchoID
- No bio, no profile pic, no followers — nothing identifiable

#### Discovery (Nearby Tab)
- GPS + Geofencing + Movement Detection
- Distance always rounded: 50m / 100m / 150m / 250m / 500m
- Context-aware labels: Library, Cafeteria, IT Building, etc.
- Echo Presence: Active Now / X min ago / Away
- Mood: 🙂 Chill | 📚 Studying | ☕ Coffee Break | 💻 Coding | 😴 Bored | 🎮 Gaming | 😄 Free

#### Interaction
- **Wave 👋** — low-pressure initiation (no DM without wave)
- **Ice Breakers** — static suggestions, editable, sent with wave
- **Message Request** — Accept / Ignore / Block

#### Chat
- Real-time 1-on-1 (text + emojis only)
- Conversation Timer: infinite → 10 min inactivity → sleeping → "Continue?"
- Conversation Save: both agree → permanent (Saved tab), else deleted
- Auto-archive: 24h inactive → archive → delete after 30 days

#### Sparks (Sparks Tab)
- Intent posts: "Anyone for chai?", "Need React help"
- Visible within ~200m
- Tap → mini room (max 20 members, timer: 10/20/30 min / 1 hour)
- Auto-delete on timer expiry

#### Safety
- Hidden Trust Score (backend, 0-100, affects permissions)
- Report / Block / Mute
- Bad words filter, spam detection, rate limiting
- Secret Compliment (1/day, template-based, positive only)

---

## Phase Progress Tracker

### Phase 0: Foundation (Week 1-2)
- **Status:** `COMPLETED`
- **Target:** Project setup, dev environment, CI/CD
- **Deliverables:**
  - [x] Vite + React + TypeScript project setup
  - [x] Node.js + Express backend setup
  - [x] MongoDB connection & initial schema
  - [x] Redis setup
  - [x] Project folder structure (feature-based modules)
  - [x] Environment config (.env, dev/prod)
  - [x] Basic CI/CD pipeline
  - [x] ESLint + Prettier configuration
  - [x] Git repo initialization
- **Dependencies:** None
- **Docs to Read:** [Architecture.md](file:///g:/My%20Projects/Echo/docs/Architecture.md), [Database.md](file:///g:/My%20Projects/Echo/docs/Database.md)
- **Notes:**
  - Configured MongoDB Atlas & Redis Cloud connections.
  - Implemented `/api/v1/health` route verifying Express, MongoDB Atlas, and Redis Cloud status.
  - Created modular feature folder structures in both server/ and client/.

---

### Phase 1: Authentication & Identity (Week 2-3)
- **Status:** `COMPLETED`
- **Target:** Email OTP auth, username + EchoID, JWT tokens
- **Deliverables:**
  - [x] OTP send/verify API
  - [x] JWT access + refresh token system
  - [x] Username input + validation (3-20 chars)
  - [x] EchoID generation (6-char, cryptographically random)
  - [x] Auth middleware
  - [x] User model (MongoDB)
  - [x] Onboarding UI (email → OTP → username → home)
  - [x] Login flow for returning users
- **Dependencies:** Phase 0
- **Docs to Read:** [API.md](file:///g:/My%20Projects/Echo/docs/API.md) (Auth module), [UserFlow.md](file:///g:/My%20Projects/Echo/docs/UserFlow.md) (Onboarding + Login flows), [Privacy-Safety.md](file:///g:/My%20Projects/Echo/docs/Privacy-Safety.md)
- **Notes:**
  - Implemented Redis key-value OTP storage with 5-minute TTL & rate-limiting (3 requests per 5 min).
  - Implemented dual-token JWT system (15m access token, 7d refresh token with rotation).
  - Implemented cryptographic EchoID generator (`#` + 6 uppercase alphanumeric characters).
  - Created glassmorphism onboarding UI in React with live username identity preview.

---

### Phase 2: Discovery & Presence (Week 3-5)
- **Status:** `COMPLETED`
- **Target:** Nearby user discovery, location, mood, presence
- **Deliverables:**
  - [x] Browser Geolocation API integration
  - [x] MongoDB 2dsphere geospatial queries
  - [x] Nearby users endpoint (with distance rounding)
  - [x] Context-aware location labels (geofencing)
  - [x] Mood selection & display
  - [x] Echo Presence via Redis (online/away/offline)
  - [x] Nearby tab UI (user cards with distance, mood, presence)
  - [x] Pull-to-refresh
- **Dependencies:** Phase 1
- **Docs to Read:** [Realtime.md](file:///g:/My%20Projects/Echo/docs/Realtime.md), [API.md](file:///g:/My%20Projects/Echo/docs/API.md) (Discovery module), [UI-UX.md](file:///g:/My%20Projects/Echo/docs/UI-UX.md)
- **Notes:**
  - Implemented MongoDB `$geoNear` aggregation pipeline for nearby discovery within 500m radius.
  - Built strict privacy distance rounding engine (`~50m`, `~100m`, `~150m`, `~250m`, `~500m`) ensuring raw GPS coordinates are NEVER serialized to frontend clients.
  - Built ITM University campus geofencing engine mapping user coordinates to Central Library, Engineering & Tech Block, Central Cafeteria, Sports Complex, Student Quad, and Campus Hostel Complex.
  - Implemented Redis key-value presence state management (`presence:{userId}`) and Socket.IO real-time presence events (`user:online`, `user:away`, `user:offline`, `user:mood-update`).
  - Created glassmorphic React `NearbyTab` with mood filtering, user cards, radar scanning pull-to-refresh, and GPS permission error handlers.


---

### Phase 3: Wave & Chat (Week 5-8)
- **Status:** `COMPLETED`
- **Target:** Wave system, ice breakers, real-time 1-on-1 chat
- **Deliverables:**
  - [x] Socket.IO server + client setup
  - [x] Wave send/receive API + socket events
  - [x] Wave notification UI
  - [x] Ice Breaker database + selection UI
  - [x] Real-time 1-on-1 chat
  - [x] Chat UI (bubbles, emoji picker, typing indicator)
  - [x] Conversation timer (inactivity → sleeping → continue?)
  - [x] Message history with pagination
- **Dependencies:** Phase 1, Phase 2
- **Docs to Read:** [Realtime.md](file:///g:/My%20Projects/Echo/docs/Realtime.md), [API.md](file:///g:/My%20Projects/Echo/docs/API.md) (Wave + Chat modules), [UserFlow.md](file:///g:/My%20Projects/Echo/docs/UserFlow.md) (Wave & Chat flow)
- **Notes:**
  - Implemented Wave REST & Socket.IO handlers for send, receive, accept, ignore, and block actions with Redis rate-limiting (max 10 waves/hr).
  - Seeded static Icebreakers in MongoDB with category filters and integrated selection modal when sending waves.
  - Implemented 1-on-1 real-time chat with Socket.IO rooms (`chat:{conversationId}` and `user:{userId}`), debounced typing indicators, and cursor pagination for message history.
  - Built background Conversation Inactivity Worker monitoring chats inactive > 10m, automatically transitioning state to `sleeping` and pushing real-time `chat:sleeping` events with "Continue?" wakeup support.
  - Created glassmorphic React `ChatWindow`, `MessageBubble`, `TypingIndicator`, `EmojiPicker`, `SleepingBanner`, `SendWaveModal`, `PendingWavesModal`, and global `SocketProvider`.

---

### Phase 4: Conversation Lifecycle (Week 8-9)
- **Status:** `COMPLETED`
- **Target:** Save flow, auto-archive, auto-delete, saved tab
- **Deliverables:**
  - [x] Conversation Save flow (mutual agreement)
  - [x] Saved conversations tab UI
  - [x] Auto-archive (24h inactivity → archive)
  - [x] Auto-delete (30 days → permanent delete)
  - [x] Cron jobs / TTL indexes for lifecycle management
  - [x] Chat state transitions (active → sleeping → archived → saved/deleted)
- **Dependencies:** Phase 3
- **Docs to Read:** [UserFlow.md](file:///g:/My%20Projects/Echo/docs/UserFlow.md) (Conversation Save + Chat Lifecycle), [Database.md](file:///g:/My%20Projects/Echo/docs/Database.md) (TTL strategy)
- **Notes:**
  - Implemented mutual agreement save system with real-time `chat:save-requested` & `chat:saved` Socket events and peer alert banner in `ChatWindow`.
  - Built unified server `LifecycleWorker` managing 10m inactivity sleeping, 24h auto-archiving, and 30-day message purge.
  - Created standalone glassmorphic `SavedTab.tsx` React component with contact search, presence/mood indicators, and delete connection handlers.

---

### Phase 5: Sparks (Week 9-11)
- **Status:** `COMPLETED`
- **Target:** Spark creation, discovery, rooms, timers
- **Deliverables:**
  - [x] Spark creation API + UI
  - [x] Nearby sparks discovery (geospatial query, ~200m)
  - [x] Spark mini rooms (group chat, max 20)
  - [x] Timer system (10/20/30 min / 1 hour)
  - [x] Auto-expiry + cleanup
  - [x] Sparks tab UI (feed + room view)
  - [x] Socket events for spark rooms
- **Dependencies:** Phase 2, Phase 3
- **Docs to Read:** [API.md](file:///g:/My%20Projects/Echo/docs/API.md) (Sparks module), [Realtime.md](file:///g:/My%20Projects/Echo/docs/Realtime.md) (Spark events), [UserFlow.md](file:///g:/My%20Projects/Echo/docs/UserFlow.md) (Sparks flow)
- **Notes:**
  - Mongoose `Spark` schema with 2dsphere index on `location` and `SparkMessage` schema with compound `{ sparkId: 1, createdAt: 1 }` index.
  - REST API: `POST /api/sparks`, `GET /api/sparks/nearby` (`$geoNear` 200m radius query + privacy distance bucket rounding), `POST /api/sparks/:id/join` (atomic 20-member cap guard), `POST /api/sparks/:id/leave`, `DELETE /api/sparks/:id`, `GET /api/sparks/:id/messages`.
  - Server-side `SparkWorker` background engine running every 10s for 1-minute expiration warning (`spark:expiring`) and room expiry (`spark:expired`).
  - Real-time Socket.IO room handlers (`spark:{sparkId}`) for group chat messages, typing indicators, member joins, and leaves.
  - Glassmorphic React UI: `SparksTab.tsx` (sparks feed + radar status), `CreateSparkModal.tsx` (intent text + suggestion chips + 10m/20m/30m/1h duration selector), and `SparkRoomModal.tsx` (countdown timer + member list drawer + multi-user chat feed).

---

### Phase 6: Trust & Safety (Week 11-12)
- **Status:** `COMPLETED`
- **Target:** Trust score, report/block/mute, content moderation
- **Deliverables:**
  - [x] Trust Score engine (backend, hidden)
  - [x] Score increase/decrease rules
  - [x] Permission gating based on trust score
  - [x] Report system (categories, admin queue)
  - [x] Block/Mute system
  - [x] Bad words filter
  - [x] Rate limiting (waves, messages, sparks)
- **Dependencies:** Phase 3, Phase 5
- **Docs to Read:** [Privacy-Safety.md](file:///g:/My%20Projects/Echo/docs/Privacy-Safety.md), [API.md](file:///g:/My%20Projects/Echo/docs/API.md) (Moderation module)
- **Notes:**
  - Implemented hidden Trust Score engine (`TrustService`) adjusting scores [0-100] and enforcing permission tiers (80-100 Excellent, 60-79 Good, 40-59 Restricted, <40 Banned).
  - Implemented Mongoose `Report` model and `ModerationService` for categorized reports, target trust score penalties, and false report abuse detection.
  - Implemented bi-directional block filtering in MongoDB `$geoNear` discovery pipeline and block/mute REST APIs (`POST /api/reports`, `POST /api/blocks`, `DELETE /api/blocks/:echoId`, `POST /api/mutes`, `DELETE /api/mutes/:echoId`).
  - Built high-performance `ContentFilterService` with l33tsp34k normalization and compiled regex filter integrated into Wave, Chat Socket, and Spark Socket messaging.
  - Built glassmorphic React components `ReportModal.tsx` and `SafetySettingsModal.tsx` with safety dropdown menus in `UserCard.tsx`, `ChatWindow.tsx`, and `App.tsx`.

---

### Phase 7: Polish & Extras (Week 12-14)
- **Status:** `COMPLETED`
- **Target:** Compliment feature, animations, notifications, testing
- **Deliverables:**
  - [x] Secret Compliment feature (1/day, template-based)
  - [x] UI polish: animations, transitions, micro-interactions
  - [x] Loading states, empty states, error states
  - [x] Push notifications (FCM)
  - [x] Performance optimization
  - [x] Unit tests + integration tests
- **Dependencies:** All previous phases
- **Docs to Read:** [UI-UX.md](file:///g:/My%20Projects/Echo/docs/UI-UX.md) (Animations), [Features.md](file:///g:/My%20Projects/Echo/docs/Features.md) (Compliment)
- **Notes:**
  - Implemented `Compliment` Mongoose schema & static templates repository across 5 categories (`Vibe`, `Focus`, `Creativity`, `Kindness`, `General`).
  - Implemented Redis atomic UTC midnight daily lock (`compliment:daily:<userId>:<YYYY-MM-DD>`), +1 Trust reward, and 100% anonymous Socket notification (`compliment:received`).
  - Built `NotificationService` wrapper for FCM push dispatches with graceful dev log fallback mode when credentials are missing.
  - Built glassmorphic `SecretComplimentModal.tsx`, `RadarScanAnimation.tsx`, `ToastContainer.tsx`, and CSS `@keyframes radarSweep` & `@keyframes toastSlideIn`.
  - Added Vitest automated test suite for `ContentFilterService`, `PrivacyDistance` bucket rounding, and `ComplimentService`.


---

### Phase 8: Launch Prep (Week 14-16)
- **Status:** `NOT STARTED`
- **Target:** Security audit, perf testing, deployment, beta, launch
- **Deliverables:**
  - [ ] Security audit
  - [ ] Performance/load testing
  - [ ] Bug fixes
  - [ ] Deployment setup (Docker, Nginx, hosting)
  - [ ] Beta testing
  - [ ] Documentation update
  - [ ] Launch 🚀
- **Dependencies:** Phase 7
- **Docs to Read:** All docs
- **Notes:**
  - _(none yet)_

---

## Decisions Log

> Track all important technical and product decisions here. Add new entries at the top.

| # | Date | Decision | Rationale | Phase |
|---|------|----------|-----------|-------|
| 33 | 2026-08-01 | **Redis Atomic UTC Midnight Expiry Lock for Compliments** | Enforces 1 secret compliment/day per user using atomic `SET key 1 EXAT <secondsToMidnight> NX`, preventing DB write contention & fast double-tap race conditions | Phase 7 |
| 34 | 2026-08-01 | **Graceful Fallback Push Notification Engine** | `NotificationService` wraps `firebase-admin` and automatically falls back to dev log mode when FCM environment credentials are not present | Phase 7 |
| 35 | 2026-08-01 | **100% Sender Anonymity Payload Sanitizer** | Socket dispatches for secret compliments (`compliment:received`) strictly strip `senderId`, `username`, and `echoId` before serialization | Phase 7 |
| 29 | 2026-08-01 | **Bi-Directional Block Geospatial Filter** | `$geoNear` query filters out blocked users bi-directionally (`_id $nin: caller.blockedUsers` & `blockedUsers $ne: caller._id`) to prevent blocked peers from tracking callers | Phase 6 |

| 30 | 2026-08-01 | **Automated False Report Rate Limiting** | Tracks report frequency per user; users submitting >5 reports in 1hr incur trust score penalties and temporary report rate limit blocks | Phase 6 |
| 31 | 2026-08-01 | **In-Process Compiled L33tsp34k Content Filter** | Sub-millisecond regex & l33tsp34k dictionary filter checks wave text, spark titles, and chat messages without blocking on third-party HTTP moderation APIs | Phase 6 |
| 32 | 2026-08-01 | **Socket Notification Suppression for Muted Peers** | Muting retains nearby visibility while suppressing Socket.IO `wave:received` and `chat:activity` alerts on recipient sockets | Phase 6 |
| 26 | 2026-08-01 | **Server-Side Spark Expiration Worker** | Runs every 10s to broadcast 1-min warnings (`spark:expiring`) and room expiry (`spark:expired`), filling gap where MongoDB TTL lacks Socket.IO events | Phase 5 |
| 27 | 2026-08-01 | **Atomic Array Bound Guard for Spark Capacity** | Uses `$push` with `'members.19': { $exists: false }` to prevent race conditions on the 20-member limit under concurrent load | Phase 5 |
| 28 | 2026-08-01 | **Creator Departure Autonomy Rule** | Creator leaving a Spark room keeps room active for remaining members until timer expires or members drop to 0, while allowing explicit creator deletion | Phase 5 |
| 23 | 2026-08-01 | **Unified Server Lifecycle Worker** | Consolidates 10m inactivity sleeping, 24h auto-archiving, and 30-day message auto-deletion purge into one efficient background engine | Phase 4 |
| 24 | 2026-08-01 | **Real-Time Mutual Save Agreement Socket Dispatch** | `chat:save-requested` alerts partner instantly; `chat:saved` confirms mutual agreement and locks connection permanently | Phase 4 |
| 25 | 2026-08-01 | **Sleeping / Archived Save Rescue Support** | Allows users to save sleeping or archived chats to preserve meaningful connections before 30-day deletion | Phase 4 |
| 20 | 2026-08-01 | **Hybrid REST + Socket.IO Wave & Message Dispatch** | REST validates auth, rate limits, and MongoDB persistence; Socket.IO pushes instant events to target rooms | Phase 3 |
| 21 | 2026-08-01 | **10-Minute Conversation Inactivity Worker** | Background worker monitors `lastActivityAt` > 10m on unsaved active chats, transitions to `sleeping`, & emits `chat:sleeping` | Phase 3 |
| 22 | 2026-08-01 | **Global React SocketProvider with Room Subscriptions** | Auto-connects JWT socket, joins `user:{userId}` & `chat:{conversationId}` rooms, syncs pending waves & chats | Phase 3 |
| 16 | 2026-08-01 | **MongoDB $geoNear + Redis Presence Hybrid** | $geoNear for 2dsphere indexing and spatial query; Redis for ephemeral presence & Socket routing | Phase 2 |
| 17 | 2026-08-01 | **Strict Distance Bucket Privacy Sanitizer** | Bucketizes distances (~50m, ~100m, ~150m, ~250m, ~500m); raw coordinates never leave backend | Phase 2 |
| 18 | 2026-08-01 | **ITM University Campus Geofencing Engine** | Pre-configured zones for Library, Engineering, Cafeteria, Sports, Quad, Hostels with regional fallback | Phase 2 |
| 19 | 2026-08-01 | **Haversine Location Thresholding (15m)** | Frontend only triggers location update API if moved >= 15m or 3 min elapsed | Phase 2 |
| 1 | 2026-07-31 | Name: **Echo** | Short, memorable, meaningful (echo = you call out, someone responds) | Pre-dev |
| 2 | 2026-07-31 | **No password** — OTP-only auth | Modern, reduces friction, more secure | Pre-dev |
| 3 | 2026-07-31 | Username **NOT unique**, identity = Username + EchoID | Removes username-squatting pressure, anyone can be "Vaibhav" | Pre-dev |
| 4 | 2026-07-31 | **Wave before DM** — no direct messaging without wave | Prevents spam, low-pressure initiation | Pre-dev |
| 5 | 2026-07-31 | Distance **always rounded** (50m+) | Privacy — prevents exact location tracking | Pre-dev |
| 6 | 2026-07-31 | Trust Score is **hidden** from users | Backend-only scoring prevents gaming the system | Pre-dev |
| 7 | 2026-07-31 | **Any email** (not just college) for account creation | Allows school students, office workers, anyone to use it | Pre-dev |
| 8 | 2026-07-31 | 3 tabs only: **Nearby, Sparks, Saved** | Keep V1 simple — avoid feature bloat | Pre-dev |
| 9 | 2026-07-31 | Interest Bubbles **deferred to V2** | Reduces onboarding friction in V1 | Pre-dev |
| 10 | 2026-07-31 | Bluetooth proximity **deferred to V2** | Not practical for web app V1; GPS + geofencing sufficient | Pre-dev |
| 11 | 2026-08-01 | **TypeScript + Vanilla CSS design tokens** | Full-stack TypeScript safety with dark mode glassmorphism CSS design tokens | Phase 0 |
| 12 | 2026-08-01 | **Fail-fast Zod env validation** | Validates process.env schema at backend startup to catch missing config early | Phase 0 |
| 13 | 2026-08-01 | **Live DB & Redis health check route** | `GET /api/v1/health` dynamically pings MongoDB Atlas and Redis Cloud | Phase 0 |
| 14 | 2026-08-01 | **Redis Key-Value for OTP Storage** | 5-minute TTL (`otp:<email>`), rate limiting, and attempt counting without DB write load | Phase 1 |
| 15 | 2026-08-01 | **Refresh Token Rotation & Hashed Storage** | Rotates refresh tokens on `/refresh` and revokes sessions on logout for security | Phase 1 |

---

## Known Issues / Blockers

> Track any blocking issues here. Add new entries at the top.

| # | Date | Issue | Status | Resolution |
|---|------|-------|--------|------------|
| — | — | No issues yet | — | — |

---

## Changelog

> Log all significant changes and milestones. Add new entries at the top.

| Date | Phase | Change | Details |
|------|-------|--------|---------|
| 2026-08-01 | Phase 7 | Completed Polish & Extras Phase | Secret Compliment feature (Mongoose schema, static templates across 5 categories, Redis atomic daily limit lock, +1 trust score, 100% anonymous socket & FCM push dispatch), `NotificationService` FCM abstraction with dev logger fallback, glassmorphic `SecretComplimentModal.tsx`, `RadarScanAnimation.tsx`, `ToastContainer.tsx`, CSS radar sweep & toast slide-in keyframe animations, and Vitest test suite for `ContentFilterService`, `PrivacyDistance`, and `ComplimentService`. |
| 2026-08-01 | Phase 6 | Completed Trust & Safety Phase | Hidden Trust Score engine (`TrustService`) with permission tiers, `Report` schema & `ModerationService`, bi-directional block filtering in `$geoNear`, mute/block REST APIs, in-process l33tsp34k bad words `ContentFilterService` for Chat/Wave/Spark, glassmorphic `ReportModal.tsx` & `SafetySettingsModal.tsx` |

| 2026-08-01 | Phase 5 | Completed Sparks Phase | Spark & SparkMessage Mongoose schemas (2dsphere index), `$geoNear` 200m nearby discovery API with distance rounding, atomic 20-member room join cap, server `SparkWorker` (10s ticker for 1-min warning & expiry), Socket.IO group room handlers, glassmorphic `SparksTab.tsx`, `CreateSparkModal.tsx`, and `SparkRoomModal.tsx` |
| 2026-08-01 | Phase 4 | Completed Conversation Lifecycle Phase | Mutual agreement save flow with real-time `chat:save-requested` & `chat:saved` sockets, dedicated glassmorphic `SavedTab.tsx` with contact search & delete, unified server `LifecycleWorker` (10m sleeping, 24h archiving, 30d message purge), DB lifecycle indexes, & `DELETE /conversations/:id` REST endpoint |
| 2026-08-01 | Phase 3 | Completed Wave & Chat Phase | Wave 👋 REST & Socket.IO APIs, Icebreaker seeding & selection UI, real-time 1-on-1 chat, typing indicators, emoji picker, 10-min inactivity worker for sleeping state, React SocketProvider & glassmorphic ChatWindow |
| 2026-08-01 | Phase 2 | Completed Discovery & Presence | MongoDB $geoNear aggregation, privacy distance rounding engine, ITM University campus geofencing, Redis presence management, Socket.IO real-time presence handlers, glassmorphic NearbyTab UI with mood filters & radar scanning |
| 2026-08-01 | Phase 1 | Completed Authentication & Identity | Passwordless Email OTP auth via Redis TTL, JWT access + refresh token system with rotation, Mongoose User schema with 2dsphere index, unique EchoID generator, React onboarding wizard & identity drawer |
| 2026-08-01 | Phase 0 | Completed Foundation Phase | Express + TypeScript backend, Vite + React + TypeScript client, MongoDB Atlas & Redis Cloud connectivity, Zod env validation, health monitoring |

| 2026-07-31 | Pre-dev | Created all 10 documentation files | Vision, Features, UserFlow, Architecture, Database, API, Realtime, Privacy-Safety, UI-UX, Roadmap |
| 2026-08-01 | Pre-dev | Created MASTER.md | Single source of truth for project progress |

---

## Agent Instructions

> **Before starting any phase or task:**
>
> 1. Read this **MASTER.md** document completely
> 2. Check the **Phase Progress Tracker** — find the current phase and its status
> 3. Read the **Docs to Read** listed for that phase
> 4. Check the **Decisions Log** for any relevant prior decisions
> 5. Check **Known Issues / Blockers** for anything that might affect your work
> 6. **After completing work**, update this document:
>    - Mark deliverables as `[x]` completed or `[/]` in progress
>    - Update the phase **Status** (`NOT STARTED` → `IN PROGRESS` → `COMPLETED`)
>    - Add any new **Decisions** to the log
>    - Add any new **Issues** to the blockers section
>    - Add a **Changelog** entry describing what was done
>    - Add relevant **Notes** under the phase
