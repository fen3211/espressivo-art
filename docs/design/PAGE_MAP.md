# espressivo ART — Complete UX Page Map & Screen Specifications
**Version**: 1.0.0 (Stage A — Information Architecture & UX Mapping)  
**Author**: Lead UI/UX Designer  
**Scope**: 9 Public Pages + 28 Workspace Routes across 4 Personas (Participant, Teacher, Jury, Admin) = **37 Detailed Screen Specifications**  
**Status**: APPROVED FOR IMPLEMENTATION  

---

## Part 1: Public Website Screens (Art+Commerce / Quiet Editorial Gallery)
*Theme: `editorial-public` | Canvas: Bone `#e7e7e7` | Ink: `#000000` | Radius: `0px` | No Shadows*

---

### PUB-01: Main / Home Screen
- **Route**: `/`
- **Layout**: Full-bleed single-column editorial scroll (1440px max-width container, 100vw media).
- **Core User Objective**: Discover espressivo ART as the premier international competition platform, feel the gravitas of classical art curation, and enter the active season.
- **Block Structure**:
  1. `SiteHeader`: Flush left logo `espressivo ART` (Adobe Garamond 400 16px), flush right nav items (`CONTESTS`, `NOMINATIONS`, `RULES`, `JURY`, `ABOUT`, `SIGN IN`, `SUBMIT APPLICATION` [solid ink rectangular button]).
  2. `HeroSpread`: 100vw full-bleed high-art photograph (young opera singer in chiaroscuro studio lighting, raw edge, 0px radius).
  3. `HeroColophon`: 2-part full-width caption below hero: left "FEATURED ARTIST — ELENA ROSTOVA, SOPRANO (14 Y.O.)" in Garamond 16px; right "CURRENT SEASON: ESPRESSIVO VOCAL 2026" in Grotesk 10px uppercase (+0.033em tracking).
  4. `CuratedMissionStatement`: 56px Adobe Garamond statement centered in 840px column: *"An international sanctuary where young musical discipline meets world-class jury rigor. Judged in silence. Celebrated with permanence."*
  5. `ActiveContestShowcase`: Monolithic vertical showcase card of "espressivo VOCAL — Young Talents". Left: magazine-format cover art (0px radius). Right: Category specs (Academic Vocal, Pop/Jazz Vocal, Folk Vocal), Age Divisions (7–10, 11–14, 15–18, 19–25), Deadline countdown in tiny Grotesk caps.
  6. `JuryBoardTeaser`: 4 monochrome editorial portraits of international jury heads (Vienna, Milan, London, Berlin).
  7. `ColophonFooter`: Minimal colophon row with legal credits, foundation charter, and colophon stamp.
- **Data Entities**: Active contest entity, featured media asset, jury head previews, deadline timestamp.
- **Primary CTA**: `SUBMIT AN APPLICATION` (Solid Ink `#000000` rectangle, white Grotesk 10px text, 0px radius).
- **States**:
  - `Default`: High-res full-bleed photography, crisp typography.
  - `Loading`: Neutral Bone `#e7e7e7` placeholder boxes with subtle 1px hairline border pulses.
  - `Empty`: If no active contest: Large Garamond 56px headline *"SEASON TRANSITION"* with notification signup field.
  - `Error`: Inline hairline-bordered alert box with reload link: *"Unable to load current season index. Please refresh the page."*

---

### PUB-02: Contest Catalog & Archive
- **Route**: `/contests`
- **Layout**: Asymmetric vertical editorial index.
- **Core User Objective**: Browse open competitions, upcoming seasons, and historical laureate archives.
- **Block Structure**:
  1. `SiteHeader`
  2. `EditorialHeader`: 56px Garamond headline *"COMPETITIONS & SEASONS"*, colophon subtext *"ACTIVE & HISTORICAL EDITIONS"*.
  3. `SeasonStatusFilter`: Sharp text tab row: `[ALL EDITIONS]`, `[ACCEPTING SUBMISSIONS]`, `[IN EVALUATION]`, `[PAST LAUREATES]`.
  4. `ContestListIndex`: Alternating layout of contest editions:
     - Edition 01: `espressivo VOCAL — Young Talents (Season I)` — Full cover, deadline June 15, open for entries.
     - Edition 02: `espressivo PIANO — Masterworks (Season II)` — Upcoming Autumn 2026 announcement.
     - Edition 03: `espressivo STRINGS — Virtuoso (Season III)` — Preliminary prospectus.
  5. `ColophonFooter`
- **Data Entities**: Contest list, submission windows, laureate count, fee schedule.
- **Primary CTA**: `VIEW PROSPECTUS & APPLY` (1px Ink outline button, 0px radius).
- **States**:
  - `Default`: Clean tabular list separated by 1px `#000000` hairlines.
  - `Loading`: 3 rows of skeleton boxes matching Garamond text heights.
  - `Empty`: *"No archival editions match this criteria. Return to Active Editions."*
  - `Error`: Minimal error prompt with retry CTA.

---

### PUB-03: Main Contest Landing Page ("espressivo VOCAL — Young Talents")
- **Route**: `/contests/espressivo-vocal-young-talents`
- **Layout**: Extended vertical editorial monograph.
- **Core User Objective**: Understand the full scope of the vocal competition, prize fund, laureate benefits, and enter the submission funnel.
- **Block Structure**:
  1. `SiteHeader`
  2. `ContestTitleHero`: 56px Garamond display headline *"espressivo VOCAL — Young Talents"*, accompanied by official season dates, international registration code, and foundation seal.
  3. `FullBleedAtmosphere`: Full-width black-and-white performance photography.
  4. `PillarsOfExcellence`: 3-column minimalist grid with 1px borders:
     - 01. Blind & Impartial Jury Protocol.
     - 02. Personal Video Critiques & Masterclass Feedback.
     - 03. International Gala & Foundation Grant Fund (€15,000 total).
  5. `TimelineSection`: Vertical typographic timeline with hard milestone lines (Submission Deadline, Blind Preliminary Round, Jury Final Evaluation, Official Results & Diplomas Dispatch).
  6. `EntryFeeColophon`: Transparent pricing colophon (€45 Soloist, €70 Ensemble/Duo) with waiver grant terms.
  7. `BottomActionSpread`: Full-width banner: *"Applications close strictly at midnight CET on June 15."*
