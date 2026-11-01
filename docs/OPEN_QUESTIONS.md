# Open Questions, Assumptions & MVP Configuration: espressivo ART
**Platform**: espressivo ART (International Creative Competition Platform)  
**First Flagship Edition**: *espressivo VOCAL — Young Talents*  
**Document Version**: 1.0.0 (Production Architecture Draft)  
**Status**: APPROVED FOR ARCHITECTURAL REVIEW  
**Author**: Product Architect & Business Analyst  

---

## 1. Executive Context & Purpose

This document catalogs critical business, legal, operational, and architectural decisions that require stakeholder validation or formal executive sign-off prior to Phase B (Development & Implementation). It also documents the explicit baseline assumptions made to allow engineering to proceed without blockers.

---

## 2. Business & Legal Decisions

### 2.1 Multi-Currency Acquiring & Cross-Border Payments
- **Context**: "espressivo VOCAL — Young Talents" is branded as an international contest. Participants will originate from Russia, the CIS, Europe, and Asia.
- **The Dilemma**: Sanctions and cross-border payment restrictions prevent a single payment gateway from serving Russian domestic cards (Mir, Tinkoff, Sber) and Western cards (Visa, Mastercard, American Express).
- **Options Under Consideration**:
  1. *Dual Gateway Architecture (Recommended for MVP)*:
     - Route Russian RUB payments through **YooKassa** or **CloudPayments / Tinkoff Acquiring**.
     - Route International payments (EUR, USD) through **Stripe** (registered under a foreign entity, e.g. Cyprus, Armenia, UAE) or **Prodamus / Robokassa Global**.
  2. *Single Global Aggregator (e.g., Payoneer, Crypto, or Specialized Payout Gateway)*:
     - Lower administrative overhead, but higher checkout abandonment among Russian domestic users.
- **MVP Working Assumption**: Implement an abstract `PaymentGatewayAdapter` interface with two initial provider drivers: `YooKassaProvider` (RUB) and `StripeProvider` (EUR/USD), dynamically selected based on customer location and currency selection.

---

### 2.2 Teacher Affiliate Payouts: Taxation & Legal Compliance
- **Context**: The platform promises a 20% commission on confirmed participant entry fees.
- **The Dilemma**: Disbursing cash to hundreds of music teachers creates significant tax withholding and reporting obligations depending on their employment status.
- **Teacher Status Scenarios**:
  - **Self-Employed (Самозанятые / НПД)**: Simplest path in Russia. Platform transfers funds; teacher issues an electronic fiscal receipt via "Мой Налог" API or uploads it. Tax rate (6%) is borne by the teacher.
  - **Individual Entrepreneurs (ИП)**: B2B settlement via bank payment order; zero tax withholding for the platform.
  - **Physical Persons (Без статуса самозанятого)**: Platform legally acts as a tax agent (requires withholding 13% NDFL + paying ~30% social contributions), which destroys the economic viability of the 20% margin.
  - **Foreign Teachers (Non-RU residents)**: Require international cross-border transfer (IBAN / SWIFT / P2P).
- **Options Under Consideration**:
  1. *Use an Affiliate Payout Aggregator (e.g., Solar Staff / Jump.Finance / Konsol)*:
     - The aggregator handles all legal agreements, tax checks, self-employed receipt generation, and payouts across cards and accounts in 190+ countries for a 3–5% operational fee.
  2. *Strict MVP Policy (Self-Employed & Legal Entities Only)*:
     - Payouts in Phase 1 are disbursed exclusively to verified Self-Employed (СЗ) and Legal Entities (ИП/ООО) via automated bank register. Physical persons can use their balance as entry fee coupons or wait for Solar Staff integration in Phase 2.
- **MVP Working Assumption**: Adopt Option 2 for the MVP launch (fastest to market, lowest legal exposure), with clean integration points for Solar Staff in Phase 2.

---

### 2.3 Minor Personal Data Protection (152-ФЗ & GDPR Art. 8)
- **Context**: Most participants are between 5 and 17 years old.
- **Questions**:
  1. Does the platform require an electronic signature (PEP / Simple Electronic Signature via SMS verification code) for parental consent, or is a checked consent box during authenticated session legally sufficient?
  2. Can a minor's video performance be publicly embedded on the platform's public "Winners Gallery" / Hall of Fame after the competition?
- **MVP Working Assumption**:
  - Simple Electronic Signature: Consent timestamp, parent email, parent full name, IP address, and User-Agent are stored as an immutable audit record in PostgreSQL.
  - Granular Opt-in: Application form features two distinct consents:
    - *Consent A (Mandatory)*: Processing of PII and private video adjudication by jury.
    - *Consent B (Optional)*: Public exhibition of video on the platform's leaderboard and promotional channels. If unchecked, the contestant's name and award appear on the leaderboard, but the video link is kept private.

---

## 3. Product & Adjudication Rules

### 3.1 Scoring Algorithm & Jury Normalization
- **Context**: Each performance is reviewed by 3 to 5 independent adjudicators on a 100-point scale.
- **Questions**:
  - Should the final score be a simple arithmetic mean?
  - Should an "Olympic / Trimmed Mean" be applied (dropping highest and lowest scores) to eliminate bias or outlier sabotage?
  - What happens if one judge is consistently more severe (e.g. average score 72) than others (average score 94)?
