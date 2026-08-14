# Echo Database Schema Documentation

**Database:** MongoDB (NoSQL, document-based)
**Caching/Real-time:** Redis

This document outlines the database architecture, collections, relationships, indexing strategies, and caching structures for the Echo platform.

## 1. Collections

### 1.1 Users Collection
Stores user identity, presence, location, and account status. Identity is defined as `username` + `echoId`.

```javascript
{
  _id: ObjectId,
  email: String, // unique, indexed
  username: String, // NOT unique, 3-20 chars (A-Z, 0-9, _, .)
  echoId: String, // unique, 6 chars (e.g., 'A8KD2F'), backend-generated
  mood: String, // enum: 'chill', 'studying', 'coffee', 'coding', 'bored', 'gaming', 'free', null
  trustScore: Number, // default: 100, min: 0, max: 100
  location: {
    type: 'Point',
    coordinates: [longitude, latitude] // GeoJSON format
  },
  locationLabel: String, // e.g., 'Library', 'Cafeteria'
  lastActive: Date,
  presenceStatus: String, // enum: 'online', 'away', 'offline'
  blockedUsers: [ObjectId], // ref: Users
  reportCount: Number, // default: 0
  isRestricted: Boolean, // default: false
  refreshToken: String,
  createdAt: Date,
  updatedAt: Date
}
```
**Indexes:** 
- `email` (unique)
- `echoId` (unique)
- `location` (2dsphere) - For geospatial queries (nearby discovery).
- `lastActive` - To manage presence and auto-offline status.

### 1.2 Waves Collection
Handles the low-pressure wave 👋 requests sent between users.

```javascript
{
  _id: ObjectId,
  senderId: ObjectId, // ref: Users
  receiverId: ObjectId, // ref: Users
  iceBreaker: String, // optional
  status: String, // enum: 'pending', 'accepted', 'ignored', 'blocked'
  createdAt: Date,
  respondedAt: Date
}
```
**Indexes:** `senderId`, `receiverId`, `status`.

### 1.3 Conversations Collection
Manages one-on-one chat metadata, lifecycle, and retention states.

```javascript
{
  _id: ObjectId,
  participants: [ObjectId], // ref: Users, exactly 2
  status: String, // enum: 'active', 'sleeping', 'archived', 'saved', 'deleted'
  isSaved: Boolean, // Both users agreed to save
  lastMessage: {
    text: String,
    senderId: ObjectId,
    timestamp: Date
  },
  lastActivityAt: Date, // Updates on new messages
  sleepingSince: Date, // Triggered after 10 min inactivity if not saved
  archiveAt: Date, // Triggered after 24h inactive
  deleteAt: Date, // Triggered after 30 days if not saved
  createdAt: Date
}
```
**Indexes:** `participants`, `status`, `lastActivityAt`.

### 1.4 Messages Collection
Stores individual messages for one-on-one conversations.

```javascript
{
  _id: ObjectId,
  conversationId: ObjectId, // ref: Conversations
  senderId: ObjectId, // ref: Users
  content: String,
  type: String, // enum: 'text', 'emoji', 'icebreaker', 'system'
  createdAt: Date
}
```
**Indexes:** `conversationId` + `createdAt` (compound) - For fast chronological retrieval per chat.

### 1.5 Sparks Collection
Temporary, intent-based mini rooms (e.g., "Anyone for chai?").

```javascript
{
  _id: ObjectId,
  creatorId: ObjectId, // ref: Users
  text: String,
  location: { 
    type: 'Point', 
    coordinates: [lng, lat] 
  },
  radius: Number, // default: 200, meters
  duration: Number, // minutes: 10, 20, 30, 60
  expiresAt: Date,
  members: [ObjectId], // ref: Users
  maxMembers: Number, // default: 20
  status: String, // enum: 'active', 'expired', 'deleted'
  createdAt: Date
}
```
**Indexes:** `location` (2dsphere), `expiresAt` (TTL) - Auto-deletes expired sparks.

### 1.6 SparkMessages Collection
Messages within a Spark room. Similar to Messages but linked to Sparks.

```javascript
{
  _id: ObjectId,
  sparkId: ObjectId, // ref: Sparks
  senderId: ObjectId, // ref: Users
  content: String,
  type: String, // enum: 'text', 'emoji', 'system'
  createdAt: Date
}
```
**Indexes:** `sparkId` + `createdAt` (compound).

### 1.7 Compliments Collection
Anonymous, template-based secret compliments.

```javascript
{
  _id: ObjectId,
  senderId: ObjectId, // ref: Users
  receiverId: ObjectId, // ref: Users
  template: String, // e.g., "Great style!", "Coding Ninja"
  createdAt: Date
}
```

### 1.8 Reports Collection
Moderation and trust & safety records.

```javascript
{
  _id: ObjectId,
  reporterId: ObjectId, // ref: Users
  reportedUserId: ObjectId, // ref: Users
  reason: String,
  context: String, // chatId or sparkId
  status: String, // enum: 'pending', 'reviewed', 'resolved'
  createdAt: Date
}
```