- **Primary CTA**: `BEGIN APPLICATION SUBMISSION` (Solid Ink `#000000`, 0px radius).
- **States**: Default, Loading, Closed state (`SUBMISSIONS CLOSED — IN EVALUATION`), Error.

---

### PUB-04: Nominations & Age Categories
- **Route**: `/contests/espressivo-vocal-young-talents/nominations`
- **Layout**: Clean editorial catalogue / specification sheet.
- **Core User Objective**: Identify the correct vocal category and age bracket for the applicant.
- **Block Structure**:
  1. `SiteHeader`
  2. `PageTitle`: *"NOMINATIONS & AGE DIVISIONS"* (Garamond 56px).
  3. `NominationDirectory`:
     - **Nomination A: Academic / Classical Solo Vocal** (Opera arias, romance, sacred vocal music).
     - **Nomination B: Pop & Contemporary Vocal** (World hits, author compositions, acoustic arrangements).
     - **Nomination C: Jazz Vocal & Improvisation** (Jazz standards, scat, blues ballads).
     - **Nomination D: Folk & Ethno Vocal** (Authentic ethnic repertoire, regional vocal styling).
     - **Nomination E: Vocal Ensembles & Duos** (Chambers, duets, trios up to 12 participants).
  4. `AgeDivisionMatrix`: Structured table with strict age boundaries calculated as of submission date:
     - Group 0 (Debut): 6–8 years.
     - Group I (Junior): 9–11 years.
     - Group II (Intermediate): 12–14 years.
     - Group III (Advanced): 15–17 years.
     - Group IV (Youth Master): 18–22 years.
  5. `RepertoireGuidelines`: Duration caps (max 4:30 min for soloists, 6:00 min for ensembles).
- **Primary CTA**: `SELECT NOMINATION & APPLY` (Direct jump into submission wizard).
- **States**: Interactive accordion expansion for repertoire nuances; all states specified.

---

### PUB-05: Regulations, Technical Requirements & Rules
- **Route**: `/contests/espressivo-vocal-young-talents/rules`
- **Layout**: Editorial charter / legal manifesto layout with sticky chapter index.
- **Core User Objective**: Review audio/video recording standards, anti-fraud rules, and scoring rubrics.
- **Block Structure**:
  1. `SiteHeader`
  2. `StickyIndexRail`: Fixed left nav (`01. GENERAL TERMS`, `02. VIDEO SPECIFICATIONS`, `03. SCORING CRITERIA`, `04. DIPLOMAS & TITLES`, `05. INTELLECTUAL PROPERTY`).
  3. `RuleSections`:
     - **Video Standards**: Continuous single-take recording (no autotune, no pitch correction, no audio editing cuts). Full body / torso visibility. High-definition (1080p minimum, 4K accepted). YouTube unlisted link or direct MP4/MOV upload.
     - **Scoring Scale**: 100-point unified scale (Vocal Technique 25, Intonation & Pitch 25, Artistic Expression 25, Repertoire Complexity 25).
     - **Laureate Breakdown**: Grand Prix (100 pts unanimous), Laureate I (95–99 pts), Laureate II (90–94 pts), Laureate III (85–89 pts), Diploma Holder (80–84 pts), Participant Certificate (<80 pts).
  4. `DownloadableProspectus`: 1px outline button to download certified PDF regulations document.
- **Primary CTA**: `DOWNLOAD OFFICIAL REGULATIONS (PDF)` / `APPLY ONLINE`.
- **States**: Default, PDF download loading, Error.

---

### PUB-06: International Jury Board
- **Route**: `/contests/espressivo-vocal-young-talents/jury`
- **Layout**: Gallery of full-bleed monochrome portraits with fine typography.
- **Core User Objective**: Inspect the credentials, institutional affiliations, and artistic legacy of the adjudicators.
- **Block Structure**:
  1. `SiteHeader`
  2. `HeroIntro`: *"THE INTERNATIONAL ADJUDICATION BOARD"* (Garamond 56px).
  3. `JuryGrid`: 2-column large-format cards (0px radius):
     - High-contrast portrait (black & white, deep shadows).
     - Full Name in Garamond 20px (e.g., *Maestro Vittorio Bellini*).
     - Title in Grotesk 10px caps: *Professor of Vocal Studies, Conservatorio di Musica di Milano*.
     - Curated 3-paragraph artistic biography.
     - Specific adjudication criteria emphasis statement.
  4. `JuryEthicsStatement`: Colophon outlining strict conflict-of-interest rules (teachers cannot judge their own pupils; automatic system disqualification).
- **Primary CTA**: `SUBMIT WORK FOR JURY EVALUATION`.
- **States**: Default, Profile modal drawer on image click, Loading, Error.

---

### PUB-07: About espressivo ART Foundation
- **Route**: `/about`
- **Layout**: Monographic editorial document.
- **Core User Objective**: Understand the foundation's mission, pedagogical board, partners, and archive.
- **Block Structure**:
  1. `SiteHeader`
  2. `Manifesto`: Garamond 56px quote on the future of classical and contemporary performance education.
  3. `ArchivalExhibition`: Historical overview of past laureates performing in European concert halls.
  4. `InstitutionalPartners`: Text listing of partnering conservatories, cultural ministries, and recording studios.
  5. `ContactColophon`: Direct contact credentials, press office, and Swiss foundation registration data.
- **States**: Complete static state specifications.

---

