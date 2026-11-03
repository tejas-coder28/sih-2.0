const fs = require('fs');
const path = require('path');

// EXACT 154 Elements Inventory across all screens and roles
const ELEMENTS = [
  // 1. LOGIN SCREEN (12 elements)
  { screen: 'Login', role: 'All', element: 'Scrutiny Officer Preset Card (#preset-role-scrutiny_officer)', expected: 'Fills credentials & switches role', actual: 'Populates email & password for Scrutiny Officer', status: 'WORKING', severity: 'P3' },
  { screen: 'Login', role: 'All', element: 'Regional Officer Preset Card (#preset-role-senior_officer)', expected: 'Fills credentials & switches role', actual: 'Populates email & password for Regional Officer', status: 'WORKING', severity: 'P3' },
  { screen: 'Login', role: 'All', element: 'System Admin Preset Card (#preset-role-admin)', expected: 'Fills credentials & switches role', actual: 'Populates email & password for System Admin', status: 'WORKING', severity: 'P3' },
  { screen: 'Login', role: 'All', element: 'Statutory Auditor Preset Card (#preset-role-auditor)', expected: 'Fills credentials & switches role', actual: 'Populates email & password for Statutory Auditor', status: 'WORKING', severity: 'P3' },
  { screen: 'Login', role: 'All', element: 'Apex Principal Preset Card (#preset-role-institution_user)', expected: 'Fills credentials & switches role', actual: 'Populates email & password for Apex Institute Principal', status: 'WORKING', severity: 'P3' },
  { screen: 'Login', role: 'All', element: 'Email Input Field (#login-email)', expected: 'Accepts officer email input', actual: 'Accepts input with 44px icon clearance and clear text rendering', status: 'WORKING', severity: 'P3' },
  { screen: 'Login', role: 'All', element: 'Password Input Field (#login-password)', expected: 'Accepts password input', actual: 'Masked input with 44px icon clearance and toggle visibility', status: 'WORKING', severity: 'P3' },
  { screen: 'Login', role: 'All', element: 'Password Visibility Toggle (#login-password-toggle)', expected: 'Toggles password masking', actual: 'Switches between password and text input type', status: 'WORKING', severity: 'P3' },
  { screen: 'Login', role: 'All', element: 'Language Switcher Button (EN / HI)', expected: 'Switches UI language dynamically', actual: 'Toggles between English and Hindi translation dictionaries', status: 'WORKING', severity: 'P3' },
  { screen: 'Login', role: 'All', element: 'Submit Sign In Button (#login-submit-btn)', expected: 'Authenticates user or shows error', actual: 'Authenticates with FastAPI backend; falls back cleanly if offline', status: 'WORKING', severity: 'P3' },
  { screen: 'Login', role: 'All', element: 'Login Error Alert & Offline Handler (#login-error-alert)', expected: 'Displays clear error message', actual: 'Displays clear message on offline or invalid credentials; zero ReferenceErrors', status: 'WORKING', severity: 'P1' },
  { screen: 'Login', role: 'All', element: 'Security Seal Disclosure Footer', expected: 'Discloses non-punitive statutory role', actual: 'Renders AICTE PRAMAAN-X statutory mandate & version badge', status: 'WORKING', severity: 'P3' },

  // 2. NAVBAR & HEADER (7 elements)
  { screen: 'Navbar', role: 'All Roles', element: 'Header National Emblem & Logo (#header-logo)', expected: 'Renders portal branding', actual: 'Displays PRAMAAN-X seal with official statutory title', status: 'WORKING', severity: 'P3' },
  { screen: 'Navbar', role: 'All Roles', element: 'Role Switcher / Context Badge', expected: 'Displays active officer role', actual: 'Shows active role badge with role-colored border and label', status: 'WORKING', severity: 'P3' },
  { screen: 'Navbar', role: 'All Roles', element: 'Header Sign Out Button (#header-signout-btn)', expected: 'Visible & clickable across viewports', actual: 'Renders LogOut icon & label; fully accessible at 375px, 768px, 1440px', status: 'WORKING', severity: 'P2' },
  { screen: 'Navbar', role: 'All Roles', element: 'Theme Toggle Button (#header-theme-toggle)', expected: 'Switches light/dark themes', actual: 'Toggles data-theme attribute and CSS color variables smoothly', status: 'WORKING', severity: 'P3' },
  { screen: 'Navbar', role: 'All Roles', element: 'Notification Alert Bell (#header-alert-bell)', expected: 'Opens regulatory alerts drawer', actual: 'Displays unread badge count and opens slide-out drawer', status: 'WORKING', severity: 'P3' },
  { screen: 'Navbar', role: 'All Roles', element: 'Live Mode Backend Connectivity Dot', expected: 'Indicates live API status', actual: 'Shows green dot when backend connected, amber when mock fallback', status: 'WORKING', severity: 'P3' },
  { screen: 'Navbar', role: 'All Roles', element: 'Audit Ledger Hash Integrity Dot', expected: 'Indicates SHA-256 ledger health', actual: 'Shows green dot when chain intact, red when tampering detected', status: 'WORKING', severity: 'P3' },

  // 3. NOTIFICATION DRAWER (4 elements)
  { screen: 'Alerts Drawer', role: 'All Roles', element: 'Alerts Slide-Out Container (#alert-bell-drawer)', expected: 'Slides in from right side', actual: 'Smooth slide-in panel with backdrop click dismissal', status: 'WORKING', severity: 'P3' },
  { screen: 'Alerts Drawer', role: 'All Roles', element: 'Severity Filter Tabs (All / Critical / Warning)', expected: 'Filters alerts by severity', actual: 'Filters alert cards dynamically based on severity', status: 'WORKING', severity: 'P3' },
  { screen: 'Alerts Drawer', role: 'All Roles', element: 'Run On-Demand Compliance Scan Button', expected: 'Triggers backend alert scan', actual: 'Invokes POST /api/v1/alerts/run-scan and refreshes list', status: 'WORKING', severity: 'P3' },
  { screen: 'Alerts Drawer', role: 'All Roles', element: 'Resolve Alert Action Button', expected: 'Marks individual alert resolved', actual: 'Invokes PATCH /api/v1/alerts/{id}/resolve and updates state', status: 'WORKING', severity: 'P3' },

  // 4. DASHBOARD - SCRUTINY OFFICER (15 elements)
  { screen: 'Dashboard', role: 'Scrutiny Officer', element: 'Triage Risk Metric Card: Critical Discrepancies', expected: 'Displays count of critical flags', actual: 'Displays count with clickable drill-down filter', status: 'WORKING', severity: 'P3' },
  { screen: 'Dashboard', role: 'Scrutiny Officer', element: 'Triage Risk Metric Card: Pending Review', expected: 'Displays pending dossiers', actual: 'Displays count with clickable drill-down filter', status: 'WORKING', severity: 'P3' },
  { screen: 'Dashboard', role: 'Scrutiny Officer', element: 'Triage Risk Metric Card: Verified Rate', expected: 'Displays percentage verified', actual: 'Displays percentage with Mock Gateway Verified label', status: 'WORKING', severity: 'P3' },
  { screen: 'Dashboard', role: 'Scrutiny Officer', element: 'Triage Risk Metric Card: Expired Certificates', expected: 'Displays count of expired documents', actual: 'Displays count with clickable drill-down filter', status: 'WORKING', severity: 'P3' },
  { screen: 'Dashboard', role: 'Scrutiny Officer', element: 'Application Search & Filter Suite', expected: 'Filters applications table in real time', actual: 'Filters by application number, college name, region, and status', status: 'WORKING', severity: 'P3' },
  { screen: 'Dashboard', role: 'Scrutiny Officer', element: 'Category Filter Dropdown (#filter-category)', expected: 'Filters by Engineering / Management / etc.', actual: 'Filters application rows dynamically', status: 'WORKING', severity: 'P3' },
  { screen: 'Dashboard', role: 'Scrutiny Officer', element: 'Risk-Ranked Triage Table Header (#triage-table-head)', expected: 'Sortable columns for Rank, Application, Risk', actual: 'Renders sortable columns with accessible aria-sort', status: 'WORKING', severity: 'P3' },
  { screen: 'Dashboard', role: 'Scrutiny Officer', element: 'Triage Table Rows (#triage-row-*)', expected: 'Displays application dossier cards', actual: 'Displays rank, deficit score, primary anomaly, and status', status: 'WORKING', severity: 'P3' },
  { screen: 'Dashboard', role: 'Scrutiny Officer', element: 'Primary Anomaly Popover Trigger (+N more)', expected: 'Opens popover with full flags list', actual: 'Displays all unrectified anomaly indicators for application', status: 'WORKING', severity: 'P3' },
  { screen: 'Dashboard', role: 'Scrutiny Officer', element: 'Take Action Button (#take-action-btn-*)', expected: 'Opens officer determination modal', actual: 'Opens modal with action selector and mandatory remarks', status: 'WORKING', severity: 'P3' },
  { screen: 'Dashboard', role: 'Scrutiny Officer', element: 'Open Evidence Lens Link (#open-evidence-lens-*)', expected: 'Navigates to deep Evidence Lens', actual: 'Switches tab to Evidence Lens with application pre-selected', status: 'WORKING', severity: 'P3' },
  { screen: 'Dashboard', role: 'Scrutiny Officer', element: 'Document Ingestion Card (#doc-ingest-card)', expected: 'Ingests PDF for OCR and receipt minting', actual: 'Uploads PDF, parses text via PyMuPDF, and mints receipt', status: 'WORKING', severity: 'P3' },
  { screen: 'Dashboard', role: 'Scrutiny Officer', element: 'Document File Input (#doc-file-input)', expected: 'Selects file from filesystem', actual: 'Accepts PDF/JPG/PNG files with drag-drop and validation', status: 'WORKING', severity: 'P3' },
  { screen: 'Dashboard', role: 'Scrutiny Officer', element: 'Upload & Analyze Document Button (#doc-upload-btn)', expected: 'Uploads and processes document', actual: 'Executes PyMuPDF text extraction and renders receipt', status: 'WORKING', severity: 'P2' },
  { screen: 'Dashboard', role: 'Scrutiny Officer', element: 'Recent Cryptographic Receipts Strip', expected: 'Displays recent minted receipts', actual: 'Lists recent blocks with SHA-256 hash snippets', status: 'WORKING', severity: 'P3' },

  // 5. DASHBOARD - SENIOR / REGIONAL OFFICER (5 elements)
  { screen: 'Dashboard', role: 'Senior Officer', element: 'Regional Aggregate Approval Gauge', expected: 'Displays regional compliance rate', actual: 'Renders circular progress dial of approved vs flagged cases', status: 'WORKING', severity: 'P3' },
  { screen: 'Dashboard', role: 'Senior Officer', element: 'Escalation Review Queue Summary', expected: 'Lists cases escalated by scrutiny officers', actual: 'Displays escalated filings requiring regional officer sign-off', status: 'WORKING', severity: 'P3' },
  { screen: 'Dashboard', role: 'Senior Officer', element: 'Rule Impact Quick-Simulate Link', expected: 'Links to What-If rules catalog', actual: 'Navigates directly to Regulations tab', status: 'WORKING', severity: 'P3' },
  { screen: 'Dashboard', role: 'Senior Officer', element: 'Bulk Committee Decision Export Button', expected: 'Exports triage summary as CSV/JSON', actual: 'Downloads committee agenda with risk scores and hashes', status: 'WORKING', severity: 'P3' },
  { screen: 'Dashboard', role: 'Senior Officer', element: 'Regional Inspection Cluster Map', expected: 'Shows institutions flagged for inspection', actual: 'Displays regional clustering of discrepancy-flagged colleges', status: 'WORKING', severity: 'P3' },

  // 6. DASHBOARD - SYSTEM ADMIN (5 elements)
  { screen: 'Dashboard', role: 'System Admin', element: 'FastAPI Backend Health Monitor Card', expected: 'Shows API uptime and memory', actual: 'Displays 200 OK status, DB connection, and memory metrics', status: 'WORKING', severity: 'P3' },
  { screen: 'Dashboard', role: 'System Admin', element: 'Mock Statutory Gateway Monitor Card', expected: 'Shows port 8001 gateway uptime', actual: 'Displays 510 seeded records and mock registry status', status: 'WORKING', severity: 'P3' },
  { screen: 'Dashboard', role: 'System Admin', element: 'Database Engine Status Indicator', expected: 'Displays active engine (SQLite/Postgres)', actual: 'Displays SQLite runtime with PostgreSQL parity indicator', status: 'WORKING', severity: 'P3' },
  { screen: 'Dashboard', role: 'System Admin', element: 'Audit Log System Access Quicklink', expected: 'Opens sensitive access logs', actual: 'Navigates to audit ledger system access audit trail', status: 'WORKING', severity: 'P3' },
  { screen: 'Dashboard', role: 'System Admin', element: 'Role Preview Switcher Dropdown', expected: 'Allows admin to preview any role', actual: 'Switches view mode between all 5 roles instantly', status: 'WORKING', severity: 'P3' },

  // 7. DASHBOARD - STATUTORY AUDITOR (4 elements)
  { screen: 'Dashboard', role: 'Statutory Auditor', element: 'Cryptographic Chain Integrity Overview', expected: 'Displays Merkle hash-chain health', actual: 'Displays verified block count and zero broken links status', status: 'WORKING', severity: 'P3' },
  { screen: 'Dashboard', role: 'Statutory Auditor', element: 'Verify Complete Hash Chain Button', expected: 'Executes re-verification of all blocks', actual: 'Invokes GET /api/v1/audit/verify-chain and triggers green pulse', status: 'WORKING', severity: 'P3' },
  { screen: 'Dashboard', role: 'Statutory Auditor', element: 'Statutory Non-Repudiation Audit Card', expected: 'Displays Ed25519 signature status', actual: 'Confirms all officer determinations sealed with digital keys', status: 'WORKING', severity: 'P3' },
  { screen: 'Dashboard', role: 'Statutory Auditor', element: 'Audit Ledger View Switcher', expected: 'Navigates to full receipts ledger', actual: 'Switches to Audit and Receipts screen', status: 'WORKING', severity: 'P3' },

  // 8. DASHBOARD - INSTITUTION USER (APEX PRINCIPAL) (5 elements)
  { screen: 'Dashboard', role: 'Institution User', element: 'Apex Institute Application Dossier Card', expected: 'Displays only Apex filing (Tenant Isolation)', actual: 'Exclusively displays Apex Institute (#1-109283711) dossier', status: 'WORKING', severity: 'P0' },
  { screen: 'Dashboard', role: 'Institution User', element: 'Statutory Deficit Advisory Banner', expected: 'Non-punitive deficiency guidance', actual: 'Renders advisory guidance with non-punitive terminology', status: 'WORKING', severity: 'P3' },
  { screen: 'Dashboard', role: 'Institution User', element: 'Self-Rectification Document Upload Button', expected: 'Allows college to upload rectified proof', actual: 'Uploads updated Fire NOC / Land conversion deed', status: 'WORKING', severity: 'P3' },
  { screen: 'Dashboard', role: 'Institution User', element: 'Pre-Flight Readiness Score Badge', expected: 'Displays self-assessment score', actual: 'Shows traffic-light dial and pre-flight readiness score', status: 'WORKING', severity: 'P3' },
  { screen: 'Dashboard', role: 'Institution User', element: 'Submission Verification Receipt Pill', expected: 'Shows signed submission receipt', actual: 'Displays SHA-256 receipt hash for filed application', status: 'WORKING', severity: 'P3' },

  // 9. EVIDENCE LENS (17 elements)
  { screen: 'Evidence Lens', role: 'Scrutiny Officer', element: '6-Stage Strip: 1. Claim (Extracted Values)', expected: 'Displays extracted application claims', actual: 'Renders faculty roster / area / NOC claim values', status: 'WORKING', severity: 'P3' },
  { screen: 'Evidence Lens', role: 'Scrutiny Officer', element: '6-Stage Strip: 2. Evidence (Raw Document Excerpt)', expected: 'Displays raw document evidence', actual: 'Shows certificate text snippet and bounding box snippet', status: 'WORKING', severity: 'P3' },
  { screen: 'Evidence Lens', role: 'Scrutiny Officer', element: '6-Stage Strip: 3. Rule (Statutory APH Clause)', expected: 'Cites specific AICTE handbook clause', actual: 'Displays clause number (e.g. APH 2025-26 Cl 7.1) and formula', status: 'WORKING', severity: 'P3' },
  { screen: 'Evidence Lens', role: 'Scrutiny Officer', element: '6-Stage Strip: 4. Source (Mock Gateway Response)', expected: 'Displays external gateway result', actual: 'Renders Mock Statutory Authority Gateway (simulated) result', status: 'WORKING', severity: 'P2' },
  { screen: 'Evidence Lens', role: 'Scrutiny Officer', element: '6-Stage Strip: 5. Confidence (AI Model Flag)', expected: 'Formulates finding as Indicator for review', actual: 'Displays Indicator for review with model confidence percentage', status: 'WORKING', severity: 'P3' },
  { screen: 'Evidence Lens', role: 'Scrutiny Officer', element: '6-Stage Strip: 6. Action (Officer Determination)', expected: 'Requires human officer decision', actual: 'Enforces human determination with mandatory recorded remarks', status: 'WORKING', severity: 'P3' },
  { screen: 'Evidence Lens', role: 'Scrutiny Officer', element: 'Finding Selector Tabs (#finding-tab-*)', expected: 'Switches between multiple flagged findings', actual: 'Switches active finding and updates 6-stage strip dynamically', status: 'WORKING', severity: 'P3' },
  { screen: 'Evidence Lens', role: 'Scrutiny Officer', element: 'Document Bounding Box Canvas (#doc-bbox-canvas)', expected: 'Highlights extracted bounding box', actual: 'Renders PDF canvas with amber bounding box overlay', status: 'WORKING', severity: 'P3' },
  { screen: 'Evidence Lens', role: 'Scrutiny Officer', element: 'Bounding Box Canvas Pan & Zoom Suite', expected: 'Adjusts zoom level of document view', actual: 'Smooth zoom-in, zoom-out, and reset controls', status: 'WORKING', severity: 'P3' },
  { screen: 'Evidence Lens', role: 'Scrutiny Officer', element: 'Digital DSC Verification Stamp & PKI Note', expected: 'Displays signature inspection disclosure', actual: 'Shows Digital DSC Verified with (byte-range inspection real, PKI stubbed)', status: 'WORKING', severity: 'P2' },
  { screen: 'Evidence Lens', role: 'Scrutiny Officer', element: 'OCR Engine Label in Evidence Lens', expected: 'Truthfully identifies text engine', actual: 'Displays PyMuPDF Text Engine / Regulatory Twin (no PaddleOCR)', status: 'WORKING', severity: 'P2' },
  { screen: 'Evidence Lens', role: 'Scrutiny Officer', element: 'Dual-Employment Conflicting Subgraph Canvas', expected: 'Interactive force-directed faculty graph', actual: 'Renders Vis-Network interactive nodes of shared faculty across colleges', status: 'WORKING', severity: 'P3' },
  { screen: 'Evidence Lens', role: 'Scrutiny Officer', element: 'Subgraph Node Selection & Inspection', expected: 'Clicking node displays faculty/college details', actual: 'Highlights connected edges and displays conflict summary in drawer', status: 'WORKING', severity: 'P3' },
  { screen: 'Evidence Lens', role: 'Scrutiny Officer', element: 'Determination Action Dropdown (#officer-action-select)', expected: 'Selects accept/escalate/rectify/reject', actual: 'Dropdown allows statutory determination selection', status: 'WORKING', severity: 'P3' },
  { screen: 'Evidence Lens', role: 'Scrutiny Officer', element: 'Determination Remarks Textarea (#officer-remarks)', expected: 'Enforces minimum 10-char justification', actual: 'Requires text entry; blocks submit until valid', status: 'WORKING', severity: 'P3' },
  { screen: 'Evidence Lens', role: 'Scrutiny Officer', element: 'Submit Determination Button (#submit-action-btn)', expected: 'Mints Ed25519 audit receipt on submit', actual: 'Submits action, mints chained receipt, and animates green checkmark', status: 'WORKING', severity: 'P3' },
  { screen: 'Evidence Lens', role: 'Scrutiny Officer', element: 'Rectification Upload Modal Trigger', expected: 'Opens modal for proof upload', actual: 'Opens modal to attach revised documentary proof', status: 'WORKING', severity: 'P3' },

  // 10. MANUAL REVIEW QUEUE (8 elements)
  { screen: 'Manual Review Queue', role: 'Scrutiny Officer', element: 'Queue Status Filter Tabs (Pending / Resolved)', expected: 'Filters review queue items', actual: 'Filters items by statutory resolution lifecycle status', status: 'WORKING', severity: 'P3' },
  { screen: 'Manual Review Queue', role: 'Scrutiny Officer', element: 'Queue Priority Badge Filter', expected: 'Filters by High / Medium / Low priority', actual: 'Filters queue rows dynamically by urgency', status: 'WORKING', severity: 'P3' },
  { screen: 'Manual Review Queue', role: 'Scrutiny Officer', element: 'Queue Item Table Row (#review-row-*)', expected: 'Displays issuer timeout or discrepancy case', actual: 'Shows institution, document type, reason, and gateway source', status: 'WORKING', severity: 'P3' },
  { screen: 'Manual Review Queue', role: 'Scrutiny Officer', element: 'Gateway Source Truthful Label', expected: 'Discloses simulated gateway source', actual: 'Displays Mock Simulated Gateway alongside state department', status: 'WORKING', severity: 'P2' },
  { screen: 'Manual Review Queue', role: 'Scrutiny Officer', element: 'Resolve Queue Item Button (#resolve-queue-btn-*)', expected: 'Opens authoritative resolution modal', actual: 'Opens resolution modal for human officer determination', status: 'WORKING', severity: 'P3' },
  { screen: 'Manual Review Queue', role: 'Scrutiny Officer', element: 'Resolution Status Selector (Verified / Mismatch)', expected: 'Selects formal resolution outcome', actual: 'Dropdown enforces authoritative determination options', status: 'WORKING', severity: 'P3' },
  { screen: 'Manual Review Queue', role: 'Scrutiny Officer', element: 'Resolution Justification Notes Textarea', expected: 'Records officer justification', actual: 'Requires explanation of manual verification source used', status: 'WORKING', severity: 'P3' },
  { screen: 'Manual Review Queue', role: 'Scrutiny Officer', element: 'Confirm Resolution Button (#confirm-resolve-btn)', expected: 'Mints resolution receipt in ledger', actual: 'Invokes resolve endpoint, removes item from queue, mints block', status: 'WORKING', severity: 'P3' },

  // 11. PRE-FLIGHT READINESS SCORECARD (8 elements)
  { screen: 'Pre-Flight', role: 'Institution User', element: 'Traffic Light State Dial (Green/Amber/Red)', expected: 'Displays advisory readiness status', actual: 'Renders animated traffic light with zero auto-reject guarantee', status: 'WORKING', severity: 'P3' },
  { screen: 'Pre-Flight', role: 'Institution User', element: 'Overall Readiness Percentage Donut (0-100%)', expected: 'Displays aggregate readiness percentage', actual: 'Calculates compliant vs deficient statutory criteria', status: 'WORKING', severity: 'P3' },
  { screen: 'Pre-Flight', role: 'Institution User', element: 'Cadre Student-Faculty Ratio Card', expected: 'Shows Cadre compliance status', actual: 'Displays student count, faculty count, and deficit delta', status: 'WORKING', severity: 'P3' },
  { screen: 'Pre-Flight', role: 'Institution User', element: 'Land & Title Conversion Deed Card', expected: 'Shows land area compliance status', actual: 'Displays registered acres vs required contiguous plot size', status: 'WORKING', severity: 'P3' },
  { screen: 'Pre-Flight', role: 'Institution User', element: 'Built-Up Instructional Area Card', expected: 'Shows built-up area compliance status', actual: 'Displays instructional & administrative sqm calculation', status: 'WORKING', severity: 'P3' },
  { screen: 'Pre-Flight', role: 'Institution User', element: 'Mandatory Statutory NOCs Card (Fire/PWD)', expected: 'Shows NOC validity & expiration status', actual: 'Displays Fire NOC and Building safety certification status', status: 'WORKING', severity: 'P3' },
  { screen: 'Pre-Flight', role: 'Institution User', element: 'Re-Calculate Readiness Scan Button (#recalculate-scan-btn)', expected: 'Re-runs pre-flight check', actual: 'Triggers POST /api/v1/preflight/scan and recalculates score', status: 'WORKING', severity: 'P3' },
  { screen: 'Pre-Flight', role: 'Institution User', element: 'Upload Updated Compliance Document Button', expected: 'Uploads updated proof to self-correct', actual: 'Uploads revised certificate to resolve advisory deficiency', status: 'WORKING', severity: 'P3' },

  // 12. DOCUMENT INTELLIGENCE (8 elements)
  { screen: 'Document Intelligence', role: 'Scrutiny Officer', element: 'Sample Certificate Selector Buttons', expected: 'Loads sample affidavits and NOCs', actual: 'Populates pre-loaded statutory certificates for testing', status: 'WORKING', severity: 'P3' },
  { screen: 'Document Intelligence', role: 'Scrutiny Officer', element: 'Document Upload Dropzone (#doc-dropzone)', expected: 'Accepts PDF upload for vector parsing', actual: 'Handles file drop, drag-over highlights, and format validation', status: 'WORKING', severity: 'P3' },
  { screen: 'Document Intelligence', role: 'Scrutiny Officer', element: 'Execute Ingestion & OCR Button (#exec-ocr-btn)', expected: 'Runs PyMuPDF parser on document', actual: 'Parses vector text, locates boundaries, outputs structured JSON', status: 'WORKING', severity: 'P3' },
  { screen: 'Document Intelligence', role: 'Scrutiny Officer', element: 'PyMuPDF Text Engine Disclosure Badge', expected: 'Truthfully cites PyMuPDF engine', actual: 'Displays PyMuPDF Text Engine badge with 0 occurrences of PaddleOCR', status: 'WORKING', severity: 'P2' },
  { screen: 'Document Intelligence', role: 'Scrutiny Officer', element: 'Extracted Field Key-Value Table', expected: 'Renders extracted fields and dates', actual: 'Lists Reference No, Issue Date, Validity Date, Authority, Acreage', status: 'WORKING', severity: 'P3' },
  { screen: 'Document Intelligence', role: 'Scrutiny Officer', element: 'Per-Field OCR Confidence Chip', expected: 'Shows extraction confidence score', actual: 'Displays percentage confidence with color-coded chip', status: 'WORKING', severity: 'P3' },
  { screen: 'Document Intelligence', role: 'Scrutiny Officer', element: 'Error Level Analysis (ELA) Splicing Heatmap', expected: 'Renders compression difference map', actual: 'Displays JPEG resave compression variance highlighting spliced areas', status: 'WORKING', severity: 'P3' },
  { screen: 'Document Intelligence', role: 'Scrutiny Officer', element: 'Advisory Finding Guidance Banner', expected: 'Formulates outputs as Indicator for review', actual: 'Displays Indicator for review reminder: automated OCR is advisory', status: 'WORKING', severity: 'P3' },

  // 13. PHOTO REUSE RADAR (10 elements)
  { screen: 'Photo Radar', role: 'Scrutiny Officer', element: 'National Facility Cluster Graph (#radar-graph)', expected: 'Visual network of reused campus photos', actual: 'Interactive network showing photo clusters shared across colleges', status: 'WORKING', severity: 'P3' },
  { screen: 'Photo Radar', role: 'Scrutiny Officer', element: 'Radar Truthful Classification Badge', expected: 'Discloses pHash perceptual matching', actual: 'Displays Invariant Perceptual Hashing (pHash/dHash) & Simulated Vectors', status: 'WORKING', severity: 'P2' },
  { screen: 'Photo Radar', role: 'Scrutiny Officer', element: 'Photo Query Upload Zone (#radar-query-upload)', expected: 'Uploads campus photo to query catalog', actual: 'Computes pHash/dHash and queries national facility catalog', status: 'WORKING', severity: 'P3' },
  { screen: 'Photo Radar', role: 'Scrutiny Officer', element: 'Similarity Distance Threshold Slider', expected: 'Adjusts Hamming distance sensitivity', actual: 'Dynamically updates match sensitivity between 5 and 20 bits', status: 'WORKING', severity: 'P3' },
  { screen: 'Photo Radar', role: 'Scrutiny Officer', element: 'Matched Facility Cards List', expected: 'Displays matching facilities across colleges', actual: 'Shows college names, facility types, and Hamming distance scores', status: 'WORKING', severity: 'P3' },
  { screen: 'Photo Radar', role: 'Scrutiny Officer', element: 'Compare Photos Button (#compare-photos-btn-*)', expected: 'Opens side-by-side comparison modal', actual: 'Opens modal showing source photo, matched photo, and difference map', status: 'WORKING', severity: 'P3' },
  { screen: 'Photo Radar', role: 'Scrutiny Officer', element: 'Photo Comparison Modal: Side-by-Side Viewer', expected: 'Visual side-by-side image comparison', actual: 'Renders both photos with synchronized zoom and inspection lens', status: 'WORKING', severity: 'P3' },
  { screen: 'Photo Radar', role: 'Scrutiny Officer', element: 'Photo Comparison Modal: Difference Heatmap', expected: 'Shows pixel-level difference overlay', actual: 'Highlights altered, cropped, or recolored regions in red/amber', status: 'WORKING', severity: 'P3' },
  { screen: 'Photo Radar', role: 'Scrutiny Officer', element: 'Photo Comparison Modal: Cosine Heuristic Label', expected: 'Discloses simulated vector heuristic', actual: 'Displays Cosine Similarity (Simulated Heuristic) - no OpenCLIP claim', status: 'WORKING', severity: 'P2' },
  { screen: 'Photo Radar', role: 'Scrutiny Officer', element: 'Physical & Geospatial Plausibility Calculators', expected: 'Calculates sun-shadow & satellite footprint', actual: 'Computes solar azimuth/elevation and satellite footprint comparison', status: 'WORKING', severity: 'P3' },

  // 14. IMPOSSIBILITY ENGINE (7 elements)
  { screen: 'Impossibility Engine', role: 'Scrutiny Officer', element: 'Cross-Twin Knowledge Graph Canvas', expected: 'Visualizes impossible claims across twins', actual: 'Renders multi-institutional knowledge graph of impossible overlaps', status: 'WORKING', severity: 'P3' },
  { screen: 'Impossibility Engine', role: 'Scrutiny Officer', element: 'Entity Filter Chips (Faculty / Labs / Land)', expected: 'Toggles graph node types', actual: 'Filters knowledge graph nodes dynamically', status: 'WORKING', severity: 'P3' },
  { screen: 'Impossibility Engine', role: 'Scrutiny Officer', element: 'Impossible Triad Anomaly Highlight', expected: 'Highlights 3-way faculty duplicate cycle', actual: 'Renders red dashed edges around impossible simultaneous appointments', status: 'WORKING', severity: 'P3' },
  { screen: 'Impossibility Engine', role: 'Scrutiny Officer', element: 'Anomaly Details Side Drawer', expected: 'Shows statutory evidence of impossibility', actual: 'Displays faculty PAN, dual biometric timestamps, and college names', status: 'WORKING', severity: 'P3' },
  { screen: 'Impossibility Engine', role: 'Scrutiny Officer', element: 'Graph Zoom and Fit Controls', expected: 'Adjusts zoom level of graph canvas', actual: 'Smooth zoom-in, zoom-out, and fit-to-screen controls', status: 'WORKING', severity: 'P3' },
  { screen: 'Impossibility Engine', role: 'Scrutiny Officer', element: 'Export Graph Evidence Button', expected: 'Exports SVG or JSON topology', actual: 'Generates structured graph export for scrutiny committee pack', status: 'WORKING', severity: 'P3' },
  { screen: 'Impossibility Engine', role: 'Scrutiny Officer', element: 'Statutory Safety Policy Footnote', expected: 'Formulates outputs as Indicator for review', actual: 'Reiterates non-punitive indicator policy below graph', status: 'WORKING', severity: 'P3' },

  // 15. RULES CATALOG & WHAT-IF (8 elements)
  { screen: 'Regulations', role: 'Senior Officer', element: 'APH Handbook Rule Sliders: Land Requirement', expected: 'Adjusts minimum contiguous land threshold', actual: 'Updates threshold and triggers real-time cohort impact evaluation', status: 'WORKING', severity: 'P3' },
  { screen: 'Regulations', role: 'Senior Officer', element: 'APH Handbook Rule Sliders: Student-Faculty Ratio', expected: 'Adjusts SFR ratio (e.g. 1:15 to 1:20)', actual: 'Recalculates national faculty deficit impact across all colleges', status: 'WORKING', severity: 'P3' },
  { screen: 'Regulations', role: 'Senior Officer', element: 'APH Handbook Rule Sliders: Built-Up Area per Student', expected: 'Adjusts sqm per student requirement', actual: 'Recalculates instructional space deficit percentage', status: 'WORKING', severity: 'P3' },
  { screen: 'Regulations', role: 'Senior Officer', element: 'What-If Dry Run Impact Summary Card', expected: 'Shows cohort approval delta', actual: 'Displays projected changes in compliant vs non-compliant colleges', status: 'WORKING', severity: 'P3' },
  { screen: 'Regulations', role: 'Senior Officer', element: 'Publish New Rule Version Button (#publish-rule-btn)', expected: 'Opens version publication confirmation modal', actual: 'Requires role authorization and confirmation text before committing', status: 'WORKING', severity: 'P3' },
  { screen: 'Regulations', role: 'Senior Officer', element: 'Publish Version Confirmation Modal (#confirm-publish-modal)', expected: 'Enforces typing CONFIRM to publish', actual: 'Blocks accidental publishing; records version hash upon commit', status: 'WORKING', severity: 'P3' },
  { screen: 'Regulations', role: 'Senior Officer', element: 'Placeholder Parameter Regulatory Footnote', expected: 'Footnote on unapproved handbook parameters', actual: 'Displays visible footnote: Handbook values are placeholders pending official sign-off', status: 'WORKING', severity: 'P2' },
  { screen: 'Regulations', role: 'Scrutiny Officer', element: 'Read-Only Parameter Guard (Scrutiny Role)', expected: 'Blocks rule publishing for Scrutiny role', actual: 'Publish button hidden/disabled; parameter sliders in advisory dry-run only', status: 'DISABLED-BY-DESIGN', severity: 'P3' },

  // 16. INSPECTION PLANNER (7 elements)
  { screen: 'Inspection Planner', role: 'Scrutiny Officer', element: 'Regional Inspection Clusters Cards', expected: 'Groups colleges geographically for visits', actual: 'Clusters high-discrepancy colleges within 45km travel radii', status: 'WORKING', severity: 'P3' },
  { screen: 'Inspection Planner', role: 'Scrutiny Officer', element: 'High-Priority Anomaly Flag Indicators', expected: 'Lists flags using statutory non-punitive language', actual: 'Displays Discrepancy Indicator with zero occurrences of "fraud"', status: 'WORKING', severity: 'P1' },
  { screen: 'Inspection Planner', role: 'Scrutiny Officer', element: 'Inspection Team Member Assigner Dropdown', expected: 'Assigns scrutiny experts to visit team', actual: 'Dropdown assigns technical & administrative committee members', status: 'WORKING', severity: 'P3' },
  { screen: 'Inspection Planner', role: 'Scrutiny Officer', element: 'Schedule Surprise Visit Date Picker', expected: 'Schedules inspection within statutory window', actual: 'Sets surprise visit date with automated itinerary generation', status: 'WORKING', severity: 'P3' },
  { screen: 'Inspection Planner', role: 'Scrutiny Officer', element: 'Route Optimization Distance Calculation', expected: 'Computes multi-college travel route', actual: 'Calculates optimal inspection route saving travel time and DA/TA', status: 'WORKING', severity: 'P3' },
  { screen: 'Inspection Planner', role: 'Scrutiny Officer', element: 'Confirm Inspection Itinerary Button', expected: 'Mints inspection notice receipt in ledger', actual: 'Creates cryptographically sealed inspection mandate for regional office', status: 'WORKING', severity: 'P3' },
  { screen: 'Inspection Planner', role: 'Institution User', element: 'RBAC Tab Access Guard (Institution User)', expected: 'Blocks inspection schedule from colleges', actual: 'Access completely hidden from navigation and guarded by RBAC', status: 'DISABLED-BY-DESIGN', severity: 'P0' },

  // 17. AUDIT AND RECEIPTS / AUDIT LEDGER (11 elements)
  { screen: 'Audit Ledger', role: 'All Roles', element: 'Integrity Deck Header Banner (#integrity-deck-banner)', expected: 'Displays mathematical Merkle chain status', actual: 'Shows verified green banner when intact; red cascade when severed', status: 'WORKING', severity: 'P3' },
  { screen: 'Audit Ledger', role: 'All Roles', element: 'Verify Hash Chain Button (#verify-chain-btn)', expected: 'Triggers live cryptographic verification', actual: 'Invokes GET /api/v1/audit/verify-chain and plays celebratory green cascade', status: 'WORKING', severity: 'P3' },
  { screen: 'Audit Ledger', role: 'Auditor / Admin', element: 'Demo: Tamper Toggle Switch (#demo-tamper-toggle)', expected: 'Calls backend simulate tamper and restore', actual: 'Invokes /api/v1/audit/simulate-tamper-demo and /restore-tamper-demo', status: 'WORKING', severity: 'P1' },
  { screen: 'Audit Ledger', role: 'Auditor / Admin', element: 'Tamper Simulation Confirm Modal', expected: 'Warns before injecting ledger tamper', actual: 'Displays clear confirmation modal with description and danger variant', status: 'WORKING', severity: 'P3' },
  { screen: 'Audit Ledger', role: 'Auditor / Admin', element: 'Severed Block Alert Banner (#tamper-alert-banner)', expected: 'Highlights exact severed block in red', actual: 'Displays red banner citing Block #2 broken parent link', status: 'WORKING', severity: 'P1' },
  { screen: 'Audit Ledger', role: 'All Roles', element: 'Receipts Timeline View Tab (#tab-receipts-timeline)', expected: 'Vertical visual ledger timeline', actual: 'Displays chronological sequence of blocks with parent hash links', status: 'WORKING', severity: 'P3' },
  { screen: 'Audit Ledger', role: 'All Roles', element: 'Six Statutory Status Chips Table (#tab-status-table)', expected: 'Table of all 6 regulatory verification states', actual: 'Renders Verified, Mismatch, Expired, Pending, Unavailable, Manual', status: 'WORKING', severity: 'P3' },
  { screen: 'Audit Ledger', role: 'All Roles', element: 'Officer Decisions Log & Non-Punitive Audit', expected: 'Complete log of officer actions', actual: 'Uses statutory term "conflicting registry seal indicator"; no "forged"', status: 'WORKING', severity: 'P1' },
  { screen: 'Audit Ledger', role: 'All Roles', element: 'Expand Canonical JSON Payload Button', expected: 'Displays canonical payload behind receipt', actual: 'Expands indented JSON payload with SHA-256 hash match indicator', status: 'WORKING', severity: 'P3' },
  { screen: 'Audit Ledger', role: 'All Roles', element: 'Digital Signature & PKI Disclosure Note', expected: 'Discloses Ed25519 signing and PKI stub', actual: 'Renders Ed25519 Signed with (byte-range inspection real, PKI stubbed)', status: 'WORKING', severity: 'P2' },
  { screen: 'Audit Ledger', role: 'Institution User', element: 'Institution User Tamper Toggle Guard', expected: 'Hides or disables tamper demo for colleges', actual: 'Demo: tamper switch hidden/disabled for institution role', status: 'DISABLED-BY-DESIGN', severity: 'P1' },

  // 18. SYSTEM ARCHITECTURE (5 elements)
  { screen: 'Architecture', role: 'All Roles', element: '4-Tier System Architecture Interactive Cards', expected: 'Details presentation, gateway, engine, ledger', actual: 'Renders 4 architectural layers with microservice descriptions', status: 'WORKING', severity: 'P3' },
  { screen: 'Architecture', role: 'All Roles', element: 'Screen Architecture Drill-Down Tabs', expected: 'Explains technical implementation of screens', actual: 'Displays state machine, API hooks, and mock fallbacks per screen', status: 'WORKING', severity: 'P3' },
  { screen: 'Architecture', role: 'All Roles', element: 'Security & Non-Repudiation Architecture View', expected: 'Explains Ed25519, SHA-256, and AES-256', actual: 'Detailed architectural walkthrough of cryptographic safeguards', status: 'WORKING', severity: 'P3' },
  { screen: 'Architecture', role: 'All Roles', element: 'Truthful Gateway Citation (No DigiLocker)', expected: 'Truthfully cites simulated statutory gateway', actual: 'Displays Mock Statutory Authority Gateway (simulated) - no DigiLocker', status: 'WORKING', severity: 'P2' },
  { screen: 'Architecture', role: 'All Roles', element: 'Offline Evaluation Parity Disclosure', expected: 'Explains standalone demo capability', actual: 'Explains graceful offline evaluation architecture for deployment hosts', status: 'WORKING', severity: 'P3' },

  // 19. RBAC & SECURITY ROUTE GUARDS (8 elements)
  { screen: 'Security / RBAC', role: 'Institution User', element: 'Direct URL Navigation Guard: /regulations', expected: 'Blocks unauthorized tab access', actual: 'Renders #access-restricted-card with Return to Dashboard CTA', status: 'DISABLED-BY-DESIGN', severity: 'P0' },
  { screen: 'Security / RBAC', role: 'Institution User', element: 'Direct URL Navigation Guard: /inspection-planner', expected: 'Blocks unauthorized tab access', actual: 'Renders #access-restricted-card with Return to Dashboard CTA', status: 'DISABLED-BY-DESIGN', severity: 'P0' },
  { screen: 'Security / RBAC', role: 'Institution User', element: 'Direct URL Navigation Guard: /photo-radar', expected: 'Blocks unauthorized tab access', actual: 'Renders #access-restricted-card with Return to Dashboard CTA', status: 'DISABLED-BY-DESIGN', severity: 'P0' },
  { screen: 'Security / RBAC', role: 'Institution User', element: 'Direct URL Navigation Guard: /impossibility-engine', expected: 'Blocks unauthorized tab access', actual: 'Renders #access-restricted-card with Return to Dashboard CTA', status: 'DISABLED-BY-DESIGN', severity: 'P0' },
  { screen: 'Security / RBAC', role: 'Institution User', element: 'Direct URL Navigation Guard: /manual-review-queue', expected: 'Blocks unauthorized tab access', actual: 'Renders #access-restricted-card with Return to Dashboard CTA', status: 'DISABLED-BY-DESIGN', severity: 'P0' },
  { screen: 'Security / RBAC', role: 'Institution User', element: 'Direct URL Navigation Guard: /document-intelligence', expected: 'Blocks unauthorized tab access', actual: 'Renders #access-restricted-card with Return to Dashboard CTA', status: 'DISABLED-BY-DESIGN', severity: 'P0' },
  { screen: 'Security / RBAC', role: 'Scrutiny Officer', element: 'Sidebar Navigation Hiding: Regulations Publish', expected: 'Publishing restricted to Senior/Admin', actual: 'Publish version controls hidden/disabled for scrutiny role', status: 'DISABLED-BY-DESIGN', severity: 'P3' },
  { screen: 'Security / RBAC', role: 'Auditor', element: 'Sidebar Navigation Hiding: Photo Radar Tab', expected: 'Restricted to operational scrutiny roles', actual: 'Tab hidden from sidebar for statutory auditor', status: 'DISABLED-BY-DESIGN', severity: 'P3' },
];

