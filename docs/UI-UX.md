# Echo UI/UX Design System

**Tagline:** "Echo – Talk beyond hesitation."

This document outlines the UI/UX design system for the Echo platform, focusing on a simple, modern, and user-friendly experience.

---

## 1. Design Philosophy

- **Minimalism**: No clutter, no unnecessary elements. The interface should feel clean and breathable.
- **Privacy-first visual design**: Nothing that reveals identity. Avatars are generic or abstract; personal identifiers are strictly managed.
- **Dark mode as default** (with light mode option): Focuses on reducing eye strain and enhancing the modern, sleek aesthetic.
- **Soft, approachable aesthetic**: Not corporate, not childish. It should feel welcoming and comfortable for young adults and students.
- **Micro-animations for engagement**: Subtle animations to provide feedback and make the app feel alive.
- **Glassmorphism elements**: Used for cards, overlays, and navigation to create a modern, layered feel.

---

## 2. Color Palette

The color palette is designed to be calming, modern, and engaging.

| Usage | Color Value | Description |
| :--- | :--- | :--- |
| **Primary** | `#6C63FF` → `#4ECDC4` | A calming blue-purple to teal gradient. |
| **Background Dark** | `#0D0D1A` | Deep dark blue/black for default dark mode. |
| **Background Light** | `#F5F5F7` | Soft off-white for light mode. |
| **Surface/Card** | `rgba(255, 255, 255, 0.1)` | Semi-transparent with background blur (glassmorphism). |
| **Accent** | `#FF6B6B` | Warm coral/orange for notifications, waves, and key actions. |
| **Success** | `#4ECDC4` | Teal for positive feedback and confirmations. |
| **Warning** | `#FFE66D` | Soft yellow for alerts and cautions. |
| **Error** | `#FF6B6B` | Coral/red for destructive actions and errors. |
| **Text Primary** | `#FFFFFF` / `#1A1A2E` | White in dark mode, dark navy in light mode. |
| **Text Secondary** | `#8B8BA7` | Muted grayish-purple for less important text and labels. |

---

## 3. Typography