### PUB-08: Sign In / Access Portal
- **Route**: `/auth/login`
- **Layout**: Centered minimal bone card (0px radius) with deep black typography and 1px hairline border.
- **Core User Objective**: Log into the secure workspace as Participant, Teacher, Jury, or Administrator.
- **Block Structure**:
  1. `MiniHeader`: Simple logo mark linking back to `/`.
  2. `AuthBox`:
     - Eyebrow: `ESPRESSIVO ART SECURE PORTAL` (Grotesk 9px uppercase).
     - Title: `Sign In to Workspace` (Garamond 24px).
     - Role Selector: Tab switch between `Applicant / Guardian`, `Teacher / Studio`, `Jury Member`.
     - Fields: Email address, Password, Remember Me toggle.
     - Single-Sign-On: Minimal text link buttons `Sign in with Google` / `Sign in with Apple`.
     - Help links: `Forgot password?` and `New to espressivo? Create an Account`.
  3. `LegalDisclaimer`: Human micro-copy regarding GDPR/COPPA protection for minors.
- **Primary CTA**: `SIGN IN TO WORKSPACE` (Solid Ink `#000000` rectangular button).
- **States**: Default, Active typing, Loading spinner (hairline circle), Validation Error (`"Invalid email or password. Please verify your credentials"`).

---

### PUB-09: Registration / Account Creation
- **Route**: `/auth/register`
- **Layout**: Clean editorial registration form with account type branch.
- **Core User Objective**: Create an account with appropriate role permissions (Applicant/Parent vs Teacher).
- **Block Structure**:
  1. `MiniHeader`
  2. `RegistrationBox`:
     - Role Selection:
       - Card A: `Independent Participant / Guardian` (for solo performers and parents).
       - Card B: `Teacher / Vocal Studio Director` (for educators managing multiple students).
     - Form Fields: Full legal name, Contact email, Phone with international dial code, Password creation, Confirm password.
     - Guardian Consent Checkbox (if applicant is under 18 y.o.): Mandatory parent/guardian confirmation.
     - Terms of Competition & Privacy Policy consent checkboxes.
- **Primary CTA**: `CREATE ACCOUNT & CONTINUE` (Solid Ink button).
- **States**: Default, Interactive role toggle, Form validation error flags, Success redirect to workspace onboarding.

---

## Part 2: Participant Workspace Screens (Участник — 7 маршрутов)
*Theme: `cinema-workspace` | Canvas: Obsidian `#0a0a13` + Cosmic Gradients | Text: Carbon Vellum `#fcfcfc` | Accent: Iris Glow `#6199f6` | Radius: `10px` / `100px`*

---

### PAR-01: Participant Overview / Active Applications
- **Route**: `/dashboard/participant`
- **Layout**: Midnight Cinema dashboard with collapsible left sidebar and primary content canvas.
- **Core User Objective**: Instant visibility into active competition submissions, review statuses, and urgent action items.
- **Block Structure**:
  1. `CinemaTopNav`: Active contest pill badge (`espressivo VOCAL 2026`), user avatar, notification bell with unread indicator, language switch.
  2. `EyebrowGreeting`: `NEUE MACHINA INKTRAP` stamp: `WORKSPACE // PARTICIPANT DESK`.
  3. `HeroStatusBanner`: Floating 10px-radius card with violet border (`#4f4f80`):
     - Displays latest submission: *Elena Rostova — Giacomo Puccini: "O mio babbino caro"*.
     - Current state pill: `IN JURY ADJUDICATION` (Iris Glow pulsating dot).
     - Countdown to official results dispatch: `04d : 18h : 22m`.
  4. `MetricsRow`: 3 glass cards:
     - `Applications Submitted`: 2 (1 Solo, 1 Ensemble).
     - `Jury Status`: 4 of 5 adjudications recorded.
     - `Diplomas Available`: 1 ready for download.
  5. `SubmissionsGrid`: List of submitted entries with thumbnail, nomination title, submission date, status badge, and `Inspect Entry` button.
  6. `QuickActionsRail`: `Submit New Application`, `Verify Guardian Consent`, `Contact Curator`.
- **Primary CTA**: `+ SUBMIT NEW APPLICATION` (100px pill button, Carbon Vellum fill, Obsidian text).
- **States**:
  - `Default`: Populated cards with video thumbnails and active badges.
  - `Loading`: Shimmering skeletons with violet-tinted borders.
  - `Empty`: Centered icon with copy: *"You have no active submissions yet. Submissions for espressivo VOCAL close on June 15."* CTA: `START YOUR FIRST APPLICATION`.
  - `Error`: Inline error toast with retry button: *"Could not synchronize application status. Check connection."*

---

### PAR-02: New Application Wizard / Video Submission
- **Route**: `/dashboard/participant/apply`
- **Layout**: Focused distraction-free 4-step wizard with step indicator.
- **Core User Objective**: Complete application, upload or link high-definition performance video, specify repertoire, and pay entry fee.
- **Step Breakdown**:
  - **Step 1: Performer Details**: Performer name, exact date of birth (auto-calculates Age Division), country/city, vocal range (Soprano, Mezzo, Tenor, Baritone, Bass, Treble), accompanist name.
  - **Step 2: Repertoire & Program**: Composer name, work title, opus/act/opera name, exact duration, program notes or translated lyrics.
  - **Step 3: Media Upload / Link**:
    - Mode A: Direct file upload (MP4/MOV up to 2GB with instant browser-side chunked upload, progress bar, video preview).
    - Mode B: Unlisted YouTube / Vimeo URL input with automatic embed verification and thumbnail grab.
  - **Step 4: Guardian Consent & Checkout**:
    - Minor verification: Guardian Full Name, ID/Passport last 4 digits, consent signature toggle.
    - Fee summary (€45), secure checkout (Stripe / Apple Pay / Google Pay / YooKassa).
