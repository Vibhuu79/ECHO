# Echo Features

This document provides a detailed breakdown of the features planned for Echo, categorized by version and module.

## V1 (MVP) Features

### Authentication & Identity

| Feature | Description | How it works | Why it matters |
| :--- | :--- | :--- | :--- |
| **Email OTP Login** | Passwordless authentication using any email address. | Users enter their email and receive a One-Time Password (OTP) to log in. Not restricted to college emails. | Reduces friction, improves security by eliminating passwords, and allows anyone to use the app. |
| **Username** | 3-20 character username (A-Z, 0-9, _, .). | Users choose a username during onboarding. This username is **not** unique. | Provides a familiar way to identify users without the pressure of finding an available unique handle. |
| **EchoID** | A unique, backend-generated 6-character identifier (e.g., `#A8KD2F`). | Automatically assigned to each user upon registration. Together with the Username, it forms the user's complete identity. | Ensures uniqueness in the system while keeping the primary username simple. |
| **ID Visibility** | Tapping a username anywhere in the app reveals the associated EchoID. | UI interaction that toggles the display of the EchoID next to the username. | Allows users to verify identity and distinguish between users with the same username. |
| **Anonymous Profile** | No bio, no profile picture, no followers. | The profile consists solely of the Username, EchoID, and Mood. | Eliminates social media pressure, superficial judgments, and focus on follower counts. |

### Discovery (Nearby Tab)

| Feature | Description | How it works | Why it matters |
| :--- | :--- | :--- | :--- |
| **Location Engine** | Proximity detection using GPS, Geofencing, and Movement Detection. | The backend calculates distance between active users without exposing exact coordinates. | Core functionality for discovering people nearby while maintaining strict privacy. |
| **Approximate Distance** | Distances are rounded to fixed intervals (50m, 100m, 150m, 250m, 500m). | The actual calculated distance is bucketed into the nearest safe interval before being sent to the client. Exact distance is never shown. | Protects user privacy and prevents stalking or precise tracking. |
| **Smart Refresh** | Location updates dynamically based on context. | Refreshes when movement is detected or at a regular interval (30-60 seconds) while the app is active. | Balances real-time accuracy with battery life and server load optimization. |
| **Context-Aware Labels** | Displays semantic location names instead of raw distances when applicable. | Uses geofencing to map coordinates to known campus/area landmarks (e.g., "Library", "Cafeteria", "IT Building"). | Makes discovery more intuitive and relevant to the user's immediate environment. |
| **Echo Presence** | Real-time status indicators. | Displays "Active Now" (green dot), "X min ago", or "Away" based on recent app interaction. | Helps users know if someone is currently available to chat. |
| **Mood Status** | Emojis indicating current state. | Users select from a predefined list: 🙂 Chill, 📚 Studying, ☕ Coffee Break, 💻 Coding, 😴 Bored, 🎮 Gaming, 😄 Free. | Provides context for interaction and acts as a passive icebreaker. |

### Interaction

| Feature | Description | How it works | Why it matters |
| :--- | :--- | :--- | :--- |
| **Wave 👋** | A low-pressure way to initiate contact. | Users tap a Wave button next to a nearby user. Direct messaging is disabled until a Wave is accepted. | Prevents spam and unwanted messages. It's the digital equivalent of a friendly nod. |
| **Wave Management** | Accept or Ignore incoming Waves. | Receiver gets a notification and can accept (opening a chat) or silently ignore the request. | Gives users complete control over who they interact with. |
| **Message Requests** | A dedicated inbox for incoming Waves. | Waves are queued here for review before they become active chats. | Keeps the main chat list clean and organized. |
| **Ice Breakers** | Pre-written conversation starters. | A static database of suggestions (editable by the user) that can be sent automatically along with a Wave. | Helps overcome the awkwardness of starting a conversation with a stranger. |

### Chat

| Feature | Description | How it works | Why it matters |
| :--- | :--- | :--- | :--- |
| **Real-time Chat** | 1-on-1 messaging interface. | Supports text and emojis only. Powered by Socket.IO for instant delivery. No images or media to prevent abuse. | Focuses the interaction on conversation and keeps the platform safe and lightweight. |
| **Conversation Timer** | Dynamic lifecycle for active chats. | Starts as infinite. If 10 minutes pass with no activity, the chat enters a "sleeping" state, prompting users if they want to "continue?". | Encourages active engagement and clears out dead conversations automatically. |
| **Conversation Save** | Mechanism to make a chat permanent. | Either user can request to "Save". If the other user agrees, the chat is moved to the Saved tab. Otherwise, it is deleted when closed. | Ensures both parties consent to maintaining a long-term connection. |
| **Auto-Archive** | Automatic cleanup of stale conversations. | Inactive saved chats are archived after 24 hours. Archived chats are permanently deleted after 30 days unless restored. | Maintains a clutter-free environment and enforces data minimization. |

### Sparks (Sparks Tab)

