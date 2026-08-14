# Echo REST API Documentation

This document outlines the REST API endpoints for the Echo platform. 

**Base URL:** `https://api.echoapp.com/v1` (or your local environment base URL)

**Authentication:** Most endpoints require a valid JWT Access Token sent in the `Authorization` header as a Bearer token.
`Authorization: Bearer <access_token>`

**Rate Limiting:** Global rate limit applies (e.g., 100 requests / 15 minutes per IP). Specific endpoints may have stricter limits as noted.

---

## Auth Module

### Send OTP
- **Method:** `POST`
- **URL:** `/api/auth/send-otp`
- **Auth required:** No
- **Rate Limit:** 3 requests / 5 minutes per email/IP
- **Request Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response Body (200 OK):**
  ```json
  {
    "message": "OTP sent successfully",
    "expiresIn": 300
  }
  ```
- **Status Codes:** `200 OK`, `400 Bad Request`, `429 Too Many Requests`

### Verify OTP
- **Method:** `POST`
- **URL:** `/api/auth/verify-otp`
- **Auth required:** No
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "otp": "123456"
  }
  ```
- **Response Body (200 OK):**
  ```json
  {
    "accessToken": "ey...",
    "refreshToken": "ey...",
    "isNewUser": false
  }
  ```
- **Status Codes:** `200 OK`, `400 Bad Request` (Invalid OTP), `401 Unauthorized`

### Refresh Token
- **Method:** `POST`
- **URL:** `/api/auth/refresh`
- **Auth required:** No (Requires Refresh Token)
- **Request Body:**
  ```json
  {
    "refreshToken": "ey..."
  }
  ```
- **Response Body (200 OK):**
  ```json
  {
    "accessToken": "ey...",
    "refreshToken": "ey..."
  }
  ```
- **Status Codes:** `200 OK`, `401 Unauthorized`

### Logout
- **Method:** `POST`
- **URL:** `/api/auth/logout`
- **Auth required:** Yes
- **Request Body:** None
- **Response Body (200 OK):**
  ```json
  {
    "message": "Logged out successfully"
  }
  ```
- **Status Codes:** `200 OK`, `401 Unauthorized`

### Register (Set Username)
- **Method:** `POST`
- **URL:** `/api/auth/register`
- **Auth required:** Yes (Token from Verify OTP)
- **Request Body:**
  ```json
  {
    "username": "cool_panda"
  }
  ```
- **Response Body (201 Created):**
  ```json
  {
    "username": "cool_panda",
    "echoId": "#A8KD2F",
    "message": "Registration complete"
  }
  ```
- **Status Codes:** `201 Created`, `400 Bad Request` (Invalid username format)

---

## User Module

### Get Current User Profile
- **Method:** `GET`
- **URL:** `/api/users/me`
- **Auth required:** Yes
- **Response Body (200 OK):**
  ```json
  {
    "id": "60d5ecb54b1234567890",
    "username": "cool_panda",
    "echoId": "#A8KD2F",
    "email": "user@example.com",
    "mood": "Chill",
    "trustScore": 95,
    "createdAt": "2023-01-01T00:00:00Z"
  }
  ```
- **Status Codes:** `200 OK`, `401 Unauthorized`

### Update Username
- **Method:** `PATCH`
- **URL:** `/api/users/me/username`
- **Auth required:** Yes
- **Request Body:**
  ```json
  {
    "username": "new_panda"
  }
  ```
- **Response Body (200 OK):**
  ```json
  {
    "username": "new_panda",
    "echoId": "#A8KD2F"
  }
  ```
- **Status Codes:** `200 OK`, `400 Bad Request`

### Update Mood
- **Method:** `PATCH`
- **URL:** `/api/users/me/mood`
- **Auth required:** Yes
- **Request Body:**
  ```json
  {
    "mood": "Coffee Break"
  }
  ```
- **Response Body (200 OK):**
  ```json
  {
    "mood": "Coffee Break"
  }
  ```
- **Status Codes:** `200 OK`, `400 Bad Request`

### Update Location
- **Method:** `PATCH`
- **URL:** `/api/users/me/location`
- **Auth required:** Yes
- **Request Body:**
  ```json
  {
    "latitude": 37.7749,
    "longitude": -122.4194
  }
  ```
- **Response Body (200 OK):**
  ```json
  {
    "message": "Location updated"
  }
  ```
- **Status Codes:** `200 OK`, `400 Bad Request`
- *Note: Location updates are frequent and might be optimized via WebSockets.*

### Get User Public Info
- **Method:** `GET`
- **URL:** `/api/users/:echoId`
- **Auth required:** Yes
- **Response Body (200 OK):**
  ```json
  {
    "username": "star_coder",
    "echoId": "#X9M2L1",
    "mood": "Coding",
    "presence": "Active Now"
  }
  ```
- **Status Codes:** `200 OK`, `404 Not Found`

---

## Discovery Module

### Get Nearby Users
- **Method:** `GET`
- **URL:** `/api/discover/nearby`
- **Auth required:** Yes
- **Query Params:**
  - `radius` (optional, default 500)
  - `limit` (optional, default 20)
  - `offset` (optional, default 0)
- **Response Body (200 OK):**
  ```json
  {
    "users": [
      {
        "username": "star_coder",
        "echoId": "#X9M2L1",
        "distance": "50m",
        "mood": "Coding",
        "presence": "Active Now",
        "contextLabel": "Library"
      }
    ],
    "pagination": {
      "nextOffset": 20
    }
  }
  ```
- **Status Codes:** `200 OK`, `400 Bad Request`

---

## Wave Module

### Send a Wave
- **Method:** `POST`
- **URL:** `/api/waves`
- **Auth required:** Yes
- **Rate Limit:** Max 10 waves / hour
- **Request Body:**
  ```json
  {
    "targetEchoId": "#X9M2L1",
    "iceBreakerId": "60d..." 
  }
  ```
- **Response Body (201 Created):**
  ```json
  {
    "waveId": "5f8...",
    "status": "pending"
  }
  ```
- **Status Codes:** `201 Created`, `400 Bad Request`, `429 Too Many Requests`
- *Note: Also triggers a Socket.IO `wave_received` event to the target user.*

### Get Pending Waves Received
- **Method:** `GET`
- **URL:** `/api/waves/pending`
- **Auth required:** Yes
- **Response Body (200 OK):**
  ```json
  {
    "waves": [
      {
        "id": "5f8...",
        "fromUser": {
          "username": "curious_cat",
          "echoId": "#M2K9X1",
          "mood": "Free"
        },
        "icebreaker": "What's the best book you read recently?",
        "createdAt": "2023-10-27T10:00:00Z"
      }
    ]
  }
  ```
- **Status Codes:** `200 OK`

### Accept Wave
- **Method:** `PATCH`
- **URL:** `/api/waves/:id/accept`
- **Auth required:** Yes
- **Response Body (200 OK):**
  ```json
  {
    "conversationId": "7c2...",
    "message": "Wave accepted. You can now chat."
  }
  ```
- **Status Codes:** `200 OK`, `404 Not Found`
- *Note: Triggers a Socket.IO `wave_accepted` event to the sender.*

### Ignore Wave
- **Method:** `PATCH`
- **URL:** `/api/waves/:id/ignore`
- **Auth required:** Yes
- **Response Body (200 OK):**
  ```json
  {
    "message": "Wave ignored"
  }
  ```
- **Status Codes:** `200 OK`

### Block User via Wave
- **Method:** `PATCH`
- **URL:** `/api/waves/:id/block`
- **Auth required:** Yes
- **Response Body (200 OK):**
  ```json
  {
    "message": "User blocked"
  }
  ```
- **Status Codes:** `200 OK`

---

## Chat/Conversation Module

### Get All Conversations
- **Method:** `GET`
- **URL:** `/api/conversations`
- **Auth required:** Yes
- **Response Body (200 OK):**
  ```json
  {
    "active": [...],
    "saved": [...],
    "archived": [...]
  }
  ```
- **Status Codes:** `200 OK`

### Get Conversation Details
- **Method:** `GET`
- **URL:** `/api/conversations/:id`
- **Auth required:** Yes
- **Response Body (200 OK):**
  ```json
  {
    "id": "7c2...",
    "participants": [...],
    "status": "active",
    "expiresAt": "2023-10-27T10:10:00Z"
  }
  ```
- **Status Codes:** `200 OK`, `404 Not Found`

### Get Messages
- **Method:** `GET`
- **URL:** `/api/conversations/:id/messages`
- **Auth required:** Yes
- **Query Params:** `limit`, `before` (cursor for pagination)
- **Response Body (200 OK):**
  ```json
  {
    "messages": [
      {
        "id": "msg1",
        "senderEchoId": "#M2K9X1",
        "text": "Hello! 👋",
        "timestamp": "2023-10-27T10:05:00Z"
      }
    ],
    "hasMore": false
  }
  ```
- **Status Codes:** `200 OK`, `403 Forbidden`
- *Note: Real-time messaging uses Socket.IO. This endpoint is for fetching history.*

### Request to Save Conversation
- **Method:** `PATCH`
- **URL:** `/api/conversations/:id/save`
- **Auth required:** Yes
- **Response Body (200 OK):**
  ```json
  {
    "message": "Save requested. Waiting for other user.",
    "saveStatus": "pending"
  }
  ```
- **Status Codes:** `200 OK`

### Continue Sleeping Conversation
- **Method:** `PATCH`
- **URL:** `/api/conversations/:id/continue`
- **Auth required:** Yes
- **Response Body (200 OK):**
  ```json
  {
    "message": "Conversation awakened",
    "expiresAt": "2023-10-27T10:20:00Z"
  }
  ```
- **Status Codes:** `200 OK`

### Delete/Leave Conversation
- **Method:** `DELETE`
- **URL:** `/api/conversations/:id`
- **Auth required:** Yes
- **Response Body (200 OK):**
  ```json
  {
    "message": "Left conversation"
  }
  ```
- **Status Codes:** `200 OK`

---

## Sparks Module

### Create a Spark
- **Method:** `POST`
- **URL:** `/api/sparks`
- **Auth required:** Yes
- **Request Body:**
  ```json
  {
    "intent": "Anyone for chai?",
    "durationMinutes": 30
  }
  ```
- **Response Body (201 Created):**
  ```json
  {
    "sparkId": "spk_123",
    "expiresAt": "2023-10-27T10:30:00Z"
  }
  ```
- **Status Codes:** `201 Created`

### Get Nearby Active Sparks
- **Method:** `GET`
- **URL:** `/api/sparks/nearby`
- **Auth required:** Yes
- **Response Body (200 OK):**
  ```json
  {
    "sparks": [
      {
        "id": "spk_123",
        "creator": "tea_lover",
        "intent": "Anyone for chai?",
        "memberCount": 3,
        "expiresAt": "2023-10-27T10:30:00Z",
        "distance": "100m"
      }
    ]
  }
  ```
- **Status Codes:** `200 OK`

### Join Spark Room
- **Method:** `POST`
- **URL:** `/api/sparks/:id/join`
- **Auth required:** Yes
- **Response Body (200 OK):**
  ```json
  {
    "message": "Joined spark room successfully"
  }
  ```
- **Status Codes:** `200 OK`, `403 Forbidden` (if full)

### Leave Spark Room
- **Method:** `POST`
- **URL:** `/api/sparks/:id/leave`
- **Auth required:** Yes
- **Response Body (200 OK):**
  ```json
  {
    "message": "Left spark room"
  }
  ```
- **Status Codes:** `200 OK`

### Get Spark Room Messages
- **Method:** `GET`
- **URL:** `/api/sparks/:id/messages`
- **Auth required:** Yes
- **Response Body (200 OK):**
  ```json
  {
    "messages": [...]
  }
  ```
- **Status Codes:** `200 OK`
- *Note: Real-time messaging uses Socket.IO.*

---

## Compliment Module

### Send a Compliment
- **Method:** `POST`
- **URL:** `/api/compliments`
- **Auth required:** Yes
- **Rate Limit:** 1 per day
- **Request Body:**
  ```json
  {
    "targetEchoId": "#M2K9X1",
    "templateId": "tpl_01"
  }
  ```
- **Response Body (201 Created):**
  ```json
  {
    "message": "Compliment sent anonymously"
  }
  ```
- **Status Codes:** `201 Created`, `429 Too Many Requests`

### Get Received Compliments
- **Method:** `GET`
- **URL:** `/api/compliments/received`
- **Auth required:** Yes
- **Response Body (200 OK):**
  ```json
  {
    "compliments": [
      {
        "text": "Great vibe!",
        "receivedAt": "2023-10-27T09:00:00Z"
      }
    ]
  }
  ```
- **Status Codes:** `200 OK`

### Get Available Templates
- **Method:** `GET`
- **URL:** `/api/compliments/templates`
- **Auth required:** Yes
- **Response Body (200 OK):**
  ```json
  {
    "templates": [
      {
        "id": "tpl_01",
        "text": "Great vibe!"
      },
      {
        "id": "tpl_02",
        "text": "Love your energy!"
      }
    ]
  }
  ```
- **Status Codes:** `200 OK`

---

## Moderation Module

### Submit a Report
- **Method:** `POST`
- **URL:** `/api/reports`
- **Auth required:** Yes
- **Request Body:**
  ```json
  {
    "targetEchoId": "#X9M2L1",
    "reason": "Inappropriate behavior",
    "context": "Sent rude messages in spark room"
  }
  ```
- **Response Body (201 Created):**
  ```json
  {
    "message": "Report submitted successfully"
  }
  ```
- **Status Codes:** `201 Created`

### Block a User
- **Method:** `POST`
- **URL:** `/api/blocks`
- **Auth required:** Yes
- **Request Body:**
  ```json
  {
    "targetEchoId": "#X9M2L1"
  }
  ```
- **Response Body (200 OK):**
  ```json
  {
    "message": "User blocked"
  }
  ```
- **Status Codes:** `200 OK`

### Unblock a User
- **Method:** `DELETE`
- **URL:** `/api/blocks/:echoId`
- **Auth required:** Yes
- **Response Body (200 OK):**
  ```json
  {
    "message": "User unblocked"
  }
  ```
- **Status Codes:** `200 OK`

### Mute a User
- **Method:** `POST`
- **URL:** `/api/mutes`
- **Auth required:** Yes
- **Request Body:**
  ```json
  {
    "targetEchoId": "#X9M2L1"
  }
  ```
- **Response Body (200 OK):**
  ```json
  {
    "message": "User muted"
  }
  ```
- **Status Codes:** `200 OK`

---

## IceBreakers Module

### Get Icebreaker Suggestions
- **Method:** `GET`
- **URL:** `/api/icebreakers`
- **Auth required:** Yes
- **Response Body (200 OK):**
  ```json
  {
    "icebreakers": [
      {
        "id": "ib_01",
        "text": "What's the best book you read recently?"
      },
      {
        "id": "ib_02",
        "text": "Coffee or tea?"
      }
    ]
  }
  ```
- **Status Codes:** `200 OK`

---

## WebSocket (Socket.IO) Events
While the REST API handles state changes and data retrieval, real-time interactions rely on Socket.IO:
- **Location Updates:** Client emits `update_location` periodically.
- **Presence:** `user_online`, `user_offline`, `typing_start`, `typing_stop`.
- **Waves:** `wave_received`, `wave_accepted`.
- **Chat/Sparks:** `new_message`, `message_read`.