- **Primary CTA**: `CONFIRM & SUBMIT TO JURY` (Pill button with Iris Glow accent).
- **States**:
  - `Draft Saved`: Autosaves to local storage and backend draft record every 5 seconds.
  - `Uploading`: Real-time percentage meter with upload speed and cancel button.
  - `Validation Error`: Focused input highlighted in red with contextual microcopy.

---

### PAR-03: Application Detail & Live Status Tracker
- **Route**: `/dashboard/participant/applications/[id]`
- **Layout**: Cinema dual-column inspection layout (Left: Video playback, Right: Application metadata & timeline).
- **Core User Objective**: Review submitted video, check technical transcoding status, and track stage of review.
- **Block Structure**:
  1. `BreadcrumbNav`: `Dashboard > Applications > APP-2026-VOC-0842`.
  2. `VideoPlaybackSuite`: 10px-radius embedded cinema player with Iris Glow scrubber, full-screen trigger, timecode display, audio waveform visualizer.
  3. `MetadataCard`: Repertoire details, vocal nomination, age category, accompanist credit, submission timestamp.
  4. `LiveStageStepper`: 5-node vertical progress tracker:
     - `1. Application Received & Paid` (Completed).
     - `2. Technical & Anti-Fraud Verification` (Completed).
     - `3. Blind Preliminary Adjudication` (Completed).
     - `4. International Jury Final Scoring` (Current active step).
     - `5. Official Protocol & Diploma Issue` (Pending).
  5. `TechnicalDataBox`: Video resolution (1080p@60fps), audio bitrate (320kbps AAC), transcoded cloud status (`READY`).
- **Primary CTA**: `DOWNLOAD APPLICATION SUMMARY (PDF)`.
- **States**: Default, Transcoding in progress (`TRANSCODING VIDEO — 84%`), Flagged for re-upload (`AUDIO CLIPPING DETECTED — PLEASE REPLACE FILE`).

---

### PAR-04: Feedback & Jury Protocol
- **Route**: `/dashboard/participant/applications/[id]/protocol`
- **Layout**: Midnight Cinema evaluation sheet with expandable rubric scores.
- **Core User Objective**: Read detailed scores, rubric breakdowns, and personal written feedback from each international jury member.
- **Block Structure**:
  1. `ProtocolHeader`: Application title, Final Consolidated Score (`94.5 / 100`), Award Title (`LAUREATE II DEGREE`).
  2. `JuryConsensusSummary`: Radar chart or breakdown across the 4 core dimensions:
     - Vocal Technique: `24.0 / 25`
     - Intonation & Pitch Precision: `23.5 / 25`
     - Artistic Interpretation: `24.0 / 25`
     - Repertoire Difficulty: `23.0 / 25`
  3. `IndividualJuryFeedbackCards`: Expandable 10px-radius cards for each masked or unmasked jury member:
     - Adjudicator Title: *Jury Member A (Conservatorio di Milano)*.
     - Individual Criteria Scores.
     - Written Commentary & Pedagogical Recommendations: *"Exceptional dynamic control in the middle register. Recommendation for high pianissimo breath support in phrase 24..."*
     - Timecoded Markers: Clickable timestamps linking directly to video moments (e.g. `01:42 - Pitch variance on modulation`).
  4. `PedagogicalTakeaways`: Synthesized development advice for the vocal student.
- **Primary CTA**: `DOWNLOAD OFFICIAL ADJUDICATION PROTOCOL (CERTIFIED PDF)`.
- **States**:
  - `Locked`: Before contest announcement: *"Adjudication in progress. Official protocols unlock on June 20 at 12:00 CET."*
  - `Unlocked`: Full interactive scores and audio/text feedback.

---

### PAR-05: Diplomas & Laureate Certificates Vault
- **Route**: `/dashboard/participant/diplomas`
- **Layout**: Visual gallery of high-resolution digital diplomas and certificates.
- **Core User Objective**: View, verify, share, and download vector PDF diplomas, teacher gratitude certificates, and laureate badges.
- **Block Structure**:
  1. `VaultHeader`: *"DIPLOMAS & HONORS VAULT"*, subtitle with unique cryptographic verification ID.
  2. `FeaturedDiplomaCard`: Large high-fidelity visual rendering of the official certificate:
     - Gold/Silver hot-stamp foil vector simulation on bone background.
     - Laureate Name, Award Degree, Signatures of Jury President and Artistic Director.
     - Unique verification QR-code and SHA-256 integrity hash.
  3. `DownloadBar`:
     - `Download Print-Ready PDF (300 DPI Vector)`.
     - `Download Web Badge (PNG/SVG)`.
     - `Add to LinkedIn / Cultural Portfolio`.
  4. `ArchiveList`: Previous editions' certificates and participation badges.
- **Primary CTA**: `DOWNLOAD HIGH-RESOLUTION PDF (PRINT READY)`.
- **States**: Ready, Generating PDF, Empty state with explanation of when diplomas are produced.

---

### PAR-06: Payment History & Invoices
- **Route**: `/dashboard/participant/billing`
- **Layout**: Financial ledger and receipt repository.
- **Core User Objective**: Track entry fees paid, obtain formal fiscal invoices for tax/school reimbursement.
- **Block Structure**:
  1. `BillingHeader`: Summary of total contest fees paid.
  2. `TransactionTable`:
     - Date & Time.
     - Application ID & Performer Name.
     - Payment Method (Visa ending in 4242, Apple Pay).
     - Amount (€45.00).
     - Fiscal Receipt status (`ISSUED`, `REFUNDED`).
     - Actions: `Download PDF Invoice`, `View Receipt`.
  3. `InvoiceDetailsDrawer`: Slide-over panel with official VAT/Tax breakdown and organization credentials.
- **Primary CTA**: `DOWNLOAD TAX RECEIPT`.
- **States**: Populated ledger, Empty history, Refund status.

---

