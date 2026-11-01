# Product Requirements Document (PRD): espressivo ART
**Platform**: espressivo ART (International Creative Competition Platform)  
**First Flagship Edition**: *espressivo VOCAL — Young Talents*  
**Document Version**: 1.0.0 (Production Architecture Draft)  
**Status**: APPROVED FOR IMPLEMENTATION  
**Author**: Product Architect & Business Analyst  

---

## 1. Executive Summary & Vision

### 1.1 Product Mission
**espressivo ART** is a modern, high-trust digital platform engineered to organize, adjudicate, and celebrate international youth creative competitions. Traditional arts competitions suffer from opaque scoring, cumbersome manual application workflows, insecure media handling, slow paper-based certification, and archaic affiliate communication. 

**espressivo ART** addresses these pain points by providing:
1. **Curated Editorial Public Experience**: An aesthetic, museum-grade public gallery built on the *Art+Commerce (Quiet Editorial Gallery)* design system that honors the cultural prestige of classical and contemporary performance arts.
2. **Midnight Cinema Workstation for Creators & Adjudicators**: A distraction-free *Frame.io-inspired darkroom workspace* optimized for media evaluation, transparent score auditing, and streamlined financial management.
3. **Rigorous Child Protection & Minor Data Privacy (GDPR / 152-ФЗ compliant)**: Complete isolation of personal identifiable information (PII) of minors from adjudicators via blinded scoring, cryptographically logged parental/guardian consents, and secure video access.
4. **Transparent, Automated Teacher Incentive Model**: An automated 20% affiliate revenue share engine with an immutable double-entry ledger, real-time attribution tracking, and clear payout lifecycles.
5. **Instant Verifiable Certification**: Automated generation of print-ready bilingual (RU/EN) PDF diplomas featuring tamper-evident QR codes linked to platform validation registers.

### 1.2 Target Audience & Core Personas

| Persona | Role | Key Motivations & Objectives | Primary Constraints |
| :--- | :--- | :--- | :--- |
| **Young Talent / Contestant** | Participant (Minor) | Showcase vocal mastery, receive prestigious international recognition, obtain an official diploma for their portfolio. | Relies on parents/legal guardians for legal consent and payment; requires a simple, encouraging submission interface. |
| **Parent / Legal Guardian** | Participant (Billing & Legal) | Ensure safety and privacy of child's data and media; track review status; pay smoothly via familiar payment methods; download high-res diploma. | High sensitivity to video privacy and data security; low tolerance for friction in checkout and forms. |
| **Vocal Teacher / Studio Director** | Teacher (Affiliate & Mentor) | Provide performance opportunities for pupils; track students' progress and scores; earn predictable 20% compensation for promotional efforts. | Needs transparent financial records, unique promo links, fast payout processing, and professional accreditation. |
| **Jury Member / Master Artist** | Jury (Adjudicator) | Objectively evaluate vocal performances without distraction or bias; submit rubric scores and constructive feedback quickly; preserve artistic integrity. | Limited time; requires an uncluttered darkroom player, clear criteria, autosaving drafts, and blinded applicant info. |
| **Platform Administrator / Contest Director** | Administrator | Configure competitions, monitor adjudication velocity, resolve ties, audit outlier scores, manage teacher disbursements, publish official results. | Requires strict RBAC, comprehensive audit logs, batch operations, and zero data leakage. |

---

## 2. Global System Architectural Requirements

### 2.1 Multi-Tenant Localization (i18n)
1. **Supported Locales**: Russian (`ru-RU`, default) and English (`en-US`).
2. **Scope of Localization**:
   - All public marketing and editorial copy.
   - All dashboard interactive elements, validation messages, form hints, and transactional notifications.
   - All database dynamic entities (Contest names, descriptions, regulations, nominations, scoring criteria definitions).
   - Generated PDF Diplomas (dual RU/EN typography with culturally appropriate academic terminology: e.g., "Лауреат I степени" / "Laureate 1st Degree").