### 1.9 OTPs Collection
Handles email OTP authentication.

```javascript
{
  _id: ObjectId,
  email: String,
  otp: String, // hashed
  attempts: Number,
  expiresAt: Date // TTL: 5 min
}
```
**Indexes:** `expiresAt` (TTL).

### 1.10 IceBreakers Collection
Static collection of conversation starters.

```javascript
{
  _id: ObjectId,
  text: String,
  category: String, // e.g., 'Funny', 'Deep', 'Campus'
  isActive: Boolean
}
```

---

## 2. Entity-Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ WAVES : sends/receives
    USERS ||--o{ CONVERSATIONS : participates
    USERS ||--o{ MESSAGES : sends
    USERS ||--o{ SPARKS : creates/joins
    USERS ||--o{ SPARK_MESSAGES : sends
    USERS ||--o{ COMPLIMENTS : sends/receives
    USERS ||--o{ REPORTS : reports
    
    CONVERSATIONS ||--o{ MESSAGES : contains
    SPARKS ||--o{ SPARK_MESSAGES : contains
    
    USERS {
        ObjectId _id
        String email
        String username
        String echoId
        String mood
        Point location
        String presenceStatus
    }
    WAVES {
        ObjectId _id
        ObjectId senderId
        ObjectId receiverId
        String status
    }
    CONVERSATIONS {
        ObjectId _id
        ObjectId[] participants
        String status
        Boolean isSaved
        Date sleepingSince
        Date deleteAt
    }
    MESSAGES {
        ObjectId _id
        ObjectId conversationId
        ObjectId senderId
        String content
        String type
    }
    SPARKS {
        ObjectId _id
        ObjectId creatorId
        String text
        Date expiresAt
        ObjectId[] members
    }
    SPARK_MESSAGES {
        ObjectId _id
        ObjectId sparkId
        ObjectId senderId
        String content
    }
    OTPS {
        ObjectId _id
        String email
        String otp
        Date expiresAt
    }
```

---

## 3. Indexing Strategy

1. **Geospatial Indexes:** 
   - `Users.location` (2dsphere): Critical for the core feature of finding nearby users.
   - `Sparks.location` (2dsphere): For finding nearby active sparks.
2. **Compound Indexes:** 
   - `Messages(conversationId, createdAt)`: Optimizes fetching paginated chat history.
   - `SparkMessages(sparkId, createdAt)`: Optimizes fetching spark chat history.
3. **Unique Indexes:** 
   - `Users(email)`: Ensures no duplicate accounts.
   - `Users(echoId)`: Ensures globally unique EchoIDs.
4. **TTL Indexes:** 
   - Used for automatic data expiration (see below).

---

## 4. TTL Strategy for Auto-Deletion

MongoDB TTL (Time-To-Live) indexes are used heavily to manage temporary data without requiring cron jobs:

1. **OTPs:** Automatically deleted 5 minutes after creation (`expiresAt`).
2. **Sparks:** Automatically deleted when their duration ends (`expiresAt`). We also run a background worker to clean up `SparkMessages` for deleted Sparks.
3. **Conversations (Unsaved):**
   - We utilize standard queries with scheduled workers rather than strict TTL for conversations to allow complex state transitions (Active -> Sleeping -> Archived -> Deleted).
   - If a conversation is NOT saved (`isSaved: false`), a background worker soft-deletes or completely purges it 30 days after the `archiveAt` date.

---

## 5. Redis Data Structures

Redis is used for real-time presence, caching, and rate-limiting to reduce MongoDB load.

- **User Presence:** 
  - Key: `presence:user:{userId}`
  - Value: Status (`online`, `away`)
  - Expiry: Updated every ping. If missing, user is considered `offline` or `2 min ago`.
- **Geospatial Cache (Optional optimization):**
  - Redis `GEOADD` for hyper-local fast queries of active online users.
- **Rate Limits:**
  - Key: `ratelimit:wave:{userId}` -> Prevents spamming Waves.
  - Key: `ratelimit:otp:{email}` -> Prevents OTP abuse.
- **Trust Score Cache:**
  - Key: `trustscore:{userId}` -> Fast access during chat permissions validation.

---

## 6. Data Retention Policies

1. **Accounts:** Retained indefinitely unless explicitly deleted by the user. If a user deletes their account, PII (email) is scrambled, and relationships (Waves, Messages) are anonymized.
2. **Conversations/Messages:**
   - Saved Chats: Kept permanently.
   - Unsaved Chats: Auto-deleted 30 days after becoming inactive/archived.
3. **Sparks:** Chat history and the room itself are deleted immediately after the Spark expires (max 1 hour).
4. **Waves:** Ignored/Blocked waves are soft-deleted or retained for 7 days to prevent immediate re-sending, then hard-deleted.
5. **Location Data:** Only the latest location is kept. No historical coordinate tracking. Exact coordinates are never exposed to the frontend (only distances or labels).