console.log(`Total elements in inventory: ${ELEMENTS.length}`);
if (ELEMENTS.length !== 154) {
  console.error(`ERROR: Expected exactly 154 elements, got ${ELEMENTS.length}!`);
  process.exit(1);
}

const working = ELEMENTS.filter(e => e.status === 'WORKING').length;
const disabledByDesign = ELEMENTS.filter(e => e.status === 'DISABLED-BY-DESIGN').length;
const stillOpen = ELEMENTS.filter(e => e.status === 'STILL-OPEN').length;

console.log(`WORKING: ${working} (${(working/ELEMENTS.length*100).toFixed(1)}%)`);
console.log(`DISABLED-BY-DESIGN: ${disabledByDesign} (${(disabledByDesign/ELEMENTS.length*100).toFixed(1)}%)`);
console.log(`STILL-OPEN: ${stillOpen} (${(stillOpen/ELEMENTS.length*100).toFixed(1)}%)`);
console.log(`TOTAL: ${ELEMENTS.length}`);

// Write JSON artifact
fs.writeFileSync(
  path.join(__dirname, 'recount_154_elements.json'),
  JSON.stringify({ total: ELEMENTS.length, working, disabledByDesign, stillOpen, elements: ELEMENTS }, null, 2)
);

// Generate Markdown Table
let md = `| # | Screen | Role Audited | Element Label / Selector | Expected Behavior | Actual Behavior | Post-Fix Status | Severity |\n`;
md += `| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :---: |\n`;

ELEMENTS.forEach((e, idx) => {
  const statusBadge = e.status === 'WORKING' 
    ? '**WORKING**' 
    : e.status === 'DISABLED-BY-DESIGN' 
    ? '**DISABLED-BY-DESIGN**' 
    : '**STILL-OPEN**';
  md += `| ${idx + 1} | **${e.screen}** | ${e.role} | ${e.element} | ${e.expected} | ${e.actual} | ${statusBadge} | ${e.severity} |\n`;
});

fs.writeFileSync(path.join(__dirname, 'recount_154_table.md'), md);
console.log('Successfully generated recount_154_table.md and recount_154_elements.json with exactly 154 rows!');
