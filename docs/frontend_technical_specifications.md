# Frontend Technical Specification

## 1️⃣ Introduction
### **Purpose**
This document outlines the **Frontend Technical Specification** for the **Thai Language Learning Web Application**. It defines the technologies, UI structure, state management, API integration, validation, and user interactions.

### **Scope**
The frontend is responsible for:
- **Displaying and managing Thai vocabulary words** (Thai, Romanized, English).
- **Providing study activities for learning words**.
- **Tracking and visualizing study progress**.
- **Managing word groups for structured learning**.
- **Handling study sessions and results.**
- **Providing a responsive, user-friendly UI with dark/light mode support.**

---

## 2️⃣ Technology Stack
| Feature | Technology |
|---------|------------|
| **Frontend Framework** | React + Vite + TypeScript |
| **Styling** | Tailwind CSS |
| **State Management** | React Context API |
| **Routing** | React Router |
| **API Communication** | Fetch API / Axios |
| **Validation** | Backend validation (no real-time input validation) |
| **Theming** | Dark/Light mode toggle (in settings) |

---

## 3️⃣ UI Structure & Page Routing
The application consists of the following main pages:

### **Static Left Navigation Menu (Visible on all pages)**
- **Dashboard**
- **Study Activities**
- **Words**
- **Word Groups**
- **Sessions**
- **Settings**

### **Routes & Pages**
| Path | Page |
|------|------|
| `/` | Dashboard |
| `/study-activities` | Study Activities List |
| `/study-activities/:id` | Study Activity View |
| `/words` | Word List |
| `/words/:id` | Word Details |
| `/groups` | Word Groups List |
| `/groups/:id` | Word Group Content |
| `/sessions` | Study Sessions List |
| `/sessions/:id` | Study Session Details |
| `/settings` | Settings (Theme Toggle, Reset History) |

---

## 4️⃣ State Management
- **React Context API** will handle global state management.
- State includes:
  - **Current study session data.**
  - **Word list caching to minimize API calls.**
  - **User preferences (e.g., theme selection).**

---

## 5️⃣ API Integration
The frontend strictly follows the **backend API specifications**, with additional references to the **frontend-specific endpoints** as shown in the provided image.

### **API Endpoints Used by the Frontend**
| Method | Endpoint | Purpose |
|--------|---------|---------|
| `GET` | `/api/dashboard/last_study_session` | Fetch the last study session |
| `GET` | `/api/dashboard/study_progress` | Get total words studied & mastery progress (calculated on frontend) |
| `GET` | `/api/dashboard/quick-stats` | Fetch quick stats (success rate, total sessions, study streak) |
| `GET` | `/api/study-activities/:id/study_sessions` | Get study sessions for a specific activity |
| `POST` | `/api/study-activities` | Start a study activity (**Required params:** `group_id`, `study_activity_id`) |
| `GET` | `/api/words` | Get all words |
| `GET` | `/api/words/:id` | Get details of a specific word |
| `GET` | `/api/groups` | Fetch all word groups |
| `GET` | `/api/groups/:id` | Get details of a specific group |
| `GET` | `/api/groups/:id/words` | Get words belonging to a group |

---

## 6️⃣ Validation Rules
### **1. Input Validation (Backend-Side Only, No Real-Time Frontend Validation)**
- Prevent users from submitting **empty fields** when:
  - Adding a **new word** (Thai, Romanized, English required).
  - Creating a **new word group** (Name required).
  - Starting a **study session** (Must select a word group).

### **2. Study Activity Validation**
- Users **cannot launch a study session without selecting a group**.
- **Duplicate word groups** should be prevented from being created.

### **3. API Response Validation**
- If an API response contains **missing data**, display a **default placeholder** instead of showing an error.

### **4. Reset History Behavior**
- A confirmation popup **must appear** before resetting history.
- After resetting, the **user stays on the settings page**.
- All UI elements should **immediately update** to reflect the new database state.

---

## 7️⃣ UI Features & Theming
- **Dark/Light Mode Toggle:** Implemented in **Settings Page**.
- **No user customization beyond theming**.
- **Real-time UI updates**: The interface should update immediately when:
  - A new word or group is added.
  - A study session is completed.
  - Progress tracking data changes.

---

## 8️⃣ Future Considerations
- **Multi-user support:** Not implemented in this version but may be added later.
- **Additional study activities:** Only **Typing Tutor** is implemented for now; new activities may be introduced.
- **Group renaming & deletion:** Not currently available but could be added in the future.
- **Study history reset is irreversible** (requires confirmation before execution).
- **No animations or UI transitions planned.**

---

## 9️⃣ Summary
This document defines the **Frontend Technical Specification** for the **Thai Language Learning Web Application**, covering technology, API integration, validation, theming, and state management. Future considerations outline potential improvements and expansions.

This specification ensures the frontend aligns perfectly with backend functionalities and the user experience requirements.