### PAR-07: Profile & Minor Consent / Guardian Settings
- **Route**: `/dashboard/participant/profile`
- **Layout**: Settings layout with segmented tabs (`Personal Info`, `Guardian Consent`, `Security`, `Notifications`).
- **Core User Objective**: Manage student profile, update contact info, and execute legally binding guardian consent forms.
- **Block Structure**:
  1. `ProfileHeader`: Avatar upload, Performer full name, Participant ID code.
  2. `GuardianConsentCard`:
     - Status indicator: `VERIFIED GUARDIAN CONSENT ON FILE` (Green badge) or `ACTION REQUIRED` (Yellow badge).
     - Guardian Name, Relation, Digital Signature timestamp, Uploaded ID verification document.
     - GDPR / COPPA compliant data erasure and anonymity settings.
  3. `SecuritySettings`: Password change, Two-Factor Authentication (2FA) toggle, Active login sessions.
  4. `NotificationPreferences`: Email alerts, Telegram bot integration for real-time jury score alerts.
- **Primary CTA**: `SAVE CHANGES` (Pill button).
- **States**: Saved, Pending verification, Unsaved changes warning dialog.

---

## Part 3: Teacher / Mentor Workspace Screens (Преподаватель — 6 маршрутов)
*Theme: `cinema-workspace` | Multi-student roster management, studio analytics, batch submissions*

---

### TEA-01: Studio Overview & Students Roster
- **Route**: `/dashboard/teacher`
- **Layout**: High-density studio dashboard.
- **Core User Objective**: Monitor all enrolled studio students, their submission statuses, and overall studio performance.
- **Block Structure**:
  1. `StudioBanner`: Vocal Studio / Music School name, Director credentials, verified teacher badge.
  2. `StudioKpiCards`:
     - `Active Students`: 14
     - `Submitted Entries`: 18
     - `Awaiting Video Upload`: 3
     - `Laureates Awarded`: 6
  3. `UrgentActionQueue`: Alert banner showing students with incomplete uploads or missing parent consents.
  4. `StudentsTable`: High-density searchable table with student avatar, age, nomination, assigned piece, status badge, and quick action menu.
  5. `BulkActionLauncher`: Direct access to submit multiple students simultaneously.
- **Primary CTA**: `+ SUBMIT GROUP OF STUDENTS` (Carbon Vellum pill button).
- **States**: Populated studio, New teacher onboarding (Empty state guiding teacher to invite first student).

---

### TEA-02: Collective / Bulk Application Submission
- **Route**: `/dashboard/teacher/apply-bulk`
- **Layout**: Multi-student batch submission spreadsheet / grid editor.
- **Core User Objective**: Register 5–20 students quickly without filling redundant forms, batch upload performance files, and pay via single studio invoice.
- **Block Structure**:
  1. `BatchHeader`: Contest selection (`espressivo VOCAL 2026`), Batch counter (`7 Students in Draft`).
  2. `EditableSpreadsheetGrid`:
     - Row per student: Name, DOB, Category, Composer/Piece, Video Link/File, Guardian Email.
     - Keyboard navigation (Tab/Enter navigation between cells).
     - Inline validation: Red underline on invalid cells with instant tooltip hint.
  3. `BatchVideoUploader`: Drag-and-drop zone that auto-matches uploaded MP4 filenames to student names (e.g. `Rostova_Elena_Puccini.mp4`).
  4. `ConsolidatedPaymentSummary`: Bulk discount calculation (e.g. 10% discount for >10 submissions), Total amount, Payment method (Card or Bank Wire Transfer with formal Invoice).
- **Primary CTA**: `REVIEW & SUBMIT BATCH (7 APPLICATIONS)` (Pill button).
- **States**: Empty draft, Validation errors list, Uploading batch media progress dialog.

---

### TEA-03: Student Progress & Submissions Directory
- **Route**: `/dashboard/teacher/students`
- **Layout**: Filterable catalog of individual student profiles within the studio.
- **Core User Objective**: Inspect individual student historical repertoire, jury remarks across seasons, and pedagogical trajectory.
- **Block Structure**:
  1. `FilterBar`: Search by student name, filter by age group, filter by active nomination.
  2. `StudentCardGrid`:
     - Student photo, full name, age, years in studio.
     - List of submitted pieces across contests.
     - Highest title achieved (*Laureate I Degree — Milan Gala Finalist*).
     - `View Pedagogical Dossier` button.
  3. `StudentDetailDrawer`: Opens detailed history, teacher notes field, and direct link to jury video timecodes.
- **Primary CTA**: `+ ADD NEW STUDENT TO ROSTER`.
- **States**: Populated roster, Empty search results, Add student modal.

---

### TEA-04: Official Gratitude Letters & Certificates Archive
- **Route**: `/dashboard/teacher/certificates`
- **Layout**: Certificate showcase specifically honoring vocal teachers, mentors, and concertmasters.
- **Core User Objective**: Obtain official institutional certificates of pedagogical excellence for state certification and portfolio accreditation.
- **Block Structure**:
  1. `CredentialsHeader`: Teacher honorary rank, list of laureate students contributing to accreditation.
  2. `TeacherCertificateList`:
     - *Diploma of Gratitude for Outstanding Pedagogical Preparation of Laureates*.
     - *Official Certification of International Cultural Mentorship*.
     - *Special Award for Best Accompaniment / Concertmaster Mastery*.
  3. `CertificateActions`: High-resolution PDF vector download, unique verification QR, institutional request form for printed physical parchment delivery.
- **Primary CTA**: `DOWNLOAD ALL CERTIFICATES (ZIP)`.
- **States**: Populated list, Locked until contest results announcement.

---

### TEA-05: Studio Financial Receipts & Invoices
- **Route**: `/dashboard/teacher/billing`
- **Layout**: Consolidated institutional accounting dashboard.
- **Core User Objective**: Download formal corporate invoices, wire transfer orders, and receipts addressed to the music school or municipal cultural department.
- **Block Structure**:
  1. `BillingProfile`: Music school legal entity name, Tax ID / INN, billing address.
  2. `BatchInvoiceList`: Invoices generated for collective entries with detailed student itemization.
  3. `PaymentStatusTracker`: Real-time tracking of bank transfer clearance.
