# BloodBridge — Emergency Blood Shortage & Donor Matching Platform

> **Clinical Emergency Transfusion Operations & Targeted Donor Matching System**  
> Built for hospitals, blood banks, and verified voluntary blood donors.

---

## 🩸 Overview

During acute clinical emergencies (severe trauma, postpartum hemorrhage, major surgical complications), blood banks experience rapid, critical inventory depletion. Conventional donor recruitment relies on manual call lists, broadcast messaging, and ad-hoc social groups—leading to donor fatigue, poor match rates, and delayed transfusions.

**BloodBridge** replaces emergency broadcasts with an explainable, deterministic 6-factor donor matching engine, receiving capacity throttling (4 donors/hour per facility), and automated zero-PII emergency notifications via In-App alerts and cellular SMS.

---

## ✨ Key Capabilities

### 1. Explainable 6-Factor Donor Prioritization
Matches donors without black-box models or marketing buzzwords. Every match provides human-auditable rationales:
- **Proximity Score (35%)**: Haversine distance & travel duration calculated against approximate locality.
- **Availability Match (20%)**: Emergency on-call preferences and day-of-week criteria.
- **Clinical Urgency Alignment (15%)**: Critical vs. planned shortage prioritization.
- **Historical Reliability (10%)**: Ratio of accepted vs. declined prior emergency requests.
- **Donor Fatigue Mitigation (10%)**: Actively deprioritizes donors contacted in the last 14 days (max 3 appeals threshold).
- **Facility Operational Alignment (10%)**: Preferred transfusion center affiliations.

### 2. Multi-Persona Experience
- **Staff Portal (Transfusion Medicine)**:
  - Real-time ABO/Rh inventory monitoring with low/critical threshold alerts.
  - 3-step Emergency Shortage Wizard (< 60s creation flow).
  - Transparent Donor Matching roster with granular factor breakdown bars.
  - Appointment Roster with arrival check-in and automated inventory restocking upon intake completion.
  - Transfusion analytics and immutable clinical audit logs.
- **Donor Portal**:
  - Live eligibility indicator (enforces 56-day whole blood interval & deferral tracking).
  - Emergency Appeal response with single-tap slot booking.
  - Complete donation history and donation impact certificates.
  - Fatigue exposure metrics and communication preference controls.
- **Administrator Console**:
  - Dynamic matching algorithm weights tuning.
  - Clinical interval rules configuration (Whole blood, Platelets, Plasma).
  - Facility operating hours and hourly receiving bed capacity controls.
- **Persistent Hackathon Demo Controller**:
  - 1-click persona switching (Staff: Dr. Sarah Chen, Donor: Marcus Vance [O+], Donor: Elena Rostova [O-], Admin).
  - Jump directly to the active O+ Critical Shortage scenario.
  - Live SMS dispatch trigger to `+91 7985674878`.
  - 1-click demo state reset.

### 3. Cellular SMS Gateway Integration
- Direct telecommunication carrier dispatching via **Fast2SMS** (India `+91` mobile networks) and **Twilio** (Global E.164 networks).
- Strict zero-PII privacy guarantee: SMS messages contain zero patient identifiers, clinical conditions, or personal medical details.

---

## 🛠️ Architecture & Tech Stack

- **Backend**: Node.js 24 + Express.js + Native SQLite (`node:sqlite` / `DatabaseSync`) with WAL mode & depth-tracked reentrant savepoint transactions.
- **Frontend**: Vite + React 18 + TypeScript + Vanilla CSS Design System with accessible high-contrast clinical theme tokens.
- **Icons**: Lucide React.
- **Audit System**: Immutable clinical event ledger tracking inventory adjustments, dispatch actions, appointments, and persona switches.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 20.6+ or Node.js 24+
- npm

### 2. Installation
```bash
git clone https://github.com/SerieuxHope/hemalink.git
cd hemalink
npm install
```

### 3. Environment Setup (Optional for Real SMS)
Copy the example environment configuration:
```bash
cp .env.example .env
```
To receive real SMS on your mobile phone (`+91 7985674878`):
```env
# Option A: Fast2SMS (Recommended for Indian numbers)
FAST2SMS_API_KEY=your_fast2sms_api_key_here

# Option B: Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
```
*(If no API keys are provided, BloodBridge automatically operates in full simulated local delivery mode with complete audit logging).*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
```

---

## 🧪 Test Shortage Scenario

The database automatically seeds 3 blood banks, 123 realistic donors across all 8 ABO/Rh types, and an active critical shortage scenario:
- **Condition**: 12 units of O+ Whole Blood needed urgently at City Central Blood Bank.
- **Current Stock**: 3 units (Critical stockout hazard).
- **Target Donor**: Marcus Vance (`usr_donor_marcus`, O+, phone: `7985674878`).

---

## 🔒 Security & Healthcare Compliance

- **No Patient PII**: Transfusion requests and notification payloads specify blood group, component, units, and hospital receiving bay only.
- **Masked Locality**: Exact donor residential GPS coordinates are never surfaced in the UI; donors are displayed with jittered approximate locality (e.g., `Richmond Town (~3.8 km)`).
- **Immutable Audit Trail**: All clinical adjustments, SMS alerts, and donor status updates are recorded in SQLite audit logs with client IP and timestamps.

---

## 📄 License
MIT License.