3. **Localization Resolution Strategy**:
   - URL path prefix: `/{locale}/...` (e.g., `/ru/contests/vocal-2026`, `/en/contests/vocal-2026`).
   - Browser `Accept-Language` header auto-detection on first visit with persistent cookie storage `NEXT_LOCALE`.
   - Strict fallback to `ru` for missing translation keys with automated logging in staging environments.

### 2.2 Aesthetic & Ergonomic Split (Refero Design System Integration)
1. **Public Web Portal**:
   - Design System: `Art+Commerce / Quiet Editorial Gallery on Bone Paper`.
   - Color Tokens: `#e7e7e7` (Bone canvas), `#000000` (Ink text/accents), `#121212` (Charcoal).
   - Typography: `Adobe Garamond` (weight 400 at 56px/20px/16px) paired with `Akzidenz Grotesk` (weights 400/500/700 uppercase at 8–10px, tracking `+0.027em` to `+0.038em`).
   - Layout: 0px border-radius, full-bleed imagery, no drop shadows, 44px section breathing room.
2. **Workspaces & Dashboards (Participant, Teacher, Jury, Admin)**:
   - Design System: `Frame.io / Midnight Cinema Projection Room`.
   - Color Tokens: `#0a0a13` (Obsidian canvas), `#040407` (Void nav), `#08080c` (Graphite surface), `#6199f6` (Iris Glow chromatic accent), `#4f4f80` (Twilight card borders/glow), `#fcfcfc` (Carbon Vellum typography).
   - Typography: `FrameGothic` (400/500 display and body) with `NeueMachinaInktrap` (all-caps tracked eyebrow stamps).
   - Layout: 100px radius for pills/buttons, 10px radius for preview cards, subtle radial cosmic atmosphere.

---

## 3. Functional Modules & Feature Specifications

### 3.1 Public Portal Module
The public portal establishes authority, cultural gravitas, and clear contest terms.

| Feature ID | Screen / Section | Requirements & Specifications | Acceptance Criteria |
| :--- | :--- | :--- | :--- |
| **PUB-01** | Global Navigation | Sticky minimalist top bar on Bone canvas. Logo flush left, navigation items (CONTESTS, NOMINATIONS, REGULATIONS, JURY, ABOUT, SIGN IN) flush right in tracked Akzidenz Grotesk caps. Language switcher (`RU` / `EN`). | Nav height 44px; active state indicated by 1px bottom ink border. Zero drop-shadows. |
| **PUB-02** | Hero Section | Full-bleed editorial presentation of "espressivo VOCAL — Young Talents". Hero headline in Adobe Garamond 400 at 56px. Subheadline with dates, age groups (5–25 y/o), and prize fund highlights. Primary CTA: "APPLY NOW" / "ПОДАТЬ ЗАЯВКУ". | Instant loading, responsive layout, seamless transition to application onboarding. |
| **PUB-03** | Competition Catalog & Details | Dedicated pages for each competition edition. Detailed syllabus: categories (Academic, Pop/Variety, Jazz, Folk, Choral/Ensemble), deadlines, entry fees, and jury panel. | Filterable by discipline, age group, and format. Searchable repertory guidelines. |
| **PUB-04** | Regulations & Guidelines | Full legal regulations, submission guidelines (one piece per application, max duration 5 min for soloists, unedited single-take video recording rule), criteria weights, award thresholds. | Clear, printable layout; downloadable PDF regulation copy with timestamp. |
| **PUB-05** | International Jury Showcase | Curated profiles of adjudicators: high-definition black-and-white portraits, credentials (Conservatory professors, Honored Artists, international opera singers), masterclass previews. | Consistent editorial card treatment, credentials listed with tracked Grotesk tags. |
| **PUB-06** | Authentication & Onboarding | Unified auth modal/page supporting Email + Password, Magic Link, and social OAuth (Google, Yandex, VK ID). Explicit role selection on signup (Contestant/Parent vs Teacher). | Single sign-on with role-based routing upon successful authentication. |