- **Primary CTA**: `REQUEST FORMAL COMMERCIAL INVOICE`.
- **States**: Paid, Pending clearance, Cancelled.

---

### TEA-06: Teacher Profile & Organization Affiliation
- **Route**: `/dashboard/teacher/profile`
- **Layout**: Academic resume and credentials editor.
- **Core User Objective**: Present professional biography, school affiliation, and configure team permissions.
- **Block Structure**:
  1. `BioEditor`: Academic degrees, honorary titles (Honored Artist, Professor), teaching experience.
  2. `SchoolAffiliation`: Association with official conservatory, music academy, or private vocal studio.
  3. `Co-Teachers & Accompanists`: Invite assistant teachers or studio accompanists to share access to student files.
- **Primary CTA**: `UPDATE PROFILE`.
- **States**: Default, Save confirmation toast.

---

## Part 4: Jury Member Workspace Screens (Жюри — 4 маршрута)
*Theme: `cinema-workspace` | Distraction-free grading, timecoded playback, blind assessment option*

---

### JUR-01: Evaluation Room / Active Contest Queue
- **Route**: `/dashboard/jury`
- **Layout**: High-focus cinema queue.
- **Core User Objective**: View assigned vocal entries, filter by category/age, and monitor personal grading progress.
- **Block Structure**:
  1. `JuryHeader`: Adjudicator name, assigned nomination (*Academic Solo Vocal — Groups II & III*).
  2. `EvaluationProgressMeter`: Circular gauge: `42 of 60 Graded (70%)`, deadline for protocol sign-off (`Remaining: 36 hours`).
  3. `QueueFilterTabs`: `[ALL ASSIGNED]`, `[PENDING EVALUATION (18)]`, `[DRAFT SCORES (4)]`, `[COMPLETED (38)]`.
  4. `SubmissionsQueueTable`:
     - Participant Anonymous ID (or name, depending on Blind mode setting).
     - Age Division & Repertoire Title (*G. F. Händel — Lascia ch'io pianga*).
     - Video Duration (3m 45s).
     - Current Grading Status pill (`UNWATCHED`, `IN PROGRESS`, `SCORED`).
     - `EVALUATE SUBMISSION` button.
  5. `BlindEvaluationModeToggle`: Switch to hide participant name, face thumbnail, country, and teacher to guarantee strict unbiased assessment.
- **Primary CTA**: `EVALUATE NEXT IN QUEUE` (Iris Glow filled pill button).
- **States**: Active queue, All entries completed celebration screen, Filtering empty state.

---

### JUR-02: Video Player & Scoring Terminal
- **Route**: `/dashboard/jury/evaluate/[applicationId]`
- **Layout**: Split-screen cinema cockpit:
  - Left / Top (60%): High-fidelity video player with timecode markers and keyboard shortcuts (`Space` = Play/Pause, `J/K/L` = Scrubber, `M` = Add timestamped note).
  - Right / Bottom (40%): 100-point scoring matrix and commentary pad.
- **Core User Objective**: Watch candidate performance, leave timecoded diagnostic feedback, input rubric scores, and submit certified evaluation.
- **Block Structure**:
  1. `CockpitHeader`: Anonymous Code `#VOC-0842`, Repertoire info, Full-screen cinema expander.
  2. `CinemaVideoPlayer`: Full 1080p stream, audio VU meters, timecode display (`00:02:14:18`).
  3. `TimecodedNotesStream`: Click `[+ Add Note]` to anchor a pedagogical comment directly to the current millisecond of video.
  4. `ScoringRubricForm`:
     - **Criterion 1: Vocal Technique & Breath Support** (Slider 0–25, increment 0.5, direct number input).
     - **Criterion 2: Intonation & Pitch Precision** (Slider 0–25, increment 0.5).
     - **Criterion 3: Artistic Expression & Phrasing** (Slider 0–25, increment 0.5).
     - **Criterion 4: Repertoire Complexity & Style Fidelity** (Slider 0–25, increment 0.5).
     - **Consolidated Total**: Calculated live in 24px Carbon Vellum (`Total: 93.5 / 100`).
  5. `WrittenCommentaryField`: Direct advice to the student and teacher (minimum 100 characters required).
  6. `ConfidentialAdminNoteField`: Private flag to Jury President (e.g. suspecting autotune or accompaniment track issues).
- **Primary CTA**: `SUBMIT FINAL SCORE & NEXT` (Iris Glow pill button).
- **States**:
  - `Scoring`: Sliders reactive with immediate visual feedback.
  - `Draft Saved`: Autosaves score every 3 seconds.
  - `Conflict Flag`: Button to `RECUSE MYSELF (CONFLICT OF INTEREST)` if candidate is personally known.

---

### JUR-03: Evaluated Submissions History & Protocol Revision
- **Route**: `/dashboard/jury/history`
- **Layout**: Review table of all scores submitted by this adjudicator during the active round.
- **Core User Objective**: Compare scores across contestants to ensure calibration, adjust scores before final round closure.
- **Block Structure**:
  1. `RevisionHeader`: Total graded count, score distribution histogram (showing average score curve to prevent grade inflation).
  2. `HistoryTable`:
     - Candidate Code, Repertoire, Assigned Scores by criteria, Total Score, Timestamp.
     - Action: `Edit Score` (available until round freeze).
  3. `ProtocolSignOffCard`: Digital signature module to finalize and cryptographically seal the entire jury protocol.
- **Primary CTA**: `DIGITALLY SIGN & SEAL PROTOCOL` (Final irreversible sign-off).
- **States**: Editable, Protocol sealed (read-only lock state).

---

### JUR-04: Jury Profile & Credentials
- **Route**: `/dashboard/jury/profile`
- **Layout**: Adjudicator profile and honorarium settings.
- **Core User Objective**: Maintain public jury biography, institutional affiliation, and digital signature.
- **Block Structure**:
  1. `PublicBioPreview`: How the jury member appears on the public website.
  2. `DigitalSignaturePad`: Draw or upload certified autograph for automatic rendering on winner diplomas.
  3. `HonorariumSettings`: Secure banking details for jury service remuneration.
- **Primary CTA**: `SAVE CREDENTIALS`.
- **States**: Complete profile, Missing signature prompt.

---

## Part 5: Admin Workspace Screens (Администратор — 11 маршрутов)
*Theme: `cinema-workspace` | Maximum control, platform oversight, automated verification, audit compliance*

---

### ADM-01: Executive Command Center & KPI Overview
- **Route**: `/dashboard/admin`
- **Layout**: High-density command center with live streaming telemetry.
- **Core User Objective**: Bird's-eye view of season revenue, submission influx, moderation queue backlog, and jury pacing.
- **Block Structure**:
  1. `CommandBar`: Season selector (`espressivo VOCAL 2026`), system health status indicator (`ALL SYSTEMS OPERATIONAL`).
  2. `TopKpiBentoGrid`:
     - `Gross Season Revenue`: €42,850 (+18% vs target).
     - `Total Applications`: 640 (482 Paid & Verified, 38 Pending Moderation, 120 Incomplete).
     - `Jury Evaluation Pacing`: 76% completed across all panels.
     - `Video Processing Pipeline`: 0 transcoding bottlenecks, 100% cloud sync.
  3. `UrgentTriageAlerts`: Highlighting flagged applications (suspected autotune, unreadable guardian IDs, payment chargeback flags).
  4. `LiveActivityStream`: Reverse-chronological event log (New application, Score submitted, Diploma downloaded).
- **Primary CTA**: `OPEN MODERATION QUEUE (38 PENDING)`.
- **States**: Real-time WebSocket updates, Loading skeleton, Filter by time window (Today, 7D, 30D, Season).

---

### ADM-02: Contest Lifecycle & Season Manager
- **Route**: `/dashboard/admin/contests`
- **Layout**: Season configuration editor and timeline governor.
- **Core User Objective**: Create, configure, launch, and close competition seasons, deadlines, fees, and rules.
- **Block Structure**:
  1. `ContestList`: Table of all editions (Draft, Accepting Entries, In Adjudication, Completed).
  2. `ContestConfigDrawer`:
     - Season Title, Slug, International Code.
     - Registration Open & Close Dates (with minute-level precision).
     - Pricing tiers (Early bird, Standard, Late submission surcharge).
     - Quota caps per age division.
     - Toggle: Blind Evaluation Mode (Enabled/Disabled).
  3. `PublishWorkflow`: Pre-launch validation checklist before making season live on public website.
- **Primary CTA**: `+ CREATE NEW CONTEST SEASON`.
- **States**: Draft, Active, Archived, Locked.

---

### ADM-03: Application Moderation & Triage Queue
- **Route**: `/dashboard/admin/applications`
- **Layout**: High-throughput moderation table with quick preview drawer.
- **Core User Objective**: Verify application validity, inspect video accessibility, check guardian consent legality, and approve/reject into jury queue.
- **Block Structure**:
  1. `QueueFilters`: Status (`Pending Review`, `Approved`, `Needs Correction`, `Rejected`), Category, Age Group, Payment Status.
  2. `ModerationTable`: Checkbox for batch operations, ID, Candidate Name, Video Thumbnail, Category, Date, Status pill, Curator actions.
  3. `QuickInspectionDrawer`: Slides out on row click:
     - Embedded video player.
     - Performer DOB verification against passport document snippet.
     - Repertoire legality and duration check.
     - Action buttons: `[Approve for Jury]`, `[Request Re-upload]`, `[Reject with Reason]`.
- **Primary CTA**: `BATCH APPROVE SELECTED (12)`.
- **States**: Populated queue, Empty queue celebration, Batch action confirmation modal.

---

### ADM-04: Video Transcoding, Cloud CDN & Audio QC
- **Route**: `/dashboard/admin/media`
- **Layout**: Technical media operations suite.
- **Core User Objective**: Monitor video transcoding pipeline, storage consumption, audio loudness compliance, and streaming performance.
- **Block Structure**:
  1. `PipelineMetrics`: Active transcoding tasks, storage used (e.g. 1.2 TB / 5 TB), bandwidth egress.
  2. `MediaJobsTable`: File name, applicant ID, original format (MOV, MP4, MKV), output resolution profiles (1080p, 720p, 480p), audio normalization LUFS score (-14 LUFS target).
  3. `TranscodeErrorLog`: Detailed FFmpeg / transcode error logs with `Retry Job` trigger.
- **Primary CTA**: `RE-INDEX TRANSCODING QUEUE`.
- **States**: Normal, High queue load warning, Failed file alert.

---

### ADM-05: Jury Board Allocation & Score Normalization Matrix
- **Route**: `/dashboard/admin/jury`
- **Layout**: Matrix allocation view linking jury members to specific nominations.
- **Core User Objective**: Assign adjudicators to age categories, monitor scoring distribution curves, detect outlier biases, and manage conflict of interest recusal.
- **Block Structure**:
  1. `JuryRosterCard`: Active adjudicators, accepted invitations, completion percentage.
  2. `AllocationMatrix`: Visual matrix assigning Jury Member A to Nominations 1 & 3, Jury Member B to Nominations 2 & 4.
  3. `CalibrationAnalytics`: Deviation curve showing if any jury member scores consistently ±15 points above/below panel consensus.
  4. `ManualRecusalOverride`: Remove a jury member from an individual submission due to disclosed pedagogical conflict.
- **Primary CTA**: `AUTO-BALANCE JURY ALLOCATIONS`.
- **States**: Balanced, Overdue evaluations alert, Conflict flag resolved.

---

### ADM-06: Results, Quotas & Laureate Allocation Matrix
- **Route**: `/dashboard/admin/results`
- **Layout**: Deliberation terminal calculating final rankings, title allocations, and Grand Prix candidate selection.
- **Core User Objective**: Calculate final scores, verify quota distributions per prize tier, resolve ties, and approve official winners list.
- **Block Structure**:
  1. `CategorySelector`: Select nomination and age division to review standings.
  2. `StandingsLeaderboard`:
     - Rank, Candidate Name, Average Score (to 2 decimal places), Standard Deviation.
     - Recommended Title: `Grand Prix`, `Laureate I`, `Laureate II`, `Laureate III`, `Diploma`.
     - Override Toggle: Administrative discretion adjustment with mandatory justification note.
  3. `Grand Prix Deliberation Panel`: Side-by-side video comparison of top candidates (>98.0 pts) for unanimous board voting.
  4. `ResultsFreezeGate`: Two-key administrative lock to freeze rankings and publish to diploma generation pipeline.
- **Primary CTA**: `OFFICIALLY APPROVE & FREEZE RESULTS`.
- **States**: Preliminary calculations, Tied score conflict prompt, Frozen and published.

---

### ADM-07: Vector PDF Diploma Generation & Dispatch Center
- **Route**: `/dashboard/admin/diplomas`
- **Layout**: Batch document publishing suite.
- **Core User Objective**: Render hundreds of high-resolution vector PDF diplomas, embed cryptographic QR verification, and dispatch via email/vault.
- **Block Structure**:
  1. `TemplateEnginePreview`: Visual WYSIWYG editor for official diploma parchment layout (coordinates of laureate name, title, jury signatures, seal placement).
  2. `BatchGenerationControl`: Progress bar rendering 482 personalized PDF files with vector fonts and signatures.
  3. `CryptographicHashRegistry`: Verification database storing SHA-256 hashes of all issued certificates.
  4. `DispatchLauncher`: One-click release to participant workspaces and automated email dispatch with PDF attachments.
- **Primary CTA**: `GENERATE ALL DIPLOMAS & DISPATCH`.
- **States**: Templates configured, Generation in progress, Dispatch completed report.

---

### ADM-08: Financial Ledger, Payouts, Gateways & Refunds
- **Route**: `/dashboard/admin/finance`
- **Layout**: Full financial audit and ledger interface.
- **Core User Objective**: Reconcile Stripe/YooKassa gateway balances, execute refunds, calculate jury honorarium payouts, and export accounting reports.
- **Block Structure**:
  1. `FinancialSummary`: Gross sales, Gateway processing fees, Net funds, Outstanding refunds.
  2. `TransactionsMasterTable`: Searchable by payment ID, payer email, application ID, amount, currency, status.
  3. `RefundModal`: Form to process full or partial refund with audit log reason.
  4. `JuryHonorariumTable`: Payout status to international adjudicators.
- **Primary CTA**: `EXPORT CSV ACCOUNTING REPORT`.
- **States**: Reconciled, Disputed payment flag, Refund executed.

---

### ADM-09: User & Access Control (RBAC, Guardians, Teachers)
- **Route**: `/dashboard/admin/users`
- **Layout**: User identity management and access control directory.
- **Core User Objective**: Manage accounts across all roles, grant/revoke jury and admin privileges, verify guardian status.
- **Block Structure**:
  1. `RoleTabFilter`: `[ALL USERS (890)]`, `[PARTICIPANTS (620)]`, `[TEACHERS (180)]`, `[JURY (15)]`, `[ADMINS (5)]`.
  2. `UserTable`: Avatar, Name, Email, Role badge, Verification status, Registration date, Last login IP, Action buttons.
  3. `UserDetailDrawer`: Edit role permissions, reset 2FA, view linked student records, inspect audit trail.
- **Primary CTA**: `+ INVITE USER / ADJUDICATOR`.
- **States**: Populated table, Role update toast, Deactivation modal.

---

### ADM-10: Security Audit Log & Compliance Engine
- **Route**: `/dashboard/admin/audit`
- **Layout**: Immutable event log viewer with forensic search filters.
- **Core User Objective**: Inspect all system mutations, score modifications, logins, file downloads, and ensure GDPR/COPPA compliance.
- **Block Structure**:
  1. `LogFilterBar`: Filter by Actor, Action Type (`SCORE_MUTATION`, `DIPLOMA_DOWNLOAD`, `LOGIN_ATTEMPT`, `REFUND_ISSUED`), IP Address, Severity.
  2. `AuditLogTable`: Timestamp (UTC), Actor ID & Role, Action Description, Target Resource, IP & User Agent, Change Diff (Before vs After JSON).
  3. `ExportComplianceReport`: Generate signed log archive for external legal and security verification.
- **Primary CTA**: `EXPORT CERTIFIED AUDIT LOG`.
- **States**: Live streaming events, Query results, Empty search.

---

### ADM-11: Platform Settings, Notification Templates & Legal Terms
- **Route**: `/dashboard/admin/settings`
- **Layout**: System configuration center with categorized tabs.
- **Core User Objective**: Maintain transactional email/Telegram templates, storage keys, payment webhooks, and legal documents.
- **Block Structure**:
  1. `SettingsNav`: `[GENERAL]`, `[NOTIFICATIONS]`, `[STORAGE & CDN]`, `[PAYMENT GATEWAYS]`, `[LEGAL & GDPR]`.
  2. `NotificationEditor`: Rich-text and variable editor for automated emails (e.g. `{{participant_name}}`, `{{contest_title}}`, `{{diploma_url}}`).
  3. `TelegramBotConfig`: Bot API token, webhook status, curator group chat ID.
  4. `LegalTermsEditor`: Direct editor for Contest Regulations, Guardian Consent Text, and Privacy Policy.
- **Primary CTA**: `SAVE & DEPLOY CONFIGURATION`.
- **States**: Clean settings, Pending test email sent, Validation error on invalid API key.
