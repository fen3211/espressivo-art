# User Flows & System Scenarios: espressivo ART
**Platform**: espressivo ART (International Creative Competition Platform)  
**Flagship Contest**: *espressivo VOCAL — Young Talents*  
**Document Version**: 1.0.0 (Production Architecture Draft)  
**Status**: APPROVED FOR IMPLEMENTATION  
**Author**: Product Architect & Business Analyst  

---

## 1. Overview & Actor Personas

This document maps the end-to-end user journeys, decision gates, UI state transitions, and edge-case exceptions for all primary actors on the **espressivo ART** platform:
- **GUEST**: Unauthenticated visitor seeking information, regulations, and inspiration.
- **PARTICIPANT / PARENT**: Contestant and their legal guardian submitting performance applications and receiving diplomas.
- **TEACHER (AFFILIATE)**: Vocal instructor or studio director referring students, tracking submissions, and managing commissions.
- **JURY MEMBER**: Expert adjudicator performing blinded video evaluations and providing structured feedback.
- **ADMINISTRATOR**: Contest director and financial controller managing the entire platform lifecycle.

---

## 2. Flow 0: Guest Discovery & Onboarding Journey

```
[Guest Lands on Homepage]
         │
         ├──> Explores "espressivo VOCAL — Young Talents"
         ├──> Inspects Nominations, Age Categories, Regulations & Deadlines
         ├──> Views International Jury Profiles & Credentials
         │
         ▼
[Click "Apply Now" or "Sign In"]
         │
         ├──> Has Account? ── Yes ──> [Login Modal (Email / Password / OAuth)] ──> [Redirect to Dashboard]
         │
         └──> No ──> [Registration Form]
                          │
                          ├── Select Role: [Contestant / Parent] OR [Teacher / Mentor]
                          ├── Enter Email, Password, Name, Phone
                          ├── Consent to Terms of Service & Privacy Policy
                          └──> [Email Verification Sent] ──> [Role-Specific Onboarding]
```

### Detailed Steps:
1. **Landing & Engagement**: Guest enters via `/{locale}/` on the bone-paper editorial canvas. Inspects hero section with Adobe Garamond typography, viewing current competition dates, grand prix awards, and prestigious jury gallery.
2. **Catalog Navigation**: Browses `/contests/vocal-young-talents/` to review specific repertoire requirements:
   - Category A (5–8 y/o), Category B (9–11 y/o), Category C (12–14 y/o), Category D (15–17 y/o), Category E (18–25 y/o).
   - Nominations: Classical/Academic Vocal, Pop/Variety Vocal, Jazz Vocal, Folk/Traditional, Vocal Ensemble/Duet.
3. **Authentication Dispatch**:
   - Guest clicks "Apply Now" or "Teacher Portal".
   - System displays auth modal with dual options: `Participant / Parent` or `Teacher / Studio`.
   - Supports Email + Password, Magic Link, and OAuth (Google, Yandex, VK ID).
   - Upon successful signup, user profile is created with the corresponding role and redirected to their personal dashboard.

---

## 3. Flow 1: Participant & Parent Application Lifecycle

```
[Participant Dashboard] ──> Click "New Application"
         │
         ▼
[Step 1: Select Contest & Nomination]
   • Choose "espressivo VOCAL — Young Talents"
   • Choose Nomination (e.g., Pop Vocal Solo)
         │
         ▼
[Step 2: Contestant Details & Category Auto-Calculation]
   • Enter Child's Full Name, Date of Birth, Gender, City, Country
   • System dynamically calculates Age Category based on Contest Cutoff Date
   • Enter Educational Institution / Studio Name (Optional)
   • Enter Teacher's Name (Optional text for diploma)
         │
         ▼
[Step 3: Performance & Repertoire Metadata]
   • Song Title, Composer, Lyricist, Duration (MM:SS, max 5:00)
   • Performance Language, Optional Program Notes
         │
         ▼
[Step 4: Video Media Ingestion & Validation]
   • Paste Video URL (YouTube unlisted, Rutube unlisted, VK Video, Cloud Drive)
   • System validates format via regex and verifies accessibility via head request
   • Embedded thumbnail / preview rendered for participant confirmation
         │
         ▼
[Step 5: Teacher Referral Code Attribution]
   • Pre-filled if arrived via teacher link, or manual input (e.g. "MARIA-VOCAL")
   • Real-time validation badge: "Teacher Maria Ivanova attributed"
         │
         ▼
[Step 6: Legal Consents & Minor PII Authorization]
   • Parent / Legal Guardian Full Name, Email, Phone
   • Mandatory Checkbox: Parental Consent for Minor Data Processing (152-ФЗ / GDPR)
   • Mandatory Checkbox: Consent for Video Evaluation & Public Award Ceremony
         │
         ▼
[Step 7: Application Review & Fee Checkout]
   • Summary card of all details
   • Dynamic fee display (e.g., 2,500 RUB / 35 EUR)
   • Click "Pay Application Fee" ──> Redirect to Secure Payment Gateway
         │
         ├──> Payment Fails / Cancelled ──> Return to Draft (Status: DRAFT / PAYMENT_PENDING)
         │
         └──> Payment Succeeded (Webhook confirmed)
                  │
                  ▼
         [Status: PAID / IN_MODERATION]
                  │
                  ├── Moderation Approved ──> [Status: UNDER_EVALUATION]
                  │                                  │
                  │                                  ▼
                  │                           [Jury Scores Submitted]
                  │                                  │
                  │                                  ▼
                  └── Results Released ───────> [Status: RESULTS_PUBLISHED]
                                                     │
                                                     ├── View Aggregated Score & Feedback
                                                     └── Download Signed PDF Diploma (with QR)
```