- **MVP Working Assumption**:
  - For panels of 3 judges: Simple **Arithmetic Mean** of the 3 total scores.
  - For panels of 5+ judges: **Olympic Trimmed Mean** (discard the single highest and single lowest score, average the remaining 3).
  - Outlier detection alert: If any judge's score deviates by > 15 points from the panel median, the record is flagged in the Admin Console for director verification before publishing.

### 3.2 Age Category Calculation Cutoff Date
- **Context**: A child is 8 years and 11 months old when submitting the application, but turns 9 years old before the judging phase ends.
- **The Dilemma**: Determining the exact boundary date to prevent unfair placement in younger age brackets.
- **MVP Working Assumption**:
  - Age is determined strictly based on the child's age as of the **Official Contest Launch Date** (`contest.eligibility_cutoff_date`).
  - Example: If the contest eligibility date is October 1, 2026, anyone aged 8 on October 1 is assigned to Category A (5–8 y/o), regardless of whether their birthday falls within the submission or evaluation window.

### 3.3 Multi-Nomination & Repertoire Limits
- **Questions**:
  1. Can one contestant submit multiple applications (e.g. Academic Vocal AND Pop Vocal)?
  2. Is there a multi-submission discount?
  3. Are ensembles and duets priced per group or per member?
- **MVP Working Assumption**:
  - Multiple applications are permitted from a single parent account.
  - MVP Pricing Rule: Each application is treated independently. A 15% discount coupon is generated for the participant's second and subsequent applications in the same contest edition.
  - Ensembles/Duets pay a flat "Ensemble Application Fee" (e.g. 4,500 RUB vs 2,500 RUB for Solo), with a requirement to list all ensemble member names for inclusion on the official diploma.

---

## 4. Technical & Architectural Decisions

### 4.1 Video Ingestion: External Links vs Native S3 Uploads
- **Decision Matrix**:

| Feature / Criteria | External Links (YouTube/Rutube/VK/Drive) | Native S3 Upload + HLS Transcoding |
| :--- | :--- | :--- |
| **Infrastructure Cost** | **$0** (Zero storage and bandwidth cost) | High ($0.05/GB storage + $0.15/min video transcode) |
| **Development Speed** | **Fast** (1 week for validation & embedding) | Slow (4–6 weeks for chunked uploads, queues, transcode) |
| **Jury User Experience** | Dependent on external platform availability | Uniform, lightning-fast native player |
| **Privacy Control** | Unlisted links can theoretically be shared | Full signed URL DRM / HLS token protection |
| **Recommendation** | **MANDATORY FOR MVP** | Postpone to Phase 2 (Enterprise Edition) |

- **MVP Working Assumption**: Accept external unlisted links. Build a robust background health-checker that pings links every 12 hours leading up to adjudication to ensure links remain publicly or unlisted accessible.

---

### 4.2 PDF Diploma Generation Architecture
- **Context**: Thousands of high-resolution, vector-quality PDF certificates must be rendered with personalized names, scores, awards, and cryptographic QR verification codes.
- **Options**:
  - *Option A: Client-side PDF generation (jsPDF / pdf-lib)*: Lightweight on servers, but exposes vector assets, risks inconsistent font rendering across client devices, and cannot easily store official archive copies.
  - *Option B: Server-side Headless Chrome (Puppeteer / Playwright)*: Pixel-perfect HTML/CSS rendering matching the Art+Commerce design system, but memory-intensive under high concurrency.
  - *Option C: Headless PDFKit / Typst / Satori Microservice (Recommended)*: Server-side worker queue (BullMQ + Redis) generating standard A4 PDFs from SVG templates and storing them in S3 / MinIO.
- **MVP Working Assumption**: Use a Node.js micro-worker (Option C) running in the background queue. Every diploma is rendered once, digitally stamped with a SHA-256 hash, and uploaded to object storage. Subsequent participant downloads hit the CDN/S3 URL directly.

---

## 5. Scope Boundary: MVP (Phase 1) vs Future Phases

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MVP (PHASE 1) SCOPE                             │
├────────────────────────────────────────────────────────────────────────┤
│ • Full Public Portal (Art+Commerce Editorial on Bone Paper)            │
│ • Participant Dashboard with autosaving drafts and multi-source video  │
│ • Strict Parental Consent logging (152-ФЗ / GDPR compliance)          │
│ • Teacher Dashboard with 20% commission engine & ledger journal        │
│ • Blind Jury Workstation (Frame.io Midnight Cinema UI)                 │
│ • Multi-criteria scoring rubric with mandatory feedback & autosave     │
│ • Admin Console for contest setup, jury allocation, and results release│
│ • Server-side bilingual (RU/EN) PDF Diploma generator with QR codes    │
│ • Payment integration (YooKassa / Cards) with idempotent webhooks      │
│ • Manual / Bank-register Teacher Payout processing                     │
└────────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      PHASE 2 (PLANNED EVOLUTION)                       │
├────────────────────────────────────────────────────────────────────────┤
│ • Native S3 video upload with automated HLS transcoding                │
│ • Solar Staff / Automated Payout Gateway integration                   │
│ • Interactive Live Stream for Final Award Ceremony                     │
│ • Masterclass Booking & One-on-One Jury Mentorship marketplace         │
│ • Public Community Voting ("People's Choice Award")                    │
│ • Mobile Apps (iOS & Android) for Participant & Jury                   │
└────────────────────────────────────────────────────────────────────────┘
```
