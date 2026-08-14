# Privacy & Safety Architecture

**Echo** is designed with privacy and safety as its foundational pillars. As an anonymous, location-based platform, protecting user identity and ensuring a safe environment is critical. This document outlines the mechanisms and systems in place to achieve this.

## 1. Privacy Architecture

The core architecture is built to ensure that location and identity data cannot be exploited.

*   **Real Identity Protection**: A user's real identity (email address) is NEVER exposed to other users or sent to the client.
*   **Public Identity**: Only the Username and backend-generated EchoID are visible to others.
*   **Location Obfuscation**:
    *   Exact GPS coordinates are NEVER sent to the client.
    *   Distances are always rounded to specific intervals (50m, 100m, 150m, 250m, 500m).
*   **Crowd Thresholding**: To prevent identity inference in sparsely populated areas, discovery requires a minimum threshold of 5 verified users in the vicinity. If the threshold is not met, discovery is disabled.
*   **Data Encryption**: Location data is encrypted at rest.
*   **No Tracking**: IP addresses are not logged for user tracking purposes.

## 2. Anonymous Identity System

Echo uses a dual-component identity system to maintain anonymity while allowing for persistent interactions.

*   **EchoID Generation**: The backend generates a cryptographically secure, random 6-character EchoID for every user (e.g., `#A8KD2F`).
*   **Identity Mapping**: `Email -> Encrypted -> Anonymous Public Identity (Username + EchoID)`.
*   **Emergency Access**: Only authorized administrators can map an EchoID back to a real identity (email), and this is strictly reserved for emergencies.
*   **Flexibility**: Usernames can be changed at any time. The EchoID remains constant.
*   **Zero Profiling**: There are no profile pictures, bios, or other identifiable attributes.

## 3. Trust Score System

Echo employs a hidden Trust Score system to autonomously regulate platform safety and permissions.

*   **Initial Score**: 100
*   **Visibility**: The score is NEVER visible to users. The backend uses it silently to manage permissions.
*   **Score Adjustments**:
    *   *Increases*: Accepted chats (+2), Passive clean record (+1/week), Active and helpful usage.
    *   *Decreases*: Spam reports (-10), Abuse reports (-15), Blocks by others (-5), Harassment (-20).
*   **Permission Thresholds**:
    *   **80 - 100 (Excellent)**: Full access, unlimited waves.
    *   **60 - 79 (Good)**: Limited waves (e.g., 10/day).
    *   **40 - 59 (Restricted)**: Can only respond to incoming requests; cannot initiate contact (no waves).
    *   **Below 40 (Critical)**: Shadow ban / Account flagged for manual review.

## 4. Content Moderation

Moderation is crucial for text-based interactions. All moderation occurs server-side.

*   **V1 Implementation**:
    *   **Bad Words Filter**: Regex and dictionary-based filtering of profanity and prohibited terms.
    *   **Spam Detection**: Algorithms to detect repeated messages and rapid-fire messaging patterns.
*   **V2/Future Implementation**:
    *   **AI-Based Detection**: Context-aware AI to detect harassment and nuanced abuse.
    *   **Screenshot Warnings**: Detection of screenshots with automatic warnings sent to users.

## 5. Reporting System

A robust reporting system empowers users to flag inappropriate behavior.

*   **Report Categories**: Spam, Harassment, Inappropriate Content, Fake Identity, Other.
*   **Workflow**: User submits report -> Added to Admin Review Queue -> Action taken (Warning, Restriction, Ban).
*   **Automated Actions**: Accounts receiving multiple reports from different, unrelated users trigger automatic temporary restrictions pending review.
*   **Abuse of Reporting**: The system detects false reporting patterns (e.g., a user reporting everyone they interact with) and penalizes the reporter's Trust Score.

## 6. Block & Mute Functionality

Users have direct control over their interactions.

*   **Block**: Blocks are absolute. The blocked user becomes completely invisible. They cannot send waves, and neither user appears in the other's nearby discovery list. Block lists are stored securely per user.
*   **Mute**: The muted user remains visible, but notifications for their interactions are suppressed.

## 7. Data Retention Policy

Echo minimizes the data it stores to reduce risk.

*   **Unsaved Chats**: Archived after 24 hours of inactivity; permanently deleted after 30 days.
*   **Saved Chats**: Retained permanently unless deleted by the user.
*   **Sparks**: Messages and metadata are permanently deleted the moment the Spark room expires.
*   **Location Data**: Only the latest approximate location is stored. No location history is maintained.
*   **Authentication**: Email OTPs have a strict 5-minute Time-To-Live (TTL).
*   **Account Deletion**: Upon request, all user data is purged from active databases within 30 days.

## 8. Abuse Prevention Mechanisms

Proactive measures to stop abuse before it escalates.

*   **Rate Limiting**:
    *   Waves (maximum per hour/day based on Trust Score).
    *   Messages (rapid-fire prevention).
    *   Spark creation.
*   **Feature Limits**: Secret Compliments are limited to 1 per day.
*   **New Account Sandbox**: New accounts face restrictions (e.g., limited waves for the first 24 hours) to deter automated spam accounts.
*   **Infrastructure Defense**: IP-based abuse detection to block botnets and coordinated attacks.

## 9. Legal & Compliance Considerations

Echo is designed with global privacy regulations in mind.

*   **GDPR Considerations**: Architecture supports data minimization and privacy by design.
*   **User Rights**:
    *   Data Export capability (requesting a copy of stored data).
    *   Right to Deletion (complete account purge).
*   **Documentation**: Requires comprehensive Terms of Service and a transparent Privacy Policy clearly outlining data practices.

## 10. Emergency Protocols

In extreme cases, administrative intervention is required.

*   **Identity Access**: Admin access to map an EchoID to an email address is restricted to:
    *   Credible threats of violence or self-harm.
    *   Valid law enforcement requests (subpoenas/warrants).
    *   Severe, repeated harassment cases.
*   **Audit Logging**: Every instance of admin identity access generates an immutable audit log entry for accountability.

## 11. Edge Cases & Mitigations

*   **Low Population Density**: *What if only 2-3 people are in an area?*
    *   *Mitigation*: The system hides discovery entirely until the minimum threshold (e.g., 5 users) is met to prevent easy deduction of identities.
*   **Username Cycling**: *What if someone changes their username repeatedly to avoid blocks?*
    *   *Mitigation*: Blocks are tied to the immutable EchoID and underlying account ID, not the Username. Changing the Username does not bypass a block.
*   **Multi-Accounting**: *What if someone creates multiple accounts?*
    *   *Mitigation*: Device fingerprinting and IP heuristics help detect ban evasion. New accounts are sandboxed, limiting the impact of throwaway accounts.
*   **Underage Users**: *What about minors using the platform?*
    *   *Mitigation*: ToS requires users to be of legal age (e.g., 18+ depending on jurisdiction). In-app reporting handles suspected underage users, leading to account suspension pending age verification.