### Detailed Validation & Edge Cases:
- **Autosave Engine**: Every step automatically commits changes to `applications_drafts` table every 3 seconds or on step navigation. Participant can close tab and resume at any point before deadline.
- **Age Category Invariant**: Calculated strictly as of the Contest Official Start Date (e.g. October 1, 2026), preventing dispute if child has a birthday during the judging period.
- **Broken Video Safeguard**: If video becomes inaccessible during moderation, system changes status to `NEEDS_REVISION` and triggers an urgent email/SMS notification with a 48-hour correction window.

---

## 4. Flow 2: Teacher Onboarding, Referral Tracking & Commission Payout

```
[Teacher Registers / Signs In]
         │
         ▼
[Teacher Workspace]
   • Instant generation of Unique Referral Code (e.g. "ELENA-VOCAL")
   • One-click copy of Affiliate Deep Link (https://espressivo.art/ref/ELENA-VOCAL)
   • Downloadable QR Code for studio printing or messenger distribution
         │
         ▼
[Contestants Apply via Teacher's Link or Code]
         │
         ▼
[Real-Time Attributed Roster]
   • Table: Student Name | Nomination | Submission Date | Status (Unpaid / Paid)
         │
         ▼
[Contestant Completes Payment (e.g. 3,000 RUB)]
         │
         ▼
[Automated 20% Commission Accrual Engine]
   • Atomic ledger entry created: +600 RUB
   • Balance moved to "Pending Clearance" (7-day anti-fraud / refund hold)
   • Automated email & push notification sent to Teacher
         │
         ▼
[After 7 Days: Funds Cleared]
   • Moved from "Pending Clearance" to "Available for Payout"
         │
         ▼
[Teacher Requests Payout]
   • Available Balance ≥ Minimum Threshold (e.g., 2,000 RUB)
   • Select Legal Status:
        ├── Self-Employed (Самозанятый / НПД): Enter ИНН + Bank Account / SBP
        ├── Individual Entrepreneur (ИП): Enter ИНН, БИК, Расчетный счет
        └── Physical Person: Bank Card / SBP transfer
   • Enter Payout Amount & Submit Request
         │
         ▼
[Status: PAYOUT_REQUESTED]
         │
         ▼
[Admin Review & Banking Settlement]
   • Admin verifies tax details & initiates bank disbursement
   • Admin inputs Bank Transaction Reference Number & marks DISBURSED
         │
         ▼
[Status: DISBURSED] ──> Teacher receives funds & system marks ledger entry settled
         │
         ▼
[Contest Concluded: Student Wins Laureate]
   • Teacher automatically receives "Special Pedagogical Certificate / Благодарность"
   • Available for one-click PDF download in Teacher Dashboard
```

### Critical Business Rules:
- **Cookie Attribution Window**: 30 days first-party secure cookie. Manual referral code entered in form overrides cookie if different.
- **Refund / Chargeback Clawback**: If participant payment is cancelled or charged back, the 20% pending commission is reversed in the ledger with reason code `CHARGEBACK_CLAWBACK`.

---

## 5. Flow 3: Jury Member Blind Audition & Rubric Evaluation