- **Primary Font**: [Inter](https://fonts.google.com/specimen/Inter) or [Outfit](https://fonts.google.com/specimen/Outfit) (Google Fonts). Both offer excellent readability and a modern, geometric look.
- **Headings**: Bold weight, slightly larger line-height for impact.
- **Body**: Regular weight, optimized for readability in chat interfaces.
- **Size Scale**:
  - Tiny: `12px` (Labels, timestamps)
  - Small: `14px` (Secondary text, metadata)
  - Base: `16px` (Body text, chat messages)
  - Large: `18px` (Subheadings)
  - H3: `20px` (Section titles)
  - H2: `24px` (Screen titles)
  - H1: `32px` (Hero text, splash screen)

---

## 4. Spacing & Layout

- **Grid System**: 8px base grid system (8, 16, 24, 32, 40, etc.) for consistent rhythm.
- **Padding/Margins**: Consistent application of the 8px grid across all components.
- **Border Radius**:
  - `12-16px` for standard cards, modals, and input fields.
  - `24px` for prominent buttons (pill shape).
  - `50%` (full round) for avatars and circular icon buttons.

---

## 5. Screen Inventory (V1)

### Onboarding Screens
1. **Splash Screen**: Echo logo + tagline animation fading in.
2. **Email Entry**: Simple email input field + "Send OTP" button. Clean and focused.
3. **OTP Verification**: 6-digit OTP input boxes with a smooth countdown timer for resend.
4. **Username Setup**: Username input field + dynamic EchoID preview (e.g., `#A8KD2F`) shown alongside (first time only).
5. **Location Permission**: Friendly, non-technical prompt explaining exactly why location is needed for discovery.

### Main App Screens (3 tabs at bottom)
6. **Nearby Tab (Home)**: List of nearby anonymous users.
   - *Elements*: Distance badge, mood emoji, presence dot, context label (e.g., "Library").
   - *Actions*: Pull to refresh. Wave 👋 button on each card.
7. **Sparks Tab**: Feed of nearby active sparks (mini-rooms).
   - *Elements*: Spark text/topic, countdown timer, current member count, "Join" button.
   - *Actions*: Floating Action Button (FAB) to create a new spark.
8. **Saved Tab**: List of saved permanent conversations. Search bar fixed at the top.

### Interaction Screens
9. **Wave Sent Confirmation**: Brief, satisfying animation or toast notification (e.g., a ripple effect on the screen).
10. **Wave Received**: Non-intrusive modal or in-app notification: *"Username (#EchoID) wants to chat"* with Accept / Ignore / Block options.
11. **Ice Breaker Selection**: Bottom sheet presenting categorized icebreaker options to start the chat smoothly.
12. **Chat Screen**: Clean messaging interface. Messages, emoji picker, typing indicator, conversation timer at the top, and a "Save" button to propose making it permanent.
13. **Spark Room**: Group chat interface. Timer bar steadily depleting at the top, active member count, and a clear "Leave" button.
14. **Conversation Save Prompt**: Modal dialog: *"Save this connection? Both users must agree."*
15. **Conversation Sleeping**: Overlay state: *"Conversation sleeping due to inactivity. Continue?"* with a wake-up button.

### Settings & Profile
16. **Settings**: Simple list view to change username, update mood status, toggle notifications, manage blocked users, logout, and delete account.
17. **Secret Compliment**: Template selector + nearby user selector to send 1 anonymous compliment per day.

### Moderation
18. **Report Screen**: Simple category selection (Spam, Harassment, etc.) + optional text description.
19. **Block Confirmation**: Clear confirmation dialog preventing accidental blocks.

---

## 6. Component Library

### Reusable Components

- **UserCard**: Used in the Nearby list. Contains Avatar (Emoji/Abstract), Username+EchoID, Context Label, Mood, Presence Dot, Distance Badge, and Wave Button.
- **SparkCard**: Used in the Sparks feed. Contains Topic text, Time remaining, Member count, and Join button.
- **ChatBubble**: Sent (Primary Color) / Received (Surface Color). Soft rounded corners.
- **WaveButton**: Distinctive styling, often using the Accent color or an animated icon.
- **MoodSelector**: Horizontal scrollable list or grid of emojis with text labels.
- **BottomNavBar**: 3 equal-width segments (Nearby, Sparks, Saved) with clear active/inactive states.
- **Modal / BottomSheet**: Glassmorphism background blur overlaying the main content.
- **OTP Input**: 6 individual styled boxes that auto-advance on typing.
- **Timer Badge**: Pill-shaped indicator showing remaining time (changes color as time runs low).
- **Presence Dot**:
  - Green: Active Now
  - Yellow: Away / Inactive for a few minutes
  - Gray: Offline
- **DistanceBadge**: Small pill showing approximate distance (e.g., "~50m").
- **IceBreakerChip**: Selectable pill-shaped buttons for quick messages.
- **ComplimentTemplate**: Card showing the pre-written compliment with a selection state.
- **EmptyState**: Whimsical, soft illustrations for "No one nearby" or "No saved chats".

---

## 7. Navigation

- **Primary Navigation**: Bottom tab bar (Nearby | Sparks | Saved).
- **Secondary Navigation**: Stack navigation within each tab (e.g., Nearby -> Chat Screen -> Profile Details).
- **Overlays**:
  - Modals for high-priority alerts, wave requests, and confirmations.
  - Bottom sheets for contextual actions (icebreakers, sending compliments, reporting).

---

## 8. Animations & Micro-interactions

- **Wave Send**: Satisfying ripple or subtle scaling animation on the button when tapped.
- **New Message**: Slide up and fade in from the bottom of the chat list.
- **Spark Timer**: Smooth, continuous countdown bar (progress bar style) or subtle pulse on the text.
- **Tab Switch**: Fast, smooth crossfade or slide transition between main views.
- **Pull to Refresh**: Custom animation (e.g., the Echo logo pulsing or a radar scanning effect).
- **Presence Dot**: Gentle, slow pulse for the 'Active Now' (Green) state.
- **Conversation Sleeping**: Smooth fade to a dimmed overlay covering the chat history, bringing the "Continue?" prompt into focus.

---

## 9. Accessibility

- **Color Contrast**: Ensure text against backgrounds meets WCAG AA standards (minimum 4.5:1 ratio).
- **Touch Targets**: Minimum 44x44px for all tappable elements (buttons, icons, links).
- **Screen Reader Support**: Proper aria-labels for icons, buttons, and dynamic content changes.
- **Keyboard Navigation**: Ensure the app (especially if accessed via web view/desktop later) is fully navigable via keyboard.

---

## 10. Responsive Design

- **Approach**: Mobile-first design, optimized for one-handed use.
- **Breakpoints**:
  - `320px` (Small Mobile, e.g., iPhone SE)
  - `375px` (Standard Mobile, e.g., iPhone 13/14)
  - `428px` (Large Mobile, e.g., iPhone Max series)
  - `768px` (Tablet - layout expands gracefully, max-width on lists)
  - `1024px+` (Desktop - shifts to sidebar navigation, split-pane views for lists and chat)

### Desktop Fallback (Future-proofing)
If accessed on wider screens, the Bottom Navbar becomes a persistent Left Sidebar, and the layout splits into a Master-Detail view (e.g., Nearby list on the left, active Chat on the right).

---

## Simple Wireframe (Nearby Tab)

```text
+---------------------------------------+
|  [Echo Logo]               [Settings] |
|                                       |
|  [ Search nearby...                 ] |
|                                       |
|  +---------------------------------+  |
|  |  (Avatar) User_Name #A4B2       |  |
|  |  🟢 Active · ~50m · Library     |  |
|  |  Mood: ☕ Coffee Break           |  |
|  |                          [ 👋 ] |  |
|  +---------------------------------+  |
|                                       |
|  +---------------------------------+  |
|  |  (Avatar) ChillCoder #X9L1      |  |
|  |  🟡 Away · ~150m · Cafeteria    |  |
|  |  Mood: 🎧 Coding                |  |
|  |                          [ 👋 ] |  |
|  +---------------------------------+  |
|                                       |
|                                       |
| ===================================== |
|   [ 📍 Nearby ]  [ ⚡ Sparks ] [ 💾 Saved ] |
+---------------------------------------+
```