---

### 3.2 Participant Dashboard (Contestant & Parent)
Designed for frictionless application submission, legal compliance, and joyful recognition.

| Feature ID | Feature Name | Description & Business Logic | Technical & UX Rules |
| :--- | :--- | :--- | :--- |
| **PAR-01** | Application Builder & Autosave Draft | Multi-step form: (1) Contest & Nomination selection, (2) Contestant Profile & Age Category auto-resolution, (3) Repertoire & Performance Metadata, (4) Video Submission, (5) Teacher Referral Code (optional), (6) Legal Consents & Verification. | State persisted automatically to localStorage and backend every 3 seconds or on blur. Draft can be resumed anytime prior to contest closing date. |
| **PAR-02** | Video Submission Multi-Source Parser | Accepts unlisted / protected video links from: **YouTube** (Unlisted), **Rutube** (Private/Unlisted link), **VK Video** (Unlisted/Direct link), **Yandex Disk**, **Google Drive**, **Mail.ru Cloud**. | Server-side link validation regex + oEmbed / API health check. Flags broken links, private permissions, or inaccessible drives with instant inline visual guidance. |
| **PAR-03** | Parental Consent & Minor Protection | Mandatory electronic consent form for contestants under 18 years: Parent/Guardian Full Name, Contact Email, Passport/ID reference (optional by jurisdiction), explicit checkbox for Minor PII Processing (152-ФЗ / GDPR Art. 8) and non-commercial performance broadcast. | Cryptographic log saved with User ID, Timestamp, IP address, and User-Agent hash. Form cannot be submitted without active consent. |
| **PAR-04** | Application Fee Payment Integration | Seamless checkout modal supporting bank cards (Mir, Visa, Mastercard), Tinkoff Pay, SberPay, and international acquiring (Stripe / alternative gateway for non-RUB). | Dynamic price calculation based on nomination type (Solo vs Ensemble). Dynamic coupon / referral validation. |
| **PAR-05** | Live Application Status Tracker | Visual stepper tracking the application lifecycle: `Draft` -> `Payment Pending` -> `Paid / In Review` -> `Under Evaluation` -> `Results Published`. | Real-time push / WebSocket or polling updates with clear badge states in Frame.io Midnight palette. |
| **PAR-06** | Adjudication Feedback & Score Card | Once results are published: displays aggregated score (e.g. 96.5 / 100), placement title (e.g., "Laureate 1st Degree"), breakdown by criteria, and constructive jury commentary. | Anonymized jury signatures (e.g. "Jury Member #1: Vocal Coach, Royal Academy"). |
| **PAR-07** | PDF Diploma Generator & QR Registry | High-resolution, vector-rendered print-ready PDF certificate (A4 300 DPI) with child's name, teacher's name, nomination, award, official seals, and a unique cryptographic verification QR code pointing to `/verify/{diplomaId}`. | Server-side rendering (Node.js Chromium / Puppeteer or Typst / PDFKit). Instant one-click download. |

---

### 3.3 Teacher Dashboard (Affiliate & Pedagogical Mentor)
Designed as a professional CRM and financial dashboard for music educators and studio directors.

