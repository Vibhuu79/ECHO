# 📜 ECHO — UI/UX & Technical Changes Log

> **🤖 AGENT DIRECTIVE:**  
> Before making any UI/UX or Technical changes to this codebase, **ANY AGENT MUST READ THIS FILE IN FULL**.  
> Whenever you complete or modify any UI/UX, database, real-time, or backend code, **YOU MUST UPDATE THIS FILE** under the [Recent Changes](#chronological-changelog) section with a summary of what changed, why, and which files were affected.

---

## 📌 Project Architecture Overview

- **App Name:** Echo (*"Talk beyond hesitation"*)
- **Type:** Context-aware anonymous nearby interaction platform
- **Frontend Stack:** React + TypeScript (Vite), Mobile-first CSS, Socket.IO Client
- **Backend Stack:** Node.js + Express + TypeScript (`ts-node-dev`)
- **Database & Storage:** MongoDB Atlas (Mongoose geospatial `2dsphere`), Redis Cloud (Presence, Caching, Rate limiting)
- **Real-Time Layer:** Socket.IO (Presence, Waves, Sparks, Chat rooms)

---

## 🕒 Chronological Changelog

### 📅 2026-08-05

#### 35. [Feature / Discovery & Presence] Strictly Active Nearby Feed Filtering & Tri-State Chat/Saved Presence (Online/Away/Offline)
- **Type:** `Feature | UI/UX | Technical / Backend`
- **Impacted Files:** 
  - [`server/src/modules/discovery/discovery.service.ts`](file:///g:/My%20Projects/Echo/server/src/modules/discovery/discovery.service.ts)
  - [`server/src/modules/chat/chat.service.ts`](file:///g:/My%20Projects/Echo/server/src/modules/chat/chat.service.ts)
  - [`client/src/pages/SavedTab.tsx`](file:///g:/My%20Projects/Echo/client/src/pages/SavedTab.tsx)
  - [`client/src/components/chat/ActiveChatsDrawerModal.tsx`](file:///g:/My%20Projects/Echo/client/src/components/chat/ActiveChatsDrawerModal.tsx)
  - [`client/src/components/chat/ChatWindow.tsx`](file:///g:/My%20Projects/Echo/client/src/components/chat/ChatWindow.tsx)
- **Summary of Changes:**
  - **Strict Active-Only Nearby Feed Filtering:** Updated `DiscoveryService.getNearbyUsers` so that only users who are **currently online and actively operating the app** (valid Redis presence `status: 'online'` AND recent activity within 2 minutes) are returned in the Nearby feed. All `away` and `offline` users are strictly filtered out.
  - **Tri-State Contact Presence Indicators:** Updated `ChatService.getUserConversations` and frontend components (`SavedTab.tsx`, `ActiveChatsDrawerModal.tsx`, `ChatWindow.tsx`) to accurately render tri-state presence status for saved & active chat peers:
    - 🟢 **Online** (`bg-emerald-400` / `text-emerald-400`): Currently active on the app
    - 🟡 **Away** (`bg-amber-400` / `text-amber-400`): App in background / idle
    - ⚪ **Offline** (`bg-slate-500` / `text-white/40`): Disconnected / inactive
- **Rationale / Context:**
  - Fulfilled user request to remove inactive/away users from the Nearby radar feed while maintaining accurate real-time presence indicators for saved and active chat contacts.

#### 34. [Bug Fix & UI/UX] OTP Login/Register Session Preservation & High-Contrast Visual Distinction
- **Type:** `Bug Fix | UI/UX | Authentication`
- **Impacted Files:** 
  - [`client/src/App.tsx`](file:///g:/My%20Projects/Echo/client/src/App.tsx)
  - [`client/src/context/AuthContext.tsx`](file:///g:/My%20Projects/Echo/client/src/context/AuthContext.tsx)
  - [`client/src/pages/OnboardingPage.tsx`](file:///g:/My%20Projects/Echo/client/src/pages/OnboardingPage.tsx)
  - [`client/src/components/auth/EmailStep.tsx`](file:///g:/My%20Projects/Echo/client/src/components/auth/EmailStep.tsx)
  - [`client/src/components/auth/UsernameStep.tsx`](file:///g:/My%20Projects/Echo/client/src/components/auth/UsernameStep.tsx)
- **Summary of Changes:**
  - **OTP Session Redirect Fix:** Removed `window.location.reload()` from `App.tsx` on onboarding completion, preventing React state destruction that was causing transient `api.getMe()` failures to wipe auth tokens and kick users back to the Password Login tab. Dynamic initialization of `isNewUser` and `step` in `AuthContext.tsx` and `OnboardingPage.tsx` ensures users who submit OTP or refresh on the username setup screen stay on their active step.
  - **High-Contrast OTP Login / Register Mode UI:** Redesigned the mode toggle selector in `EmailStep.tsx` with a vibrant cyan-to-emerald gradient (`#00f2fe`), glowing active shadow, "FAST" pill badge, and helper banner ("No Password Needed • Instant OTP Login / Register"). Updated the submit button dynamically to feature glowing cyan OTP theme and icon.
  - **Set Username Box Visual Distinction:** Wrapped the username input in `UsernameStep.tsx` in a dedicated glowing card section (`border: 1.5px solid rgba(0,242,254,0.4)`), added an integrated `@` prefix badge, a bold "STEP 1: SET ANONYMOUS USERNAME" tag, and clear visual separation from account password fields.
- **Rationale / Context:**
  - Resolved user bug report where OTP authentication was redirecting users back to the password login screen, requiring repeat OTP entry, and made the OTP mode button and username input field visually distinct and prominent.

### 📅 2026-08-04

#### 33. [UI/UX Improvement / Spark Room] Clean 2-Tier Mobile Header, In-Chat Direct Member Kick Controls & Custom Cyberpunk Kick Warning Modal
- **Type:** `UI/UX | Refactoring | Security / Moderation`
- **Impacted Files:** 
  - [`client/src/components/spark/SparkRoomModal.tsx`](file:///g:/My%20Projects/Echo/client/src/components/spark/SparkRoomModal.tsx)
- **Summary of Changes:**
  - **Mobile 2-Tier Room Header Layout:** Re-architected the crowded single-row header into a spacious, responsive 2-tier header. Tier 1 contains Close `X`, Zap icon, un-truncated Spark Title, and right-aligned Action Badges (`⏰ Timer`, `👥 Members Count`, `🗑️ Delete / 🚪 Leave`). Tier 2 contains an evenly spaced metadata sub-header bar displaying `Host @username` with `👑 Host` badge, `🔒 Private` / `🌐 Public` status, `Distance Bucket`, and `📍 Meetup Location`.
  - **In-Chat Direct Member Kick Action:** Added a direct `🚫 Kick` button next to non-host usernames directly inside the chat message feed when viewed by the room Host, enabling quick moderation without having to open the side member drawer.
  - **Custom Cyberpunk Kick Warning Modal:** Replaced native browser `window.confirm` with a custom glassmorphic warning modal (`ShieldAlert` icon, glowing red border, permanent ban notice, and dual `Cancel` / `🚫 Kick & Ban User` buttons).
- **Rationale / Context:**
  - Improved mobile room UI aesthetics and responsiveness. Provided immediate in-chat kick access for room hosts alongside a custom permanent ban warning modal.

#### 32. [New Feature / Spark Module & Host Moderation] Spark Room Host Kick Authority, Anti-Rejoin Enforcement & Private Passkey PIN Rooms
- **Type:** `New Feature | UI/UX | Technical / Backend | Database | Socket.IO`
- **Impacted Files:** 
  - [`server/src/modules/spark/spark.model.ts`](file:///g:/My%20Projects/Echo/server/src/modules/spark/spark.model.ts)
  - [`server/src/modules/spark/spark.service.ts`](file:///g:/My%20Projects/Echo/server/src/modules/spark/spark.service.ts)
  - [`server/src/modules/spark/spark.controller.ts`](file:///g:/My%20Projects/Echo/server/src/modules/spark/spark.controller.ts)
  - [`server/src/modules/spark/spark.routes.ts`](file:///g:/My%20Projects/Echo/server/src/modules/spark/spark.routes.ts)
  - [`server/src/socket/spark.handler.ts`](file:///g:/My%20Projects/Echo/server/src/socket/spark.handler.ts)
  - [`client/src/types/spark.ts`](file:///g:/My%20Projects/Echo/client/src/types/spark.ts)
  - [`client/src/services/api.ts`](file:///g:/My%20Projects/Echo/client/src/services/api.ts)
  - [`client/src/context/SocketContext.tsx`](file:///g:/My%20Projects/Echo/client/src/context/SocketContext.tsx)
  - [`client/src/components/spark/CreateSparkModal.tsx`](file:///g:/My%20Projects/Echo/client/src/components/spark/CreateSparkModal.tsx)
  - [`client/src/components/spark/SparkRoomModal.tsx`](file:///g:/My%20Projects/Echo/client/src/components/spark/SparkRoomModal.tsx)
  - [`client/src/pages/SparksTab.tsx`](file:///g:/My%20Projects/Echo/client/src/pages/SparksTab.tsx)
- **Summary of Changes:**
  - **Spark Host Kick Authority & Anti-Rejoin:** Added `bannedMembers` ObjectId array to `Spark` schema. Spark creators display a 👑 **Host** badge in the live room member drawer and possess `🚫 Kick` control buttons next to non-host members. Tapping `🚫 Kick` prompts an explicit host warning dialog (*"Are you sure you want to kick @username? They will be permanently blocked from re-joining this Spark room."*). Kicking a user removes them from `members`, adds them to `bannedMembers`, and emits real-time `spark:kicked` socket events to dismount their view. Rejoining is strictly blocked with `403 Forbidden` (`BANNED_FROM_SPARK`).
  - **Public vs. Private Passkey PIN Rooms:** Updated `CreateSparkModal.tsx` to allow room creators to set room privacy to 🌐 **Public** or 🔒 **Private (PIN)** with a 4-digit numeric passkey. Private rooms display a 🔒 **Private Room (PIN)** badge on the feed in `SparksTab.tsx`. Tapping a private room opens a sleek **PIN Prompt Modal** requiring nearby users to enter the correct 4-digit passkey before gaining entry.
- **Rationale / Context:**
  - Fulfilled user request for Spark host moderation authority (kicking abusive members with anti-rejoin prevention) and room access control (Public vs. Private rooms with 4-digit passkey PIN protection).

#### 31. [New Feature / Password Auth & Security] Password Registration, Dual Password/OTP Login & In-Profile Password Management / OTP Reset
- **Type:** `New Feature | UI/UX | Technical / Backend | Database`
- **Impacted Files:** 
  - [`server/src/modules/user/user.model.ts`](file:///g:/My%20Projects/Echo/server/src/modules/user/user.model.ts)
  - [`server/src/utils/crypto.utils.ts`](file:///g:/My%20Projects/Echo/server/src/utils/crypto.utils.ts)
  - [`server/src/modules/auth/auth.schema.ts`](file:///g:/My%20Projects/Echo/server/src/modules/auth/auth.schema.ts)
  - [`server/src/modules/auth/auth.service.ts`](file:///g:/My%20Projects/Echo/server/src/modules/auth/auth.service.ts)
  - [`server/src/modules/auth/auth.controller.ts`](file:///g:/My%20Projects/Echo/server/src/modules/auth/auth.controller.ts)
  - [`server/src/modules/auth/auth.routes.ts`](file:///g:/My%20Projects/Echo/server/src/modules/auth/auth.routes.ts)
  - [`client/src/types/auth.ts`](file:///g:/My%20Projects/Echo/client/src/types/auth.ts)
  - [`client/src/services/api.ts`](file:///g:/My%20Projects/Echo/client/src/services/api.ts)
  - [`client/src/context/AuthContext.tsx`](file:///g:/My%20Projects/Echo/client/src/context/AuthContext.tsx)
  - [`client/src/components/auth/EmailStep.tsx`](file:///g:/My%20Projects/Echo/client/src/components/auth/EmailStep.tsx)
  - [`client/src/components/auth/UsernameStep.tsx`](file:///g:/My%20Projects/Echo/client/src/components/auth/UsernameStep.tsx)
  - [`client/src/components/profile/ProfileDrawerModal.tsx`](file:///g:/My%20Projects/Echo/client/src/components/profile/ProfileDrawerModal.tsx)
- **Summary of Changes:**
  - **Password Setup on Registration:** Updated new user registration (`UsernameStep.tsx` & `registerUser` backend) to prompt users for a password (min 6 chars), hashing it via PBKDF2 with salt before saving in MongoDB `User` model (`passwordHash`).
  - **Dual Password & OTP Login Switching:** Refactored `EmailStep.tsx` with a dual-mode tab toggle (**Password Login** vs **OTP Login / Register**) and a direct fallback link for instant mode switching.
  - **In-Profile Password Change & OTP Reset:** Added Section 5 ("Account Security & Password") in `ProfileDrawerModal.tsx`, providing sub-tabs for changing password via current password OR requesting an OTP to `user.email` to reset/create a new password.
- **Rationale / Context:**
  - Enabled password authentication alongside existing OTP authentication, allowing returning users to log in with password or OTP, and manage/reset password securely from their profile.

#### 30. [UI/UX & Real-Time Chat Optimization] Per-Chat Unread Count Badges, Real-Time #1 Bumping & Clean Icon Rendering
- **Type:** `UI/UX | Socket.IO Real-time | Feature Addition`
- **Impacted Files:** 
  - [`client/src/context/SocketContext.tsx`](file:///g:/My%20Projects/Echo/client/src/context/SocketContext.tsx)
  - [`client/src/types/chat.types.ts`](file:///g:/My%20Projects/Echo/client/src/types/chat.types.ts)
  - [`client/src/components/chat/ActiveChatsDrawerModal.tsx`](file:///g:/My%20Projects/Echo/client/src/components/chat/ActiveChatsDrawerModal.tsx)
  - [`client/src/components/chat/DraggableChatFab.tsx`](file:///g:/My%20Projects/Echo/client/src/components/chat/DraggableChatFab.tsx)
  - [`client/src/App.tsx`](file:///g:/My%20Projects/Echo/client/src/App.tsx)
  - [`server/src/modules/chat/chat.service.ts`](file:///g:/My%20Projects/Echo/server/src/modules/chat/chat.service.ts)
- **Summary of Changes:**
  - **Unread Message Badges Only:** Replaced total active chat count badge (`5`) with **unread messages count ONLY** across the top bar header button and floating `<DraggableChatFab />`. When there are no unread messages (`0`), the numeric badge hides completely, showing a clean chat icon.
  - **Real-time #1 Bumping with Unread Increments:** When a peer (e.g. `SyntaxNinja24`) sends a new message while the user is outside their chat window, that conversation **immediately jumps to position #1 at the top of the list**, its `unreadCount` increments by 1, and a styled `X new` badge appears on the drawer card until opened.
  - **Automatic Unread Reset:** Opening a conversation in `ChatWindow` automatically resets its `unreadCount` to `0` and clears the unread badge.
- **Rationale / Context:**
  - Improved UI/UX by replacing confusing active chat count badges with actionable unread message indicators and real-time conversation list reordering.

#### 29. [Real-Time Messaging & Database Persistence] ACK Callback Reconciliation & Auto-Reactivation
- **Type:** `Real-Time Socket | Database Persistence | Bug Fix`
- **Impacted Files:** 
  - [`server/src/socket/chat.handler.ts`](file:///g:/My%20Projects/Echo/server/src/socket/chat.handler.ts)
  - [`server/src/modules/chat/chat.service.ts`](file:///g:/My%20Projects/Echo/server/src/modules/chat/chat.service.ts)
  - [`server/src/modules/chat/lifecycle.worker.ts`](file:///g:/My%20Projects/Echo/server/src/modules/chat/lifecycle.worker.ts)
  - [`client/src/context/SocketContext.tsx`](file:///g:/My%20Projects/Echo/client/src/context/SocketContext.tsx)
- **Summary of Changes:**
  - **Socket ACK Callback Reconciliation:** Added explicit ACK callbacks `(response) => callback(response)` to `chat:message` socket handler on the server. `SocketContext.tsx` on the client reconciles optimistic temporary IDs (`temp_...`) with real persisted MongoDB message objects upon server confirmation, preventing messages from disappearing when navigating back and forth.
  - **Auto-Reactivation on New Message:** Updated `createMessage` in `chat.service.ts` so that sending a message in a sleeping or archived conversation automatically reactivates the conversation to `status: 'active'`.
  - **Strict 24h Unsaved Chat Expiration & Permanent Saved Chat Immunity:** Updated `lifecycle.worker.ts` so that unsaved conversations (`isSaved: false`) auto-delete after 24 hours of inactivity while saved conversations (`isSaved: true`) remain permanently protected until manually deleted.
- **Rationale / Context:**
  - Fixed issue where messages disappeared when going back and reopening a chat window due to unpersisted optimistic states and inactive conversation status locks.

#### 28. [Real-Time Messaging & Socket Fix] Optimistic Sender Display, Multi-Channel Broadcast & HTTP Fallback
- **Type:** `Real-Time Socket | Bug Fix | UI/UX`
- **Impacted Files:** 
  - [`client/src/context/SocketContext.tsx`](file:///g:/My%20Projects/Echo/client/src/context/SocketContext.tsx)
  - [`client/src/services/api.ts`](file:///g:/My%20Projects/Echo/client/src/services/api.ts)
  - [`server/src/socket/chat.handler.ts`](file:///g:/My%20Projects/Echo/server/src/socket/chat.handler.ts)
- **Summary of Changes:**
  - **Optimistic Sender Message Append:** Updated `sendMessage` in `SocketContext.tsx` to immediately render an optimistic local message in `activeMessages` upon clicking Send, giving the sender zero-latency instant feedback.
  - **Multi-Channel Participant Broadcast:** Updated `server/src/socket/chat.handler.ts` to emit `chat:message` to both room `chat:${conversationId}` AND each participant's personal room `user:${pId}`. This ensures receivers get real-time messages instantly even if they haven't joined the specific conversation room.
  - **HTTP REST API Fallback:** Integrated REST API `api.sendMessage` fallback in `sendMessage` so messages send over HTTP if the WebSocket connection is temporarily reconnecting.
- **Rationale / Context:**
  - Fixed issue where sent messages were not displaying on the sender's screen or reaching the receiver due to single-room socket broadcasts and lack of optimistic local state rendering.

#### 27. [UI/UX & Real-Time Chat Optimization] Laptop Draggable/Header Chat Access & Instant Top Re-ordering
- **Type:** `UI/UX | Socket.IO Real-time | Feature Addition | Bug Fix`
- **Impacted Files:** 
  - [`client/src/context/SocketContext.tsx`](file:///g:/My%20Projects/Echo/client/src/context/SocketContext.tsx)
  - [`client/src/components/chat/DraggableChatFab.tsx`](file:///g:/My%20Projects/Echo/client/src/components/chat/DraggableChatFab.tsx)
  - [`client/src/App.tsx`](file:///g:/My%20Projects/Echo/client/src/App.tsx)
  - [`server/src/modules/chat/lifecycle.worker.ts`](file:///g:/My%20Projects/Echo/server/src/modules/chat/lifecycle.worker.ts)
- **Summary of Changes:**
  - **Laptop Dual Chat Access:** Added a dedicated **💬 Chats** header button in the top navigation bar for desktop/laptop users, while maintaining container-aware positioning for the floating `<DraggableChatFab />`.
  - **Instant #1 Conversation Bumping:** Updated `chat:message` and `chat:activity` socket listeners in `SocketContext.tsx` so that when User 1 sends a message to User 2, User 2's active conversation state **immediately moves User 1's conversation to position #1 (above all other chats)** with updated `lastMessage` text and timestamp.
  - **24-Hour Unsaved Chat Expiration Verification:** Verified the conversation lifecycle worker in `lifecycle.worker.ts` to ensure all unsaved chats (`isSaved: false`) inactive for 24 hours are auto-archived/purged along with their messages, while saved conversations (`isSaved: true`) remain permanently protected.
- **Rationale / Context:**
  - Addressed user feedback requesting laptop chat accessibility, real-time message notification & top-of-list reordering, and verification of 24h unsaved chat expiration.

#### 26. [UI/UX & Laptop Viewport Fix] Container-Aware Positioning for Floating Draggable Chats FAB
- **Type:** `UI/UX | Responsive Layout | Bug Fix`
- **Impacted Files:** 
  - [`client/src/components/chat/DraggableChatFab.tsx`](file:///g:/My%20Projects/Echo/client/src/components/chat/DraggableChatFab.tsx)
- **Summary of Changes:**
  - **Container-Aware Coordinate Calculation:** Updated `DraggableChatFab.tsx` to position the floating `Chats 💬` button relative to `.app-container.getBoundingClientRect()` instead of raw `window.innerWidth` (which was positioning the button at X = 1785px off-screen on wide laptop monitors).
  - **Laptop Screen Alignment & Drag Clamping:** Placed the floating `Chats 💬` button cleanly inside the bottom-right corner of the centered Echo app workspace on laptop screens, and clamped drag gestures to remain inside the app shell boundaries.
- **Rationale / Context:**
  - Resolved UI bug where laptop users could not see or access the floating draggable chat button because it rendered off-screen outside the centered app shell.

#### 25. [UI/UX & Laptop Viewport Optimization] SecretComplimentModal Laptop Bottom Elevation & Scroll Headroom
- **Type:** `UI/UX | Laptop Layout | Bug Fix`
- **Impacted Files:** 
  - [`client/src/components/SecretComplimentModal.tsx`](file:///g:/My%20Projects/Echo/client/src/components/SecretComplimentModal.tsx)
- **Summary of Changes:**
  - **Laptop Safe Area Elevation (`sm:pb-28 sm:pt-6`):** Applied `sm:pb-28` (112px bottom padding) exclusively on laptop screen viewports (`sm:` breakpoint) to lift the entire modal card high above the bottom navigation bar without modifying mobile layout.
  - **Laptop Height Capping (`sm:max-h-[70vh]`):** Reduced laptop modal max-height to `sm:max-h-[70vh]` so the card stays compact within laptop browser viewports.
  - **Inner Body Scroll Headroom (`pb-6 sm:pb-8`):** Added bottom scroll padding inside the inner body (`pb-6 sm:pb-8`) so mouse wheel scrolling smoothly lifts the `Send Secret Compliment ✨` button high into clear view.
- **Rationale / Context:**
  - Fixed laptop-specific UI bug where bottom navigation bars overlapped the Action Footer buttons.

#### 24. [UI/UX & Laptop Scrollability Fix] SecretComplimentModal Fixed Header & Scrollable Inner Body/Footer Flow
- **Type:** `UI/UX | Laptop Layout | Bug Fix`
- **Impacted Files:** 
  - [`client/src/components/SecretComplimentModal.tsx`](file:///g:/My%20Projects/Echo/client/src/components/SecretComplimentModal.tsx)
- **Summary of Changes:**
  - **Fixed Top Header (`shrink-0 z-20`):** Locked top title header at the top of the modal card so it never shifts or cuts off.
  - **Scrollable Inner Body + Footer Container (`flex-1 overflow-y-auto min-h-0`):** Moved Action Footer (`Cancel` and `Send Secret Compliment ✨` buttons) inside the inner scrollable body container.
  - **Laptop Mouse Wheel Scrollability:** Mouse wheel and trackpad scrolling now work 100% smoothly across laptop viewports to reveal the Action Footer at the end of the scroll flow without clipping.
- **Rationale / Context:**
  - Fixed laptop UI bug where top header cut off and mouse wheel scrolling was blocked by outer container margin centering.

#### 23. [UI/UX & Scroll Unification] SecretComplimentModal Unified Card Scroll & Action Footer Realignment
- **Type:** `UI/UX | Scroll Layout | Bug Fix`
- **Impacted Files:** 
  - [`client/src/components/SecretComplimentModal.tsx`](file:///g:/My%20Projects/Echo/client/src/components/SecretComplimentModal.tsx)
- **Summary of Changes:**
  - **Removed Pre-Written Compliment Scrollbar:** Removed `max-h-[130px] overflow-y-auto` from the template notes section so all 3 pre-written compliment cards render naturally without an inner scrollbar.
  - **Unified Card Scroll Flow:** Converted the entire modal card into a single scrollable document (`glass-card max-h-[82vh] overflow-y-auto flex flex-col space-y-4`). Scrolling anywhere inside the modal scrolls smoothly from top to bottom.
  - **Re-Aligned Action Buttons:** Aligned the `Cancel` and `Send Secret Compliment ✨` action buttons in a clean, right-aligned flex row (`flex items-center justify-end gap-3 pt-3 border-t border-white/10`) at the bottom of the card's scroll flow.
- **Rationale / Context:**
  - Fixed UX issue where nested inner scrollbars created awkward scrolling, and aligned action buttons cleanly at the bottom of the card.

#### 22. [UI/UX & Viewport Layout Fix] SecretComplimentModal Bottom Navigation Safe Padding & Height Capping
- **Type:** `UI/UX | Responsive Layout | Bug Fix`
- **Impacted Files:** 
  - [`client/src/components/SecretComplimentModal.tsx`](file:///g:/My%20Projects/Echo/client/src/components/SecretComplimentModal.tsx)
- **Summary of Changes:**
  - **Bottom Safe Area Padding (`pb-24 sm:pb-8`):** Added 96px bottom padding (`pb-24`) to the outer overlay backdrop (`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 pb-24 sm:pb-8 pt-4 sm:pt-8 overflow-y-auto`). This lifts the entire modal card up away from the bottom tab bar (`Nearby / Sparks / Saved`).
  - **Compact Height Cap (`max-h-[65vh] sm:max-h-[75vh]`):** Capped modal height so it stays strictly within the visible central viewport.
  - **100% Guaranteed Action Footer Visibility:** The sticky Action Footer (`Cancel` and `Send Secret Compliment ✨` buttons) is guaranteed to float comfortably high above the bottom navigation bar with 0% overlap, 0% cutoff, and 100% reachability.
- **Rationale / Context:**
  - Resolved UI bug in laptop frame viewports where the modal extended down to ~90vh and got tucked behind the fixed bottom navigation bar (`Nearby / Sparks / Saved`).

#### 21. [UI/UX & Laptop Layout Fix] SecretComplimentModal Viewport Height Limit & Outer Backdrop Scrollability
- **Type:** `UI/UX | Laptop Layout | Bug Fix`
- **Impacted Files:** 
  - [`client/src/components/SecretComplimentModal.tsx`](file:///g:/My%20Projects/Echo/client/src/components/SecretComplimentModal.tsx)
- **Summary of Changes:**
  - **Laptop Viewport Height Cap (`max-h-[80vh]`):** Reduced modal card height to `max-h-[80vh]` so the card stays within laptop window boundaries.
  - **Outer Overlay Scrollability:** Added `overflow-y-auto` to the fixed outer backdrop overlay (`fixed inset-0 z-50 overflow-y-auto`) so scrolling anywhere on the screen scrolls the entire modal smoothly on short laptop viewports.
  - **Capped Template Note List (`max-h-[130px] sm:max-h-[160px]`):** Capped the internal height of note options to ensure the sticky Action Footer is ALWAYS 100% visible and reachable without clipping.
- **Rationale / Context:**
  - Fixed UI bug where laptop viewports clipped the Send Secret Compliment button due to unconstrained modal height.

#### 20. [UI/UX & Layout Architecture Fix] Laptop SecretComplimentModal Sticky Action Footer Accessibility
- **Type:** `UI/UX | Responsive Layout | Bug Fix`
- **Impacted Files:** 
  - [`client/src/components/SecretComplimentModal.tsx`](file:///g:/My%20Projects/Echo/client/src/components/SecretComplimentModal.tsx)
- **Summary of Changes:**
  - **Structural Flex Layout Fix:** Moved the Action Footer (`Cancel` and `Send Secret Compliment ✨` buttons) out of the scrollable body container and placed it as a direct flex child of the modal card (`glass-card flex flex-col max-h-[85vh]`).
  - **100% Guaranteed Footer Visibility:** Enforced `shrink-0` on the Action Footer container so the `Send Secret Compliment ✨` button is ALWAYS 100% visible and anchored at the bottom of the modal card on laptop viewports without needing any scrolling.
  - **Inner Template List Height Cap:** Added `max-h-[160px] sm:max-h-[200px] overflow-y-auto` to template selection cards list so note lists scroll independently inside the body.
- **Rationale / Context:**
  - Resolved UI bug where the Send Secret Compliment button was nested inside the scrollable body div, causing it to clip past the bottom of the modal card on laptop viewports.

#### 19. [UI/UX & Mobile Scrollability Fix] SecretComplimentModal Height Constraint & Action Button Accessibility
- **Type:** `UI/UX | Mobile Layout | Bug Fix`
- **Impacted Files:** 
  - [`client/src/components/SecretComplimentModal.tsx`](file:///g:/My%20Projects/Echo/client/src/components/SecretComplimentModal.tsx)
- **Summary of Changes:**
  - **Mobile Max-Height Adjustment:** Updated card height to `max-h-[75vh] sm:max-h-[85vh]` with `min-h-0` on inner flex items. This ensures the modal height fits completely within the screen space above mobile bottom navigation bars (`Nearby / Sparks / Saved`).
  - **Backdrop Fallback Scrollability:** Added `overflow-y-auto` and bottom padding (`pb-20 sm:pb-4`) to outer backdrop overlay (`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pb-20 sm:pb-4 overflow-y-auto`) so the entire modal backdrop can scroll smoothly on small mobile viewports.
  - **Sticky Action Footer Visibility:** Guaranteed 100% visibility and reachability for the `Send Secret Compliment ✨` action button above mobile navigation bars.
- **Rationale / Context:**
  - Fixed mobile UI bug where users could not scroll down to reach the `Send Secret Compliment ✨` button because the card extended past the bottom navigation bar.

#### 18. [UI/UX & Mobile Optimization] UserCard 2-Row Horizontal Layout & Hollow Space Removal
- **Type:** `UI/UX | Mobile Layout | Bug Fix`
- **Impacted Files:** 
  - [`client/src/components/UserCard.tsx`](file:///g:/My%20Projects/Echo/client/src/components/UserCard.tsx)
- **Summary of Changes:**
  - **Row 1 (Identity & Distance Bar):** Combined `@username`, `#echoId` pill, and `distance` (`~50m`) badge together on a single horizontal row (`StaticVibe55  #4BH8WU  ~50m`).
  - **Row 2 (Location Context):** Placed `📍 Nearby Zone` cleanly on Row 2 directly beneath the identity bar.
  - **Eliminated Hollow Vertical Space:** Removed 4-line vertical text stacking and re-aligned card height so the right action buttons cluster (`✨ Compliments`, `Chat 💬`, `Shield 🛡️`) sits tightly balanced without hollow empty margins above or below.
- **Rationale / Context:**
  - Fixed mobile UI layout issue where user details stacked vertically down 4 separate lines, creating hollow empty space around action buttons.

#### 17. [UI/UX & Mobile Optimization] Nearby UserCard Action Cluster Sizing & Username Width Expansion
- **Type:** `UI/UX | Mobile Layout | Bug Fix`
- **Impacted Files:** 
  - [`client/src/components/UserCard.tsx`](file:///g:/My%20Projects/Echo/client/src/components/UserCard.tsx)
- **Summary of Changes:**
  - **Action Button Cluster Sizing:** Adjusted mobile action button padding and icon dimensions (`w-7 h-7` for ✨ Compliment & 🛡️ Safety buttons, `px-2.5 py-1.5 text-[11px]` for 💬 Chat button), saving over ~45px of horizontal width.
  - **Single-Line Full Username Expansion:** Updated username container max-width (`max-w-[120px] xs:max-w-[170px] sm:max-w-none`) and placed username and `#echoId` in a single horizontal flex row.
- **Rationale / Context:**
  - Resolved UI bug where 12-character nearby usernames (e.g. `StaticVibe55`) truncated to `StaticV...` on 360px mobile screens due to squeezed action button spacing.

#### 16. [UI/UX & Responsive Layout Fix] Laptop SecretComplimentModal Viewport Cutoff Fix
- **Type:** `UI/UX | Responsive Layout | Bug Fix`
- **Impacted Files:** 
  - [`client/src/components/SecretComplimentModal.tsx`](file:///g:/My%20Projects/Echo/client/src/components/SecretComplimentModal.tsx)
- **Summary of Changes:**
  - **Fixed 3-Part Modal Architecture:** Re-architected `SecretComplimentModal.tsx` into a 3-part layout (Sticky Header -> Scrollable Body -> Sticky Action Footer).
  - **Sticky Header (`shrink-0`):** Fixed at top of modal box so title `Send Secret Compliment` is 100% visible and never cut off at top of screen on laptop viewports.
  - **Sticky Action Footer (`shrink-0`):** Fixed at bottom of modal box so Cancel and `Send Secret Compliment ✨` buttons are 100% visible and never cut off or pushed behind bottom navigation bars.
  - **Internal Scrolling (`flex-1 overflow-y-auto`):** Form options and template cards now scroll smoothly within middle body container.
  - **Viewport Centering:** Removed asymmetric `pb-20` padding to perfectly center modal vertically across laptop and desktop screens.
- **Rationale / Context:**
  - Fixed UI bug where laptop viewport cut off top header title and bottom action buttons.

#### 15. [UI/UX & Mobile Optimization] SecretComplimentModal Overhaul & Flickering Stabilization
- **Type:** `UI/UX Overhaul | Bug Fix | Mobile Optimization`
- **Impacted Files:** 
  - [`client/src/components/SecretComplimentModal.tsx`](file:///g:/My%20Projects/Echo/client/src/components/SecretComplimentModal.tsx)
- **Summary of Changes:**
  - **Complete UI/UX Overhaul:** Replaced all legacy undefined CSS classnames with Echo's glassmorphic Tailwind design system (`glass-card rounded-3xl border border-[var(--hyper-pink)]/40 shadow-2xl bg-[#120a2a]`).
  - **Perfect Mobile Screen Centering:** Centered modal backdrop (`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md`) with proper responsive padding and max-height scrolling.
  - **Flickering Stabilization:** Optimized state loading logic by caching templates and conditionally toggling `setFetching(true)` only when templates are not yet loaded. Eliminates rapid spinner-to-form flashing on mobile & desktop.
  - **Double Hash (`##`) Fix:** Added `formattedEchoId` helper to prevent double-hash rendering (`#32CW0V` instead of `##32CW0V`).
  - **Styled Action Buttons & Category Pills:** Rendered gradient category filter pills (`Vibe`, `Focus`, `Creativity`, `Kindness`, `General`) and prominent Cancel and `Send Secret Compliment ✨` action buttons.
- **Rationale / Context:**
  - Resolved UI bug where `SecretComplimentModal` was off-centered, cluttered, unstyled, and flickered rapidly upon opening.

#### 14. [UI/UX & Mobile Layout Bug Fix] Mobile Profile Header Card & UserCard Name Formatting
- **Type:** `Bug Fix | UI/UX | Mobile Layout`
- **Impacted Files:** 
  - [`client/src/pages/NearbyTab.tsx`](file:///g:/My%20Projects/Echo/client/src/pages/NearbyTab.tsx)
  - [`client/src/components/UserCard.tsx`](file:///g:/My%20Projects/Echo/client/src/components/UserCard.tsx)
- **Summary of Changes:**
  - **Header Card 2-Row Responsive Layout:** Converted top profile card in `NearbyTab.tsx` to `flex-col sm:flex-row`. User details (`@username`, `#echoId`, `Mood`) take 100% width on row 1 while `Compliments` and `Set Mood` buttons align side-by-side on row 2, preventing usernames (e.g. `NoodleRunner32`) from squeezing into a 20px space and wrapping vertically letter-by-letter.
  - **UserCard Single-Line Truncation:** Replaced `break-words` with `truncate` on `UserCard.tsx` username `h3` to prevent middle-word line breaks (e.g. `StaticVi / be55`).
- **Rationale / Context:**
  - Fixed mobile UI bug where top header usernames wrapped vertically down 13 single-letter lines and nearby card usernames split across 2 lines.

#### 13. [New Feature / UI Integration] Secret Anonymous Compliments Integration & Inbox Modal
- **Type:** `New Feature | UI/UX | Socket Integration`
- **Impacted Files:** 
  - [`client/src/components/profile/ReceivedComplimentsModal.tsx`](file:///g:/My%20Projects/Echo/client/src/components/profile/ReceivedComplimentsModal.tsx)
  - [`client/src/components/UserCard.tsx`](file:///g:/My%20Projects/Echo/client/src/components/UserCard.tsx)
  - [`client/src/components/profile/ProfileDrawerModal.tsx`](file:///g:/My%20Projects/Echo/client/src/components/profile/ProfileDrawerModal.tsx)
  - [`client/src/pages/NearbyTab.tsx`](file:///g:/My%20Projects/Echo/client/src/pages/NearbyTab.tsx)
  - [`client/src/App.tsx`](file:///g:/My%20Projects/Echo/client/src/App.tsx)
  - [`client/src/context/SocketContext.tsx`](file:///g:/My%20Projects/Echo/client/src/context/SocketContext.tsx)
- **Summary of Changes:**
  - **Nearby Card Action Button:** Rendered a ✨ **Secret Compliment** button on `UserCard.tsx` next to 👋 Wave and 💬 Chat, opening `SecretComplimentModal.tsx` pre-filled with the target user's `@username` and `#echoId`.
  - **Received Compliments Modal:** Built `<ReceivedComplimentsModal />` to display anonymous compliment cards categorized by Vibe, Focus, Creativity, Kindness, and General with relative timestamps.
  - **Dual Entry Points:** Added a **✨ Compliments** header button on `NearbyTab.tsx` and a **✨ Compliments** action button inside `ProfileDrawerModal.tsx`.
  - **Real-Time Socket Listener:** Added `compliment:received` event listener to `SocketContext.tsx` for real-time notification sync.
- **Rationale / Context:**
  - Fully exposed the pre-built `compliments` collection and backend API `/api/compliments` to the frontend UI.

#### 12. [UI/UX & Mobile Optimization] UserCard Layout & Dedicated Spark Room Meetup Sub-Bar
- **Type:** `UI/UX | Mobile Optimization`
- **Impacted Files:** 
  - [`client/src/components/UserCard.tsx`](file:///g:/My%20Projects/Echo/client/src/components/UserCard.tsx)
  - [`client/src/pages/NearbyTab.tsx`](file:///g:/My%20Projects/Echo/client/src/pages/NearbyTab.tsx)
  - [`client/src/components/spark/SparkRoomModal.tsx`](file:///g:/My%20Projects/Echo/client/src/components/spark/SparkRoomModal.tsx)
- **Summary of Changes:**
  - **UserCard Username Space Optimization:** Updated username and `#echoId` row to a responsive flex layout (`flex-col sm:flex-row`). `#echoId` displays below the username on mobile screens (~360px width), granting usernames (e.g. `StaticVibe55`, `NoodleRunner32`) 100% of available horizontal width so they are never truncated.
  - **Dedicated Full-Width Meetup Point Sub-Bar:** Moved `activeSpark.placeName` inside `SparkRoomModal.tsx` into a dedicated full-width sub-header banner (`📍 Meetup Point: Campus Canteen`). Placed directly below the main room control bar, ensuring meetup locations are 100% visible and never compressed on mobile devices.
- **Rationale / Context:**
  - Resolved mobile UI layout issues where nearby card usernames truncated to single letters (`S...`) and Spark room meetup locations truncated to partial words (`Meetup: Lil...`).

#### 11. [New Feature / Spark Module] Active Room Creation Limit (1 Active Room Max) & Custom Visibility Radius (50m, 100m, 200m)
- **Type:** `New Feature | Technical / Backend | UI/UX`
- **Impacted Files:** 
  - [`server/src/modules/spark/spark.service.ts`](file:///g:/My%20Projects/Echo/server/src/modules/spark/spark.service.ts)
  - [`server/src/modules/spark/spark.controller.ts`](file:///g:/My%20Projects/Echo/server/src/modules/spark/spark.controller.ts)
  - [`client/src/types/spark.ts`](file:///g:/My%20Projects/Echo/client/src/types/spark.ts)
  - [`client/src/services/api.ts`](file:///g:/My%20Projects/Echo/client/src/services/api.ts)
  - [`client/src/components/spark/CreateSparkModal.tsx`](file:///g:/My%20Projects/Echo/client/src/components/spark/CreateSparkModal.tsx)
  - [`client/src/pages/SparksTab.tsx`](file:///g:/My%20Projects/Echo/client/src/pages/SparksTab.tsx)
- **Summary of Changes:**
  - **Active Room Creation Limit:** Added pre-creation database check (`Spark.findOne({ creatorId, status: 'active', expiresAt: { $gt: new Date() } })`) in `SparkService.createSpark` to prevent room creation spam and limit users to 1 active Spark room at a time.
  - **Custom Visibility Radius Selection:** Added a **Visibility Radius** toggle (`~50m range`, `~100m range`, `~200m range`) in `CreateSparkModal.tsx`.
  - **Geospatial Radius Filtering:** Added `$match: { $expr: { $lte: ['$calculatedDistance', '$radius'] } }` stage to `SparkService.getNearbySparks` aggregation pipeline to ensure rooms created with a 50m or 100m visibility radius are strictly hidden from users beyond that radius.
  - **Feed Radius Badge:** Rendered configured visibility radius badges (`~50m radius`) on `SparkFeedItem` cards in the Sparks tab.
- **Rationale / Context:**
  - Prevented spam room creation and gave creators precise control over how far their Spark rooms broadcast.

#### 10. [UI/UX & Bug Fix] Chat Bubble Word Wrapping & Overflow Container Fix
- **Type:** `Bug Fix | UI/UX`
- **Impacted Files:** 
  - [`client/src/components/spark/SparkRoomModal.tsx`](file:///g:/My%20Projects/Echo/client/src/components/spark/SparkRoomModal.tsx)
  - [`client/src/components/chat/MessageBubble.tsx`](file:///g:/My%20Projects/Echo/client/src/components/chat/MessageBubble.tsx)
- **Summary of Changes:**
  - **CSS Text Wrapping Enforcement:** Applied `break-words [overflow-wrap:anywhere] [word-break:break-word]` to message bubble containers and paragraph elements across `SparkRoomModal` and `MessageBubble`.
  - **Responsive Sizing:** Adjusted mobile bubble max-width (`max-w-[85%] sm:max-w-[75%]`) to prevent continuous unbroken words (e.g. `broooooooooooooooooooooooooooooooooooooooooooooooooooo`) from overflowing or breaking out of message boxes.
- **Rationale / Context:**
  - Fixed bug where ultra-long unbroken words without spaces broke the chat window layout by expanding beyond the screen width on mobile and desktop.

#### 9. [New Feature / Spark Module] Optional Meetup Place / Location Field for Spark Creation
- **Type:** `New Feature | UI/UX | Technical / Backend`
- **Impacted Files:** 
  - [`server/src/modules/spark/spark.model.ts`](file:///g:/My%20Projects/Echo/server/src/modules/spark/spark.model.ts)
  - [`server/src/modules/spark/spark.service.ts`](file:///g:/My%20Projects/Echo/server/src/modules/spark/spark.service.ts)
  - [`server/src/modules/spark/spark.controller.ts`](file:///g:/My%20Projects/Echo/server/src/modules/spark/spark.controller.ts)
  - [`client/src/types/spark.ts`](file:///g:/My%20Projects/Echo/client/src/types/spark.ts)
  - [`client/src/services/api.ts`](file:///g:/My%20Projects/Echo/client/src/services/api.ts)
  - [`client/src/components/spark/CreateSparkModal.tsx`](file:///g:/My%20Projects/Echo/client/src/components/spark/CreateSparkModal.tsx)
  - [`client/src/pages/SparksTab.tsx`](file:///g:/My%20Projects/Echo/client/src/pages/SparksTab.tsx)
  - [`client/src/components/spark/SparkRoomModal.tsx`](file:///g:/My%20Projects/Echo/client/src/components/spark/SparkRoomModal.tsx)
- **Summary of Changes:**
  - **Database & Backend API:** Added optional `placeName` field to `Spark` model schema and DTOs with max length validation (100 chars) and moderation content filtering.
  - **Spark Creation Modal:** Added an optional *"Meetup Place / Location"* text input field (`placeName`, max 60 chars) below the Intent Text field in `CreateSparkModal.tsx`.
  - **Spark Feed & Room Header Display:** Rendered a location badge (`📍 Meetup: Campus Canteen`) on `SparkFeedItem` cards and inside the live `SparkRoomModal` header whenever a meetup location is specified.
- **Rationale / Context:**
  - Allowed Spark room creators to optionally describe a physical meetup spot (e.g. *"Campus Canteen"*, *"Block B Stairs"*) for nearby users to meet up.

#### 8. [UI/UX & Discovery API] Profile Customization Sync (Avatar Icon, Aura Ring, Vibe Note) & Direct Nearby Chat Button
- **Type:** `UI/UX | Technical / Backend | New Feature`
- **Impacted Files:** 
  - [`server/src/modules/discovery/discovery.service.ts`](file:///g:/My%20Projects/Echo/server/src/modules/discovery/discovery.service.ts)
  - [`client/src/types/discovery.ts`](file:///g:/My%20Projects/Echo/client/src/types/discovery.ts)
  - [`client/src/components/UserCard.tsx`](file:///g:/My%20Projects/Echo/client/src/components/UserCard.tsx)
  - [`client/src/pages/NearbyTab.tsx`](file:///g:/My%20Projects/Echo/client/src/pages/NearbyTab.tsx)
- **Summary of Changes:**
  - **Profile Customization Synchronization:** Projected `auraTheme`, `avatarIcon`, and `vibeStatus` in `DiscoveryService.getNearbyUsers`. `UserCard` now dynamically displays custom avatar icons (`⚡`, `☕`, etc.), customized aura theme gradient rings (`Sunrise`, `Cyberpunk`, `Lavender`, `Midnight`), and Ephemeral Vibe Notes (`✨ Sleepy`).
  - **Direct Nearby Chat Button for Existing Connections:** Queried existing active/saved conversations in `DiscoveryService` to hydrate `conversationId` and `hasExistingConnection`. `UserCard` renders a direct **Chat 💬** button when a connection already exists, launching the chat window immediately without forcing users to navigate to the Saved tab.
- **Rationale / Context:**
  - Resolved issue where user profile customizations (avatar, aura theme, vibe note) were missing on other users' nearby radar feeds.
  - Resolved issue where users could not interact with already-connected nearby users without navigating to Saved tab.

#### 7. [Technical / Socket.IO & Chat API] Live Peer Presence Hydration & Real-Time Status Sync
- **Type:** `Technical / Backend | Socket.IO | UI/UX`
- **Impacted Files:** 
  - [`server/src/modules/chat/chat.service.ts`](file:///g:/My%20Projects/Echo/server/src/modules/chat/chat.service.ts)
  - [`client/src/context/SocketContext.tsx`](file:///g:/My%20Projects/Echo/client/src/context/SocketContext.tsx)
- **Summary of Changes:**
  - **Redis Presence Hydration in Chat APIs:** Updated `ChatService.getUserConversations` and `ChatService.getConversationDetails` to query `PresenceService` (Redis) and inspect recent activity (`< 5 mins`), dynamically hydrating the peer's actual live presence status (`online` / `away` / `offline`).
  - **Auto Online Touch on Message Send:** Updated `createMessage` to touch the sender's presence in Redis and MongoDB as `online` when sending a message.
  - **Real-Time Client Presence Handlers:** Added socket listeners for `user:online`, `user:away`, `user:offline`, `chat:message`, and `chat:typing` in `SocketContext.tsx` to automatically set `activeChat.peer.presence` to `'online'` when an incoming message or typing event arrives.
- **Rationale / Context:**
  - Fixed bug where actively messaging peers (like "parag") showed as "Offline" (amber dot) in the chat window header due to stale DB presence states.

#### 6. [UI/UX] Restored Draggable Chat FAB Floating Action Button Visibility
- **Type:** `UI/UX`
- **Impacted Files:** 
  - [`client/src/App.tsx`](file:///g:/My%20Projects/Echo/client/src/App.tsx)
- **Summary of Changes:**
  - Removed the `allActiveChats.length > 0` condition preventing `<DraggableChatFab />` from rendering when active conversation count was 0.
  - The floating draggable `Chats` button is now persistently available on screen (displaying `Chats 0` when empty, and `Chats N` when active/saved connections exist).
- **Rationale / Context:**
  - Restored quick access button for opening the Active Chats drawer from any main screen tab.

#### 5. [UI/UX & Discovery API] Active User Discovery Filtering & 5-Second Scan Animation Timer
- **Type:** `UI/UX | Technical / Backend | Database`
- **Impacted Files:** 
  - [`server/src/modules/discovery/discovery.service.ts`](file:///g:/My%20Projects/Echo/server/src/modules/discovery/discovery.service.ts)
  - [`client/src/pages/NearbyTab.tsx`](file:///g:/My%20Projects/Echo/client/src/pages/NearbyTab.tsx)
- **Summary of Changes:**
  - **Backend Active-Only User Query Filter:** Updated `DiscoveryService.getNearbyUsers` to add a 15-minute `lastActive` recency threshold filter to MongoDB `$geoNear` and post-process with Redis presence to strictly filter out offline users.
  - **Frontend Offline Card Removal:** Filtered out `presenceStatus === 'offline'` from nearby user feed on the client. If no active users are nearby, the `RadarScanAnimation` sonar radar searching view is automatically displayed.
  - **5-Second Radar Pulse Scan Animation:** Updated `handleRadarScanClick` using `Promise.all` with a minimum 5,000 ms delay so clicking "Radar Pulse Scan" runs the scanning animation for exactly 5 seconds before revealing updated nearby users.
- **Rationale / Context:**
  - Fixes bug where stale offline users (e.g. "parag") from 30 minutes ago still appeared in nearby feeds.

#### 4. [UI/UX & Socket.IO] Nearby User Non-Flickering Polling, Full-Width Radar Pulse Scan Button, & Live Messaging Fixes
- **Type:** `UI/UX | Socket.IO | Technical`
- **Impacted Files:** 
  - [`client/src/pages/NearbyTab.tsx`](file:///g:/My%20Projects/Echo/client/src/pages/NearbyTab.tsx)
  - [`client/src/context/SocketContext.tsx`](file:///g:/My%20Projects/Echo/client/src/context/SocketContext.tsx)
- **Summary of Changes:**
  - **Silent 10-Second Polling & Non-Flicker UX:** Refactored `fetchNearbyUsers` in `NearbyTab.tsx` to run silent background polling every 10 seconds without toggling `loading` or `refreshing` spinners, keeping cards mounted while dynamically adding new users and removing offline users.
  - **Full-Width Radar Pulse Scan Button & Range Expansion:** Positioned the full-width "Radar Pulse Scan (~200m/300m/500m)" action button below the user list and above the bottom footer navigation bar. Added explicit click behavior to expand search range (e.g. 200m -> 300m -> 500m) with visual scan progress feedback.
  - **Real-Time Live Messaging Fix:** Added `activeChatIdRef` and `activeSparkIdRef` in `SocketContext.tsx` to eliminate stale closure bugs in socket handlers (`chat:message`, `chat:typing`, etc.). Added real-time event listeners for `chat:started` and `chat:activity` so wave acceptances and new messages instantly sync active chat lists and messages across both users.
- **Rationale / Context:**
  - Resolves screen flickering every 1-2 seconds during GPS location updates.
  - Fixes missing message updates in active chats and drawer views between users.

#### 1. [Infrastructure / Debugging] Redis Client DNS & Connection Troubleshooting
- **Type:** `Technical / Infrastructure`
- **Issue Analyzed:** `Redis Client Error: getaddrinfo ENOTFOUND range-suede-skylike-43532.db.redis.io` and `read ECONNRESET`
- **Root Cause & Diagnosis:**
  - `ENOTFOUND`: Node.js DNS resolution failure caused by temporary DNS network drop or Node's default IPv6 (`verbatim`) resolution order when resolving Redis Cloud endpoints.
  - `ECONNRESET`: Remote Redis Cloud instance closing TCP connections due to TLS enforcement mismatch (`redis://` vs `rediss://`) or free-tier instance auto-pause.
- **Recommendations Provided:**
  - Added IPv4 DNS fallback recommendation (`dns.setDefaultResultOrder('ipv4first')`).
  - Advised switching `.env` protocol to `rediss://` for TLS-secured Redis Cloud instances.
  - Suggested graceful Redis connection error handling in [`redis.config.ts`](file:///g:/My%20Projects/Echo/server/src/config/redis.config.ts).

#### 2. [Real-time / Sockets] Socket.IO `transport close` Disconnect Diagnosis
- **Type:** `Technical / Socket.IO`
- **Issue Analyzed:** Server logging `Socket Disconnected: <userId> (transport close)`
- **Root Cause & Diagnosis:**
  - `(transport close)` is standard Socket.IO client-side socket teardown.
  - Occurs during browser page refresh (`F5`), React Hot Module Replacement (HMR) during dev, route unmounting in React `useEffect` cleanups, or tab backgrounding/sleep.
- **Recommendations Provided:**
  - Confirmed `transport close` is standard socket lifecycle behavior upon client page reload.
  - Recommended using a global React `SocketContext` singleton on the frontend to avoid unnecessary reconnect cycles across page transitions.

#### 3. [Documentation / Protocol] Creation of `PROJECT_CHANGELOG.md`
- **Type:** `UI/UX & Technical Documentation`
- **Impacted Files:** [`PROJECT_CHANGELOG.md`](file:///g:/My%20Projects/Echo/PROJECT_CHANGELOG.md)
- **Details:** Established a mandatory context-preservation changelog for all future agents to read before making UI/UX or technical modifications.

---

## 📝 Format for Future Log Entries

When making changes, append a new block to the top of the **Chronological Changelog** using this format:

```markdown
### 📅 [YYYY-MM-DD]

#### [Category] Short Title of Change
- **Type:** `[UI/UX | Technical / Backend | Database | Socket.IO | Infrastructure]`
- **Impacted Files:** [`filename.ts`](file:///path/to/file)
- **Summary of Changes:**
  - Concise bullet points of what changed.
- **Rationale / Context:**
  - Why this change was made and any technical trade-offs.
```
