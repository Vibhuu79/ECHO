# Echo: User Flows

This document details the primary user journeys and interactions within the Echo platform. Each section outlines a specific flow from the user's perspective, supported by a Mermaid flowchart for implementation guidance.

## 1. Onboarding Flow
The process a new user goes through to create their anonymous identity and enter the app.

```mermaid
flowchart TD
    A[Open App] --> B[Enter Email]
    B --> C[Receive OTP via Email]
    C --> D[Enter OTP]
    D --> E{Verify OTP}
    E -- Success --> F[Choose Username (3-20 chars)]
    E -- Failure --> D
    F --> G[Backend Generates EchoID]
    G --> H[Prompt Location Permission]
    H --> I{Permission Granted?}
    I -- Yes --> J[Optional: Set Mood]
    I -- No --> H1[Explain why location is needed] --> H
    J --> K[Home Screen: Nearby Tab]
```

## 2. Nearby Discovery Flow
How users discover and view people around them.

```mermaid
flowchart TD
    A[Home Screen: Nearby Tab] --> B[Fetch Nearby Users (Location API)]
    B --> C[Display List of Anonymous Users]
    C --> D{User Details Shown}
    D --> D1[Username]
    D --> D2[Distance: 50m/100m/etc.]
    D --> D3[Mood Emoji]
    D --> D4[Presence: Active Now/Away]
    D --> D5[Context Label: Library/Cafe/etc.]
    C --> E[Tap on a User]
    E --> F[Show Options]
    F --> G1[Wave 👋]
    F --> G2[Start with Icebreaker]
```

## 3. Wave & Chat Flow
Initiating contact and the lifecycle of a real-time conversation.

```mermaid
flowchart TD
    A[Tap User Profile] --> B{Choose Action}
    B -- Wave --> C[Send Wave 👋 Request]
    B -- Icebreaker --> D[Send Selected Icebreaker]
    C --> E[Receiver gets Notification]
    D --> E
    E --> F{Receiver Action}
    F -- Ignore --> G[Request silently dropped]
    F -- Block --> H[Sender blocked]
    F -- Accept --> I[Chat Opens]
    I --> J[Real-time Text + Emoji Chat]
    J --> K{Inactivity Timer}
    K -- < 10 mins --> J
    K -- 10 mins --> L[Status: Conversation Sleeping]
    L --> M[Both users prompted: Continue?]
    M --> N{Both Yes?}
    N -- Yes --> J
    N -- No/Timeout --> O[Chat Ends]
```

## 4. Conversation Save Flow
Transitioning a temporary chat into a saved connection.

```mermaid
flowchart TD
    A[Chat Ends or User Taps 'Save'] --> B[Prompt: Save this connection?]
    B --> C[Wait for both users to respond]
    C --> D{Both Accept?}
    D -- Yes --> E[Move to Saved Tab]
    E --> F[Permanent Chat Established]
    D -- No/Timeout --> G[Chat Auto-Archive]
    G --> H[Deleted after 30 days]
```

## 5. Sparks Flow
Creating and joining temporary, intent-based local group chats.

```mermaid
flowchart TD
    A[Navigate to Sparks Tab] --> B{Action}
    B -- View Sparks --> C[See nearby Sparks within ~200m]
    C --> D[Tap to Join Spark Room]
    D --> E[Enter Group Chat]
    B -- Create Spark --> F[Enter Intent Text (e.g., Anyone for chai?)]
    F --> G[Set Timer: 10/20/30m, 1h]
    G --> H[Publish Spark]
    H --> I[Visible to Nearby Users]
    I --> J[Users join & chat]
    E --> K{Timer Counts Down}
    J --> K
    K -- Timer Ends --> L[Room Auto-Deleted]
```

## 6. Secret Compliment Flow
Sending anonymous positive feedback (max 1/day).

```mermaid
flowchart TD
    A[App Prompt / User Initiates] --> B[Check Daily Limit]
    B --> C{Limit Reached?}
    C -- Yes --> D[Show 'Try again tomorrow']
    C -- No --> E[Select Nearby User]
    E --> F[Choose Template]
    F --> G[Send Compliment]
    G --> H[Receiver Notified: 'Someone nearby appreciated you']
    H --> I[Show Template Text]
    I --> J[Sender remains anonymous]
```

## 7. Mood Update Flow
Updating current status/intent.

```mermaid
flowchart TD
    A[Home Screen] --> B[Tap Mood Icon]
    B --> C[Show Mood Options]
    C --> D[Select: Chill, Studying, Coding, etc.]
    D --> E[Update Backend]
    E --> F[Updated Immediately]
    F --> G[Visible to Nearby Users]
```

## 8. Report/Block Flow
Moderation and trust management.

```mermaid
flowchart TD
    A[In Chat or Nearby List] --> B[Tap ... Menu]
    B --> C{Action}
    C -- Report --> D[Select Reason] --> E[Submit Report]
    C -- Block --> F[Confirm Block] --> G[Block User]
    C -- Mute --> H[Confirm Mute] --> I[Mute Notifications]
    E --> J[Backend Updates Trust Score]
    G --> J
    J --> K[User Notified of Action Taken]
```

## 9. Chat Lifecycle
The complete journey of a chat thread.

```mermaid
flowchart TD
    A[Message Request] --> B[Accept]
    B --> C[Active Chatting]
    C --> D{Inactivity > 10m}
    D -- Yes --> E[State: Sleeping]
    E --> F[Prompt: Continue?]
    F -- Yes --> C
    F -- No --> G[Inactive for 24h]
    G --> H[State: Archived]
    H --> I[Wait 30 Days]
    I --> J[Deleted]
```

## 10. Login (Returning User)
Accessing an existing account.

```mermaid
flowchart TD
    A[Open App] --> B[Enter Email]
    B --> C[Receive OTP]
    C --> D[Enter OTP]
    D --> E{Verify OTP}
    E -- Success --> F[Fetch Profile & Saved Chats]
    E -- Failure --> D
    F --> G[Home Screen: Nearby Tab]
```
