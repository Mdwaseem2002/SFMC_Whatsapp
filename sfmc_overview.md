# Pentacloud SFMC WhatsApp Integration Overview

This document provides a complete breakdown of the custom WhatsApp Business API integration constructed for Salesforce Marketing Cloud (SFMC). You can share this with your manager to show exactly what was built and how data flows.

## Core Capabilities

1. **Journey Builder Custom Activity:** A dynamically configured UI that allows marketers to drag-and-drop a "Send WhatsApp" block directly into Journey Builder.
2. **Real-Time Data Sync:** Uses SFMC's synchronous `/hub/v1/dataevents` API to instantly push message statuses to Data Extensions without delay.
3. **Automated Suppression Handling:** Intercepts global opt-out keywords (like "STOP") and autonomously suppresses future sends while updating a Master suppression list.
4. **Smart Auto-Replies:** Greets first-time inbound users with a welcome prompt, but stays silent during continuous live human-chat conversations.

---

## Data Extension (DE) Architecture

The backbone of this integration relies on three core Data Extensions that log every interaction.

### 1. `WhatsApp_Sent_Messages` (The Master Outbound Log)
**Purpose:** Provides a master log of every single template message triggered by Journey Builder. It tracks the exact delivery pipeline (Sent -> Delivered -> Read) in real-time.

| Field Name | Type | Purpose |
| :--- | :--- | :--- |
| `WaMid` (Primary Key)| Text | Unique WhatsApp Message ID from Meta. |
| `ContactKey` | Text | The SFMC Subscriber ID. |
| `Phone` | Text | The destination WhatsApp number. |
| `TemplateName` | Text | The name of the approved template used. |
| `Status` | Text | Tracks the message lifecycle (`sent`, `delivered`, `read`, or `failed`). |
| `SentTime` | Date | Exact timestamp of the outgoing API request. |
| `DeliveredTime` | Date | Timestamp of when the handset received the message. |
| `ReadTime` | Date | Timestamp of when the user opened the message. |
| `JourneyName` | Text | The Journey Builder canvas name where the trigger originated (Dynamic fallback enabled). |
| `Logs` | Text | Simple Executive view of `Success` or `Failed`. |
| `FailedReason` | Text | Meta API error codes if a message bounces (e.g. invalid number). |

### 2. `WhatsApp_Received_Messages` (The Inbound Log)
**Purpose:** Stores conversational replies sent by your users back to your Brand's WhatsApp number. 

| Field Name | Type | Purpose |
| :--- | :--- | :--- |
| `WaMid` (Primary Key)| Text | Unique WhatsApp Message ID for the inbound reply. |
| `Phone` | Text | The user's phone number. |
| `ContactName` | Text | The user's WhatsApp display profile name (if public). |
| `MessageType` | Text | Typically 'text'. |
| `MessageContent` | Text | The actual text body the user wrote. |
| `ReceivedTime` | Date | The exact timestamp the reply hit our webhook. |

### 3. `WhatsApp_OptOuts` (The Suppression List)
**Purpose:** Secures compliance. When a user naturally texts the word `STOP`, `QUIT`, `CANCEL`, `END`, or `UNSUBSCRIBE`, they bypass standard inbound routing and go straight to this specialized exclusion DE.

| Field Name | Type | Purpose |
| :--- | :--- | :--- |
| `Phone` (Primary Key) | Text | The number strictly requesting opt-out. |
| `Action` | Text | Hardcoded as `OptOut`. |
| `Timestamp` | Date | The exact moment they opted out. |

> [!CAUTION]  
> **To your SFMC Administrators:** The `WhatsApp_OptOuts` DE **must** be actively applied as an **Exclusion List** within all live Journeys. Salesforce will not automatically block the route; your Journey Settings must enforce it.

---

## Automated Bot Handlers

The Webhook processor currently runs two independent autonomous functions so your support team doesn't have to:

1. **Opt-Out Responder** 
   - **Trigger:** A user replies with `STOP`.
   - **Action:** Immediately halts any local notifications, writes to `WhatsApp_OptOuts`, and sends a WhatsApp confirmation saying: *"You have been successfully unsubscribed from these messages."*

2. **First-Time Welcome Greeting**
   - **Trigger:** A user replies normally (e.g., "Hello" or "I have a question").
   - **Action:** The system checks standard database history. If this is their very first inbound message, they receive: *"Thank you for reaching out to Pentacloud Consulting! A member of our team will be with you shortly."* Subsequent messages are silently routed to the conversation dashboard without triggering the bot again.