| Feature ID | Feature Name | Description & Business Logic | Technical & UX Rules |
| :--- | :--- | :--- | :--- |
| **TEA-01** | Referral Engine & Custom Promo Links | Unique persistent referral code (e.g., `ELENA-VOCAL`) and deep link (`https://espressivo.art/ref/ELENA-VOCAL`). Copy-to-clipboard, QR code download, social sharing snippets. | 30-day attribution cookie on visitor browser. If contestant inputs code manually at checkout, manual code overrides or sets attribution. |
| **TEA-02** | Roster of Attributed Students | Real-time table displaying all students who registered via teacher's link: Student Full Name, Contest Edition, Nomination, Submission Date, Payment Status (`Unpaid`, `Paid`, `Refunded`). | Privacy-safe view: student contact info masked, performance status visible. |
| **TEA-03** | Automated 20% Commission Accrual | Exactly **20%** of the net competition entry fee is credited to the teacher's pending balance immediately upon confirmed bank payment webhook. | Idempotent transaction handling using PostgreSQL atomic transactions and double-entry ledger. Zero accrual on failed or refunded payments. |
| **TEA-04** | Balance & Financial Ledger | Real-time balance display: `Available for Payout`, `Pending Clearance` (held during 7-day chargeback buffer), `Total Lifetime Earnings`. Detailed immutable ledger of every credit/debit transaction. | Exportable to Excel / CSV / PDF statement. All entries link to Application IDs. |
| **TEA-05** | Payout Request Engine | Teacher submits payout request when available balance exceeds minimum threshold (e.g., 2,000 RUB / 30 EUR). Teacher specifies payout channel: Self-Employed (СЗ / НПД), Legal Entity / Individual Entrepreneur (ИП), or Bank Card (СБП / Card P2P). | Validation of Tax ID (ИНН) and bank account details (БИК, расчетный счет) with validation masks. |
| **TEA-06** | Pedagogical Diploma & Letter of Appreciation | Automated generation of official Teacher Gratitude Diploma ("Благодарственное письмо за подготовку Лауреата") for every student who reaches Laureate status. | Dual-language PDF download directly from Teacher portal. |

---

### 3.4 Jury Workstation (Expert Adjudicator)
A distraction-free, blind-audition workstation designed to prevent unconscious bias and cognitive fatigue.

| Feature ID | Feature Name | Description & Business Logic | Technical & UX Rules |
| :--- | :--- | :--- | :--- |
| **JUR-01** | Blind Evaluation Queue | List of applications assigned to the specific jury member by the administrator. Status badges: `Pending Evaluation`, `Draft Saved`, `Completed`. | **Strict Anonymization**: The jury sees only: (1) Application Code (e.g., `#VOC-26-0412`), (2) Age Category (e.g., "Category B: 9–11 y/o"), (3) Nomination, (4) Repertoire Title & Composer, (5) Embedded Video. **Child's full name, country/city, school, and teacher name are strictly hidden**. |
| **JUR-02** | Integrated Midnight Video Player | High-fidelity video embed container featuring custom playback controls, timestamp bookmarks for note-taking, playback speed adjustments (0.75x, 1x, 1.25x), and audio waveform visualizer. | Sandboxed iframe with `sandbox="allow-scripts allow-same-origin"` blocking external tracking and comments. |
| **JUR-03** | Multi-Criteria Scoring Rubric | Standardized scoring grid for vocal competition (scale 1 to 25 points per criterion, total 100):<br>1. *Vocal Technique & Breath Control* (1–25)<br>2. *Intonation & Pitch Accuracy* (1–25)<br>3. *Artistry, Musicality & Expression* (1–25)<br>4. *Repertoire Complexity, Diction & Style* (1–25) | Interactive sliders and number steppers. Real-time total calculation. Visual cues for score boundaries (e.g., 90–100 = Laureate I range). |
| **JUR-04** | Structured Qualitative Commentary | Mandatory text feedback field (min 100 characters) split into: (a) *Key Strengths & Merits*, (b) *Pedagogical Recommendations for Growth*. | Autosaved every keystroke to backend draft table. Spell-check enabled. Voice-to-text dictation integration. |
| **JUR-05** | Final Score Confirmation & Immutable Lock | "Submit Evaluation" triggers a review modal displaying all entered scores and feedback. Upon clicking "Confirm & Lock", the score is cryptographically timestamped and converted to `READ_ONLY`. | Database enforcement: UPDATE rejected if status is `LOCKED`. Jury cannot alter score without Admin override ticket. |

---

### 3.5 Administrative Console (Operations & Governance)
Unified command center for platform directors, contest managers, and financial controllers.