| Feature | Description | How it works | Why it matters |
| :--- | :--- | :--- | :--- |
| **Intent Posts** | Short, temporary broadcasts. | Users post a quick intent (e.g., "Anyone for chai?", "Need React help"). | Facilitates immediate, purpose-driven group interactions. |
| **Local Visibility** | Sparks are only visible to nearby users (within ~200m). | Broadcasted to the Discovery feed of users in the immediate vicinity. | Keeps interactions hyper-local and relevant. |
| **Mini Rooms** | Temporary group chats spawned from a Spark. | Users tap a Spark to join. Acts as a pop-up chat room with a maximum of 20 members. | Allows for quick coordination without creating permanent groups. |
| **Spark Timer** | Creator-defined lifespan. | The creator sets a duration (10, 20, 30 min, or 1 hour). The room automatically deletes when the timer ends. | Ensures these spaces remain ephemeral and focused on the immediate moment. |
| **Expiry** | Auto-cleanup for inactive Sparks. | If no one joins a Spark within 24 hours, it is automatically deleted. | Prevents stale intents from cluttering the feed. |

### Saved (Saved Tab)

| Feature | Description | How it works | Why it matters |
| :--- | :--- | :--- | :--- |
| **Permanent Conversations** | A dedicated space for mutually saved chats. | Chats where both users agreed to "Save" are stored here. | Allows users to maintain connections made through the app. |
| **History Preservation** | Chat logs are kept intact. | Messages in saved conversations are persistent (subject to the auto-archive policy). | Provides continuity for ongoing interactions. |

### Secret Compliment

| Feature | Description | How it works | Why it matters |
| :--- | :--- | :--- | :--- |
| **Daily Limit** | Restricted usage per user. | Users can send exactly 1 Secret Compliment per day. | Makes the feature special and prevents spam. |
| **Template-Based** | Pre-defined, positive messages only. | Users select from a list of wholesome compliments. No custom text allowed. | Guarantees the feature is only used for positivity and prevents abuse/bullying. |
| **Anonymity** | The sender's identity is completely hidden. | The receiver gets a notification saying, "Someone nearby appreciated you," along with the compliment text. | Spreads good vibes safely without any pressure to respond. |

### Safety & Trust

| Feature | Description | How it works | Why it matters |
| :--- | :--- | :--- | :--- |
| **Hidden Trust Score** | Backend reputation system. | An algorithm assigns a score based on user behavior (e.g., accepted waves vs. ignored waves, reports). Affects visibility and chat permissions. | Automatically limits the reach of problematic users without manual intervention. |
| **Report / Block / Mute** | Standard moderation tools. | Users can block others from seeing them or messaging them, mute notifications, and report terms of service violations. | Essential tools for user empowerment and safety. |
| **Bad Words Detection** | Automated filtering. | Scans messages for profanity or hate speech and blocks/flags them. | Maintains a clean and respectful environment. |
| **Spam Detection** | Automated abuse prevention. | Monitors for rapid-fire waves or identical messages sent to multiple users. | Prevents bad actors from degrading the platform experience. |

---

## V2 Features

| Feature | Description | How it works | Why it matters |
| :--- | :--- | :--- | :--- |
| **Interest Bubbles** | Profile tags. | Users can select up to 5 interests to display on their profile. | Helps users find common ground faster. |
| **Bluetooth/WiFi Proximity** | Enhanced discovery. | Uses local networking technologies to improve discovery accuracy, especially indoors where GPS fails. | Provides more reliable connections in dense campus environments. |
| **AI Conversation Starter** | Smart icebreakers. | Suggests personalized conversation starters based on shared contexts or interests. | Further reduces the friction of initiating a chat. |
| **Collaboration Board** | A localized digital notice board. | A space for longer-form, persistent posts visible to the campus/area. | Useful for finding project partners, lost and found, or localized announcements. |
| **Campus Radar** | Aggregate statistics. | Displays a count of nearby users categorized by interest (e.g., "15 coders nearby"). | Gives a sense of community activity without revealing individual identities. |
| **Blind Match** | Facilitated anonymous chats. | The system pairs users up to 3 times a day for anonymous conversations based on proximity/interests. | Encourages serendipitous connections outside of deliberate Waves. |

---

## V3 Features

| Feature | Description | How it works | Why it matters |
| :--- | :--- | :--- | :--- |
| **Live Events (Auto-Rooms)** | Location-based group chats for specific events. | Geofenced areas automatically spawn chat rooms during scheduled events (e.g., college fests, sports days, workshops). | Creates instant community hubs around shared experiences. |
| **AI Moderation** | Advanced automated safety. | Uses machine learning models to detect nuance, context, and sophisticated abuse patterns beyond simple word filters. | Scales moderation effectively as the user base grows. |
| **Screenshot Detection** | Privacy enforcement. | Detects if a user takes a screenshot of a chat and notifies the other user (or blocks it entirely). | Enhances trust and the ephemeral nature of the platform. |
| **Advanced Analytics** | Data insights. | Dashboards for platform administrators to understand usage patterns, popular areas, and overall health. | Critical for long-term product decisions and community management. |