```
[Jury Member Logs In]
         │
         ▼
[Jury Workstation — Midnight Projection Room]
   • Filterable Queue: "All Assigned" | "Pending" | "Draft Saved" | "Completed"
   • Queue Metric: "14 of 32 Evaluated (43% Completed)"
         │
         ▼
[Select Application Card (e.g. Application #VOC-26-0412)]
         │
         ▼
[Blind Adjudication Screen]
   ┌─────────────────────────────────────────────────────────────┐
   │ BLIND METADATA (PII STRICTLY MASKED):                       │
   │ • Application Code: #VOC-26-0412                            │
   │ • Nomination: Academic Vocal Solo                           │
   │ • Age Category: Category B (9–11 years)                     │
   │ • Performance: G.B. Pergolesi — "Se tu m'ami" (3:15)        │
   │ [CHILD NAME, TEACHER, SCHOOL, CITY ARE FULLY HIDDEN]        │
   └─────────────────────────────────────────────────────────────┘
         │
         ├──> Video Player: Play, pause, 0.75x slow-mo, loop section
         │
         ▼
[Evaluation Rubric Scoring (Total: 100 Points)]
   • Criterion 1: Vocal Technique & Breath Control (Slider 1–25)
   • Criterion 2: Intonation & Pitch Accuracy (Slider 1–25)
   • Criterion 3: Artistry, Musicality & Interpretation (Slider 1–25)
   • Criterion 4: Repertoire Complexity & Diction (Slider 1–25)
   • Total Score dynamically updates in real-time
         │
         ▼
[Mandatory Qualitative Feedback]
   • Field A: "Outstanding Artistic Merits & Strengths" (min 50 chars)
   • Field B: "Pedagogical Recommendations for Vocal Growth" (min 50 chars)
         │
         ├── Click "Save Draft" ──> Status: DRAFT_SAVED (Can return anytime)
         │
         └── Click "Submit Evaluation"
                  │
                  ▼
         [Confirmation Modal with Final Score Breakdown]
                  │
                  ├── Confirm & Lock
                  │
                  ▼
         [Status: EVALUATION_LOCKED]
            • Form converts to Read-Only
            • Cryptographic timestamp & Jury User ID appended
            • Score committed to Final Aggregation Engine
```

---

## 6. Flow 4: Administrative Management & Governance

```
[Admin Console]
      │
      ├──> [Contest Setup]: Create "espressivo VOCAL", set dates, quotas, fee tiers
      │
      ├──> [Application Moderation]:
      │       • Review incoming applications for valid video links and repertoire
      │       • Accept or Request Revision with note
      │
      ├──> [Jury Panel Allocation]:
      │       • Assign 3 or 5 Jury Members per Nomination & Age Category
      │       • Conflict-of-Interest Filter: Auto-detects if teacher is jury
      │
      ├──> [Live Adjudication Monitor]:
      │       • Track scoring progress (% completion per jury member)
      │       • Statistical Outlier Alert: Highlight scores ±15 points from mean
      │
      ├──> [Score Aggregation & Deliberation]:
      │       • Calculate Olympic Mean or Weighted Average
      │       • Award Assignment Table (Grand Prix, Laureate I, II, III, Diplomant)
      │       • Resolve ties / manual award overrides with audit reason
      │
      ├──> [Publication & Diploma Distribution]:
      │       • Click "Publish Official Results"
      │       • Trigger batch PDF Diploma Generation with dynamic QR codes
      │       • Release score breakdown to participant dashboards
      │       • Blast automated notification emails
      │
      └──> [Teacher Payout Processing]:
              • Filter payout requests by status "PENDING"
              • Verify tax details, export payment register for bank
              • Mark "DISBURSED" with bank reference code
```

---

## 7. Comprehensive Error Handling & Edge Case Matrix

| Scenario / Edge Case | Trigger / Condition | System Detection | Recovery & Resolution Workflow |
| :--- | :--- | :--- | :--- |
| **Video Link Broken / Private** | Contestant entered private link or uploader removed video. | Video parser head check fails; or Jury flags "Cannot open video". | Application moved to `NEEDS_REVISION`. Auto-alert sent to parent with direct link to update video URL within 48 hours without losing queue spot. |
| **Webhook Replay / Duplicate Callback** | Payment gateway re-sends `payment.succeeded` event. | Incoming `transaction_id` matches existing processed record. | Webhook handler returns HTTP 200 immediately; no secondary commission or status update executed (Strict Idempotency). |
| **Teacher Code Entered After Payment** | Contestant forgot to enter teacher's code during application. | Participant contacts support within 48h with teacher name. | Admin can manually attribute application to teacher via Audit Console; system creates an `ADJUSTMENT_CREDIT` transaction in ledger. |
| **Jury Unresponsive / Incomplete Scoring** | Adjudicator fails to submit evaluations 12h before deadline. | Automated cron job scans for `PENDING` scores where `deadline < now() + 12h`. | Automated reminder to jury; if deadline passes, Admin can reassign pending queue to alternate jury or activate Olympic mean with remaining judges. |
| **Contestant Age Transition during Contest** | Contestant turns 12 during the competition period. | Application form birth date calculation. | System locks age calculation to official contest start date (`contest.eligibility_cutoff_date`). Child remains in Category B. |
| **Payment Refund / Chargeback** | Parent disputes charge via bank after commission was credited. | Payment gateway sends `chargeback.created` webhook. | Application cancelled; system logs `CLAWBACK_DEBIT` (-20%) on teacher balance. If balance is 0, balance becomes negative until next student payment. |
| **Extreme Jury Score Discrepancy** | Judge 1 gives 98/100, Judge 2 gives 65/100. | Variance algorithm flags record: standard deviation > 12.0. | Highlighted in Admin Audit Screen. Admin requests clarification from Judge 2 or marks as outlier to exclude from trimmed mean. |