| Feature ID | Feature Name | Description & Business Logic | Technical & UX Rules |
| :--- | :--- | :--- | :--- |
| **ADM-01** | User & Role Management | RBAC user management: assign/revoke roles (`ADMIN`, `JURY`, `TEACHER`, `PARTICIPANT`). Password resets, two-factor authentication (2FA) enforcement for staff, account suspension. | Full audit logging of all administrative actions. |
| **ADM-02** | Competition & Syllabus Builder | Create and configure competitions: Title, Slug, Banner imagery, Dates (Registration start/end, Judging period, Results announcement), Entry fee tiers, Age category boundaries, Custom scoring rubrics. | Draft, Staging, and Production publishing states. |
| **ADM-03** | Application Moderation & Jury Assignment | Review incoming submissions for technical compliance (valid video, clear audio, correct repertoire). Batch-assign applications to jury panels (randomized, balanced, or category-specialized). | Prevents assigning jury members to contestants from their own studio/institution (conflict-of-interest check). |
| **ADM-04** | Live Adjudication Audit & Anomaly Detection | Real-time monitoring of jury scoring progress (% completed). Statistical outlier detection: flags scores deviating by >15 points from the panel average for administrative review. | Side-by-side score comparison matrix. Tie-breaking and normalization controls. |
| **ADM-05** | Official Results Publication Engine | Automatic award allocation based on configurable score brackets:<br>- *Grand Prix*: ≥ 98.0 (highest score, jury consensus)<br>- *Laureate I*: 90.0 – 97.9<br>- *Laureate II*: 80.0 – 89.9<br>- *Laureate III*: 70.0 – 79.9<br>- *Diplomant I/II/III*: 60.0 – 69.9<br>- *Participant*: < 60.0<br>Admin one-click button to publish results publicly and release diplomas to participant dashboards. | Transactional publication: updates all applications, unlocks public leaderboard, triggers email notification queue. |
| **ADM-06** | Diploma Template Editor & Batch Signer | Upload SVG/PDF diploma backgrounds for each competition. Visual positioning tool for dynamic text fields (Contestant Name, Teacher Name, Award, QR Code, Signatures). Batch rendering and cloud storage upload. | Generates signed cryptographic hashes for each issued diploma. |
| **ADM-07** | Financial Journal & Payout Operations | Master ledger of all incoming payments, gateway fees, platform margin, and teacher commission accruals. Payout review queue: verify teacher tax status, approve/reject payout requests, record bank payment order IDs. | Double-entry validation: sum of debits must equal sum of credits. Export for 1C / Accounting. |
| **ADM-08** | System Settings & Audit Logs | System-wide configuration: maintenance mode, payment gateway API keys, email SMTP / transactional provider settings, webhook debuggers, immutable security audit logs. | Read-only audit logs with retention of 3 years. |

---

## 4. Minor Protection, Data Privacy & Security Architecture

### 4.1 Minor Data Privacy Standard (GDPR / 152-ФЗ Compliance)
Because contestants in "Young Talents" are predominantly minors (ages 5 to 17), strict legal safeguards are enforced:
1. **Parental / Guardian Authority**: Minors under 14 cannot enter into legally binding contracts; registration and consent must be provided by parents or legal representatives. Minors aged 14–17 require parental written/electronic assent.
2. **Blinded Adjudication Architecture**:
   - The Jury API projection strictly filters out `first_name`, `last_name`, `birth_date`, `email`, `phone`, `city`, `teacher_id`, and `school_name`.
   - The video stream is served through a sanitized container without revealing the uploader's channel name or external profile comments.
3. **Consent Management Register**:
   - Every application requires an explicit, unticked checkbox confirming consent to:
     - Storage and processing of minor's personal data.
     - Public display of minor's name, age, city, and performance video on the official competition results leaderboard and archival social media channels.
   - Withdrawal of consent triggers an administrative redaction pipeline (name replaced by initials or removed from public leaderboard).

### 4.2 Protected Media Architecture
1. **Video Ingestion Security**:
   - Direct raw video file uploads to application servers are prohibited in MVP to eliminate malware, transcode costs, and storage bloat.
   - External streaming providers are utilized: YouTube (Unlisted), Rutube (Unlisted), VK Video (Private/Unlisted), Yandex Disk / Google Drive.
2. **Access Control & Embedding**:
   - Embedded players in the Jury Workstation are protected via signed session tokens.
   - Referrer-policy headers are restricted (`strict-origin-when-cross-origin`) and framed within an isolated sandboxed iframe.

### 4.3 Financial Integrity & Double-Entry Ledger
1. **Idempotency**: All webhook events from payment gateways (e.g., `payment.succeeded`, `refund.succeeded`) require a unique `idempotency_key` (Gateway Transaction ID). Re-sent webhooks return HTTP 200 without duplicate commission accruals.
2. **Double-Entry Ledger Invariant**: Every monetary movement is recorded as a balanced pair:
   - *On Contestant Payment (e.g. 3,000 RUB)*:
     - `Debit`: Gateway Cash Account (+3,000 RUB)
     - `Credit`: Competition Revenue (+2,400 RUB)
     - `Credit`: Teacher Commission Payable (+600 RUB [20%])
   - *On Teacher Payout (e.g. 600 RUB)*:
     - `Debit`: Teacher Commission Payable (-600 RUB)
     - `Credit`: Bank Settlement Account (-600 RUB)
3. **Clawback Policy**: If a contestant payment is formally refunded or subject to a chargeback, the corresponding 20% commission is debited from the teacher's pending or available balance. If the balance becomes negative, future earnings cover the deficit.

---

## 5. Role-Based Access Control (RBAC) Matrix

The platform enforces fine-grained permissions across all 5 user classifications:

| Entity / Resource | Guest | Participant | Teacher | Jury | Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Public Site Pages & Regulations** | R | R | R | R | CRUD |
| **Contest Syllabus & Nominations** | R | R | R | R | CRUD |
| **User Own Profile** | - | CRU | CRU | CRU | CRUD |
| **Own Applications (Draft / Active)** | - | CRUD (Draft)<br>R (Submitted) | - | - | CRUD |
| **Foreign Applications** | - | - | - | - | CRUD |
| **Assigned Applications (Evaluation)**| - | - | - | R (Blinded) | CRUD |
| **Jury Scores & Feedback** | - | R (Post-Release) | - | CRU (Draft)<br>R (Locked) | CRUD |
| **Teacher Referral Link & Code** | - | - | CRU | - | CRUD |
| **Teacher Student Roster & Commission**| - | - | R (Own) | - | CRUD |
| **Payout Requests** | - | - | CR (Own) | - | CRUD |
| **Diplomas & Certificates** | R (Verify) | R (Own Download) | R (Own Students) | - | CRUD |
| **Financial Journal & System Settings**| - | - | - | - | CRUD |

*Legend: C = Create, R = Read, U = Update, D = Delete, - = No Access.*

---

## 6. Non-Functional Requirements (NFR)

1. **Performance & Core Web Vitals**:
   - Public Landing Page Largest Contentful Paint (LCP) ≤ 1.2s on high-speed connections.
   - Cumulative Layout Shift (CLS) = 0.
   - First Input Delay / INP ≤ 100ms.
2. **Reliability & Availability**:
   - 99.9% uptime during submission deadlines and judging windows.
   - Automated database backups every 6 hours with point-in-time recovery (PITR).
3. **Scalability**:
   - System must handle up to 5,000 concurrent video playback and evaluation sessions without degradation.
   - Batch PDF generation queue must process 1,000 diplomas in < 15 minutes.
4. **Security & Data Integrity**:
   - TLS 1.3 enforced across all endpoints with HSTS.
   - Passwords hashed using `Argon2id` or `bcrypt` with salt rounds ≥ 12.
   - Content Security Policy (CSP) allowing only authorized video frame origins (`youtube-nocookie.com`, `rutube.ru`, `vk.com`, `yandex.ru`).
