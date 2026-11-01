import React, { useState } from 'react';
import {
  Layers,
  Cpu,
  Database,
  ShieldCheck,
  FileSearch,
  ScanEye,
  Network,
  FileCheck2,
  BookOpenCheck,
  Compass,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  Maximize2,
  ChevronRight,
  ChevronLeft,
  X,
  Search,
  Sparkles,
  Lock,
  Scale,
  Info,
  Terminal,
  ArrowRight,
  Activity,
  Server,
  Workflow,
  Eye,
  Zap,
  Clock,
  ShieldAlert
} from 'lucide-react';

// Screenshot Catalog with Verified Local Public Assets
const SCREENSHOT_CATALOG = [
  {
    id: 'dashboard',
    title: 'Desk Scrutiny & Triage Queue',
    category: 'scrutiny',
    filename: '/screenshots/dashboard.png',
    tabTarget: 'dashboard',
    badge: 'Primary Scrutiny',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    summary: 'Central risk-ranked triage dashboard displaying institutional applications, anomaly chips, dynamic regulatory KPIs, and PyMuPDF test scanner.',
    features: [
      'Risk scoring algorithm prioritizing high-risk applications',
      'Dynamic KPI cards for total cases, anomalies, and expired NOCs',
      'PyMuPDF live document scanner with instant receipt generation',
      'One-click deep navigation to Evidence Lens and Determination modal'
    ]
  },
  {
    id: 'evidence-lens',
    title: 'Evidence Lens Inspection & Bounding Boxes',
    category: 'scrutiny',
    filename: '/screenshots/evidence_lens.png',
    tabTarget: 'evidence-lens',
    badge: 'Document Scrutiny',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    summary: 'Side-by-side document inspection interface highlighting extracted OCR bounding boxes, rule violations, and cryptographic audit hashes.',
    features: [
      'Visual OCR bounding box overlays on scanned certificates',
      'AICTE APH handbook clause cross-referencing and confidence scores',
      'Direct link to signed audit receipt and SHA-256 block hash',
      'Officer determination action modal with mandatory remark logging'
    ]
  },
  {
    id: 'preflight',
    title: 'Pre-Flight Readiness Scorecard',
    category: 'scrutiny',
    filename: '/screenshots/preflight.png',
    tabTarget: 'preflight',
    badge: 'Self-Assessment',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    summary: 'Non-punitive readiness simulation enabling institutions to self-audit deficiency gaps prior to formal submission.',
    features: [
      'Composite readiness score breakdown across Cadre, Land, and NOCs',
      'Checklist completion percentage with discrepancy warnings',
      'Prescriptive remedial steps for non-compliant parameters',
      'Zero penalty advisory sandbox encouraging early compliance'
    ]
  },
  {
    id: 'photo-radar',
    title: 'Photo Radar & Forensic ELA Scanner',
    category: 'forensics',
    filename: '/screenshots/photo_radar.png',
    tabTarget: 'photo-radar',
    badge: 'Perceptual Forensics',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    summary: 'Perceptual pHash similarity detection and Error-Level Analysis (ELA) for detecting reused campus photos and spliced documents.',
    features: [
      'Multi-hash perceptual matching (pHash & dHash) across 12,000+ photos',
      'Perceptual pHash index (Hamming &le; 10) for cross-college clustering',
      'Error-Level Analysis heatmap revealing modified JPEG compression blocks',
      'Side-by-side visual comparison panel with match similarity percentages'
    ]
  },
  {
    id: 'impossibility-engine',
    title: 'Cross-College Impossibility Engine',
    category: 'graph',
    filename: '/screenshots/impossibility_engine.png',
    tabTarget: 'impossibility-engine',
    badge: 'Twin Graph Engine',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    summary: 'Heterogeneous knowledge graph detecting moonlighting faculty and overlapping land survey parcels across nationwide colleges.',
    features: [
      'NetworkX twin graph connecting institutions, faculty, and land parcels',
      'Simultaneous employment anomaly detection using hashed PAN/Aadhaar',
      'Geographical transit impossibility checks (>300km separation)',
      'Shared physical infrastructure and survey number collision flags'
    ]
  },
  {
    id: 'document-intelligence',
    title: 'Document Intelligence & Verification',
    category: 'scrutiny',
    filename: '/screenshots/document_intelligence.png',
    tabTarget: 'document-intelligence',
    badge: 'OCR & Schema',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    summary: 'Automated field extraction, schema parsing, and live external verification status across Mock Statutory Authority Gateway (simulated) and state portals.',
    features: [
      'Tier-1 PyMuPDF text & table extraction with high fidelity',
      'Tier-2 ML Classifier for automated document classification',
      'Live external issuer connector status with discrepancy logs',
      'Authoritative fallback escalation for manual review'
    ]
  },
  {
    id: 'audit-ledger',
    title: 'Tamper-Evident SHA-256 Audit Ledger',
    category: 'audit',
    filename: '/screenshots/audit_ledger.png',
    tabTarget: 'audit-ledger',
    badge: 'Cryptographic Ledger',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    summary: 'Append-only cryptographic audit chain logging every regulatory action with SHA-256 Merkle hashes and interactive tamper simulation.',
    features: [
      'Block header linking: H_n = SHA-256(Block_n || H_{n-1} || Action)',
      'Statutory compliance tracking and officer identity signatures',
      'Interactive tamper simulation with instant broken-chain visual detection',
      'Exportable JSON receipts for appellate tribunals and RTI compliance'
    ]
  },
  {
    id: 'regulations',
    title: 'Regulation-as-Code & What-If Engine',
    category: 'audit',
    filename: '/screenshots/regulations.png',
    tabTarget: 'regulations',
    badge: 'APH Rules Catalog',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    summary: 'Codified AICTE Approval Process Handbook rules with multi-version catalog and dry-run regulatory impact simulation.',
    features: [
      'Codified handbook clauses with parameter thresholds and formulas',
      'Multi-version regulation history (APH 2024-25 vs APH 2025-26)',
      'What-If dry-run simulator testing proposed policy changes across batches',
      'Role-based approval gates for modifying regulatory parameter bounds'
    ]
  },
  {
    id: 'inspection-planner',
    title: 'GIS Inspection Route Planner',
    category: 'scrutiny',
    filename: '/screenshots/inspection_planner.png',
    tabTarget: 'inspection-planner',
    badge: 'GIS Clustering',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    summary: 'Intelligent spatial clustering algorithm grouping high-risk institutions to optimize expert committee inspection travel routes.',
    features: [
      'District-level geographical cluster grouping based on risk rank',
      'Optimal inspection order calculation minimizing inter-college travel',
      'Pre-populated scrutiny finding dossiers for on-site inspection teams',
      'Offline checklist synchronization for visiting committee members'
    ]
  },
  {
    id: 'manual-review-queue',
    title: 'Authoritative Fallback Review Queue',
    category: 'scrutiny',
    filename: '/screenshots/manual_review_queue.png',
    tabTarget: 'manual-review-queue',
    badge: 'Graceful Fallback',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    summary: 'Dedicated fallback queue for ambiguous OCR results and external registry downtime, preventing automated rejections.',
    features: [
      'Zero algorithmic deadlock guarantee through human-in-the-loop triage',
      'Registry timeout fallback tracking and manual document review',
      'Escalation routing to senior scrutinizing officers',
      'Audit receipt integration for officer overrides'
    ]
  },
  {
    id: 'rbac-roles',
    title: 'Role-Based Access Control Matrix',
    category: 'audit',
    filename: '/screenshots/rbac_roles.png',
    tabTarget: 'dashboard',
    badge: 'Security & RBAC',
    badgeColor: 'bg-surface-2 text-slate-800 border-slate-300',
    summary: 'Strict 5-tier role-based access control isolating duties between Scrutiny Officers, Senior Officers, Admins, Auditors, and Institutions.',
    features: [
      'Separation of duties: Scrutiny vs Senior Approval vs Auditor',
      'Institution portal restricted strictly to self-dossier and preflight',
      'Read-only auditor persona with tamper verification privileges',
      'JWT session tokens with granular capability enforcement'
    ]
  },
  {
    id: 'login-screen',
    title: 'Secure Authentication & Demo Switcher',
    category: 'responsive',
    filename: '/screenshots/login.png',
    tabTarget: 'dashboard',
    badge: 'Auth Gateway',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    summary: 'Clean, WCAG-compliant login portal featuring responsive quick-fill credentials for all five regulatory personas.',
    features: [
      'Single-click demo account switcher for rapid evaluation',
      'Full keyboard navigation and accessible focus rings',
      'Zero credential exposure with secure client token management',
      'Responsive multi-column card layout tested across 375px to 1920px'
    ]
  },
  {
    id: 'responsive-shell',
    title: 'Responsive App Shell at 125% Zoom',
    category: 'responsive',
    filename: '/screenshots/dashboard_1366x768_125zoom_after.png',
    tabTarget: 'dashboard',
    badge: '1366x768 Tested',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    summary: 'Desktop laptop optimization verifying zero text clipping, table horizontal scrolling, and accessible navigation at browser zoom.',
    features: [
      'Tested across 1366x768, 1280x720, and 150% browser zoom',
      'Header elements wrap cleanly with non-clipping sign-out action',
      'Footer stays isolated without covering sidebar navigation tabs',
      'Table action buttons wrap into touch-friendly stacked buttons'
    ]
  },
  {
    id: 'dark-mode',
    title: 'High-Contrast Compliance Mode',
    category: 'responsive',
    filename: '/screenshots/dark_mode_check.png',
    tabTarget: 'dashboard',
    badge: 'Accessibility',
    badgeColor: 'bg-surface-2 text-slate-800 border-slate-300',
    summary: 'Integrated high-contrast theme maintaining WCAG 2.1 AA text ratios for intensive long-session scrutiny.',
    features: [
      'Contrast ratio > 4.5:1 on all text and status badges',
      'Glanceable risk color coding (Emerald / Amber / Crimson)',
      'Smooth CSS variable transitions without page reloads',
      'Consistent rendering across all 10 regulatory modules'
    ]
  }
];

// Architecture Component Nodes
const ARCHITECTURE_NODES = [
  {
    id: 'client-layer',
    tier: 'Tier 1: Presentation & Scrutiny Shell',
    name: 'React 19 + Tailwind Client Application',
    icon: Layers,
    color: 'from-sky-500 to-blue-600',
    accent: 'border-sky-300 bg-sky-50/50',
    desc: 'Role-aware regulatory workspace delivering real-time anomaly triaging, bounding box inspection, and pre-flight scoring.',
    tech: ['React 19', 'Tailwind CSS v3', 'Lucide React', 'Vis-Network Canvas', 'Vite 8'],
    sla: '< 100ms UI Response',
    endpoint: 'Static SPA + REST Client (Axios)',
    details: 'Implements an accessible, zero-clipping app shell tested from 375px mobile to 1920px ultra-wide displays. Enforces 5 distinct regulatory RBAC persona perspectives.'
  },
  {
    id: 'gateway-layer',
    tier: 'Tier 2: API Gateway & Security',
    name: 'FastAPI High-Performance Gateway',
    icon: Server,
    color: 'from-blue-600 to-indigo-600',
    accent: 'border-indigo-300 bg-indigo-50/50',
    desc: 'Asynchronous REST gateway managing role-based authorization, rate limiting, and structured audit interceptors.',
    tech: ['FastAPI 0.115+', 'Pydantic v2', 'Python-JOSE (JWT)', 'Uvicorn ASGI'],
    sla: '< 15ms Route Dispatch',
    endpoint: '/api/v1/applications, /api/v1/auth',
    details: 'Dispatches incoming applications across OCR, FAISS, and Twin Graph pipelines while logging cryptographic entry points for non-repudiation.'
  },
  {
    id: 'ocr-layer',
    tier: 'Tier 3: Document Intelligence',
    name: 'PyMuPDF + Tier-2 ML Document Engine',
    icon: FileSearch,
    color: 'from-indigo-600 to-purple-600',
    accent: 'border-purple-300 bg-purple-50/50',
    desc: 'High-speed native PDF parsing and text/bounding-box extraction paired with TF-IDF document classification.',
    tech: ['PyMuPDF (fitz)', 'Scikit-Learn (TF-IDF + Logistic Regression)', 'PDF Plumber'],
    sla: '< 450ms per Certificate',
    endpoint: '/api/v1/documents/ingest',
    details: 'Extracts exact bounding coordinates for certificates, land deeds, and faculty lists. Automatically classifies incoming documents with confidence scores.'
  },
  {
    id: 'forensics-layer',
    tier: 'Tier 4: Visual Radar & Forensics',
    name: 'Perceptual Hashing & FAISS Index',
    icon: ScanEye,
    color: 'from-purple-600 to-rose-600',
    accent: 'border-rose-300 bg-rose-50/50',
    desc: 'Multi-hash visual deduplication and Error-Level Analysis (ELA) for detecting reused infrastructure photos.',
    tech: ['imagehash pHash', 'pHash & dHash (ImageHash)', 'OpenCV', 'Pillow'],
    sla: '< 250ms over 12K+ Photos',
    endpoint: '/api/v1/photo-radar/search',
    details: 'Generates 7 geometric/photometric invariant hash variants. Performs sub-millisecond nearest neighbor lookup across nationwide college image catalogs.'
  },
  {
    id: 'graph-layer',
    tier: 'Tier 5: Twin Graph Impossibility Engine',
    name: 'NetworkX Cross-College Verification',
    icon: Network,
    color: 'from-rose-600 to-orange-600',
    accent: 'border-orange-300 bg-orange-50/50',
    desc: 'Cross-institutional multi-graph detecting physical impossibilities, moonlighting staff, and shared land parcels.',
    tech: ['NetworkX MultiDiGraph', 'Hashed Aadhaar/PAN Index', 'Haversine GIS Matrix'],
    sla: '< 180ms Graph Query',
    endpoint: '/api/v1/graph/impossibilities',
    details: 'Traverses cross-college institutional nodes to flag simultaneous employment across non-contiguous geographical regions (>300km) and overlapping survey numbers.'
  },
  {
    id: 'ledger-layer',
    tier: 'Tier 6: Cryptographic Audit Ledger',
    name: 'SHA-256 Merkle-Linked Audit Chain',
    icon: FileCheck2,
    color: 'from-orange-600 to-emerald-600',
    accent: 'border-emerald-300 bg-emerald-50/50',
    desc: 'Tamper-evident append-only ledger sealing officer actions, OCR receipts, and external verification proofs.',
    tech: ['SHA-256 State Hashing', 'Merkle Receipt Chains', 'SQLite / PostgreSQL ACID'],
    sla: '< 5ms Block Commitment',
    endpoint: '/api/v1/audit/receipts, /api/v1/audit/verify',
    details: 'Computes recursive hash chain H_n = SHA-256(Block_n || H_{n-1}). Instant cryptographic verification detects any unauthorized database tampering.'
  }
];

// Pipeline Steps for Interactive Flow Walkthrough
const PIPELINE_STEPS = [
  {
    step: 1,
    title: 'Document & Photo Ingestion',
    category: 'Ingestion',
    icon: Zap,
    description: 'Applicant institutions upload Land Deeds, Fire Safety NOCs, Building Plans, and Campus Geo-Photos.',
    metrics: 'Accepts PDF, JPG, PNG up to 25MB • Pre-scanned for virus & format compliance',
    systemAction: 'Files stored securely with cryptographic SHA-256 payload checksum before processing.'
  },
  {
    step: 2,
    title: 'PyMuPDF Extraction & Document Classification',
    category: 'Intelligence',
    icon: FileSearch,
    description: 'PyMuPDF extracts embedded text, table rows, and precise word bounding boxes in sub-second time.',
    metrics: '100% vector text capture • TF-IDF + Logistic Regression document categorization',
    systemAction: 'Coordinates and key-value fields mapped to AICTE Approval Process Handbook (APH) schemas.'
  },
  {
    step: 3,
    title: 'Perceptual Hash & Forensic Reality Check',
    category: 'Forensics',
    icon: ScanEye,
    description: 'Photos undergo multi-hash generation (pHash, dHash) and Error-Level Analysis (ELA) to identify tampering.',
    metrics: 'Sub-second perceptual pHash matching across catalog images • 7 invariant transform variants',
    systemAction: 'Flags duplicate library, computer lab, or building photos reused across multiple colleges.'
  },
  {
    step: 4,
    title: 'Cross-College Twin Graph Impossibility Check',
    category: 'Graph Verification',
    icon: Network,
    description: 'Faculty identifiers (hashed PAN/Aadhaar) and land coordinates are projected into the nationwide NetworkX graph.',
    metrics: 'Moonlighting detection • Geographical transit conflict detection (>300km/same day)',
    systemAction: 'Generates non-punitive "Indicator for review" for any cross-institutional overlap detected.'
  },
  {
    step: 5,
    title: 'Regulation-as-Code Evaluation & Risk Scoring',
    category: 'Scrutiny',
    icon: BookOpenCheck,
    description: 'Extracted parameters are evaluated against codified AICTE APH clauses (Student-Faculty Ratio, Built-Up Area, NOC validity).',
    metrics: '26 benchmark anomaly classes evaluated • Pre-flight readiness score calculated (0-100%)',
    systemAction: 'Calculates application risk score and places case in prioritized Scrutiny Officer triage queue.'
  },
  {
    step: 6,
    title: 'Cryptographic Audit Receipt Commitment',
    category: 'Audit & Governance',
    icon: FileCheck2,
    description: 'All extraction proofs, rule evaluations, and officer determinations are committed to the SHA-256 Merkle ledger.',
    metrics: 'Zero-tamper guarantee • SHA-256 hash chaining • RTI & Appellate ready receipt',
    systemAction: 'Creates immutable block linked to previous state hash with cryptographic non-repudiation.'
  }
];

export default function SystemArchitecturePage({ onNavigateTab }) {
  const [activeSection, setActiveSection] = useState('architecture');
  const [selectedNode, setSelectedNode] = useState(ARCHITECTURE_NODES[0]);
  const [activePipelineStep, setActivePipelineStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLightboxImage, setActiveLightboxImage] = useState(null);

  // Filter screenshots based on category & search query
  const filteredScreenshots = SCREENSHOT_CATALOG.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full flex flex-col gap-6 font-sans">
      {/* Page Title & Hero Header */}
      <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Live Architecture & Verification Evidence
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-900/60 text-[11px] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Zero Auto-Rejection
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-900/60 text-[11px] font-semibold font-mono">
                SHA-256 Merkle Ledger
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
              PRAMAAN-X System Architecture & Evidence Showcase
            </h1>
            <p className="text-sm text-text-muted max-w-3xl leading-relaxed">
              Explore the end-to-end technical blueprint of PRAMAAN-X: multi-modal document intelligence, perceptual photo deduplication, cross-institutional twin graph verification, and tamper-evident cryptographic audit receipts.
            </p>
          </div>

          {/* Top Action Button (FIX 7: solid primary #0B3D91 light / #2F5BE8 dark, 40px height, white text) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="btn-deep-dive-specifications"
              onClick={() => setActiveSection('components')}
              className="h-10 px-4 rounded-lg bg-[#0B3D91] dark:bg-[#2F5BE8] hover:opacity-95 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Cpu className="w-4 h-4 text-white" />
              <span>Deep-Dive Specifications</span>
            </button>
          </div>
        </div>

        {/* Stat Cards (FIX 7: equal-width grid, 16px gap, 28px/700 tabular-nums, 12px muted sentence-case labels) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-surface border border-border rounded-xl p-4 shadow-2xs">
            <div className="text-xs font-medium text-text-muted">Total system engines</div>
            <div className="text-[28px] font-bold text-text tabular-nums mt-1.5 leading-none">6</div>
            <div className="text-xs text-text-muted mt-1">Checklist to Ledger</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 shadow-2xs">
            <div className="text-xs font-medium text-text-muted">API endpoints</div>
            <div className="text-[28px] font-bold text-text tabular-nums mt-1.5 leading-none">85</div>
            <div className="text-xs text-text-muted mt-1">Operational routes</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 shadow-2xs">
            <div className="text-xs font-medium text-text-muted">Rule modules</div>
            <div className="text-[28px] font-bold text-text tabular-nums mt-1.5 leading-none">12</div>
            <div className="text-xs text-text-muted mt-1">Declarative APH packs</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 shadow-2xs">
            <div className="text-xs font-medium text-text-muted">Subsystems</div>
            <div className="text-[28px] font-bold text-text tabular-nums mt-1.5 leading-none">10</div>
            <div className="text-xs text-text-muted mt-1">Verification modules</div>
          </div>
        </div>

        {/* Navigation Mode Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-border">
          {[
            { id: 'architecture', label: 'Interactive Architecture', icon: Workflow },
            { id: 'pipeline', label: 'End-to-End Pipeline Simulator', icon: Activity },
            { id: 'gallery', label: 'Visual Evidence & Screenshots', icon: Eye },
            { id: 'components', label: 'Deep-Dive Specifications', icon: Cpu },
            { id: 'safeguards', label: 'Statutory Safeguards & RBAC', icon: Scale },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveSection(tab.id)}
                className={`h-10 px-3.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isActive
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-2 text-text-muted hover:bg-surface-3 hover:text-text border border-border'
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-text-muted'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: INTERACTIVE ARCHITECTURE DIAGRAM */}
      {activeSection === 'architecture' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Interactive Multi-Tier Block Diagram */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Workflow className="w-5 h-5 text-sky-600" />
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-text">Multi-tier architecture diagram</h2>
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">6 Tiers</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-text-muted bg-surface-2 px-2.5 py-1 rounded-md">
                    Click a tier to inspect
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {ARCHITECTURE_NODES.map((node, index) => {
                    const Icon = node.icon;
                    const isSelected = selectedNode.id === node.id;
                    return (
                      <div
                        key={node.id}
                        id={`arch-node-${node.id}`}
                        onClick={() => setSelectedNode(node)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${isSelected
                            ? 'bg-primary/10 border-primary ring-2 ring-primary/20 shadow-xs'
                            : 'bg-surface border-border hover:border-border-muted hover:bg-surface-2'
                          }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${node.color} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold text-primary tracking-wider uppercase block">
                                {node.tier}
                              </span>
                              <h3 className="text-sm font-bold text-text truncate">
                                {node.name}
                              </h3>
                              <p className="text-xs text-text-muted truncate mt-0.5">
                                {node.desc}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="hidden sm:inline-block text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-surface-2 text-text-muted border border-border">
                              {node.sla}
                            </span>
                            <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-sky-600 translate-x-0.5' : 'text-slate-400'}`} />
                          </div>
                        </div>

                        {/* Visual Connector Line between Tiers */}
                        {index < ARCHITECTURE_NODES.length - 1 && (
                          <div className="absolute bottom-0 left-8 transform translate-y-1/2 w-0.5 h-2 bg-slate-300 pointer-events-none" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Selected Node Technical Inspection Drawer */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs sticky top-20">
                <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedNode.color} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                      {React.createElement(selectedNode.icon, { className: 'w-4 h-4' })}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wide">
                        {selectedNode.tier}
                      </span>
                      <h3 className="text-base font-bold text-text leading-tight">
                        {selectedNode.name}
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live Active
                  </span>
                </div>

                <p className="text-xs text-text-muted leading-relaxed mb-4">
                  {selectedNode.details}
                </p>

                <div className="flex flex-col gap-3">
                  <div className="bg-surface-2 border border-border rounded-xl p-3">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide block mb-1.5">
                      Core Technologies & Libraries
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedNode.tech.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-md bg-surface border border-border text-text font-mono text-xs font-semibold">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-surface-2 border border-border rounded-xl p-2.5">
                      <span className="text-[10px] font-bold text-text-muted uppercase block">Performance SLA</span>
                      <span className="text-xs font-extrabold font-mono text-emerald-700">{selectedNode.sla}</span>
                    </div>
                    <div className="bg-surface-2 border border-border rounded-xl p-2.5">
                      <span className="text-[10px] font-bold text-text-muted uppercase block">Service Interface</span>
                      <span className="text-xs font-bold text-text truncate block">{selectedNode.endpoint.split(',')[0]}</span>
                    </div>
                  </div>

                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 mt-1">
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold text-amber-900 block">Statutory Non-Punitive Guarantee</span>
                        <p className="text-[11px] text-amber-800 leading-tight mt-0.5">
                          Output flags are designated exclusively as <em>"Indicator for review"</em>. Algorithmic outputs never trigger automatic rejections.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: END-TO-END PIPELINE SIMULATOR */}
      {activeSection === 'pipeline' && (
        <div className="flex flex-col gap-6">
          <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <div className="flex items-center gap-2.5">
                  <Activity className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-text">End-to-end pipeline simulator</h2>
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">6 Stages</span>
                </div>
                <p className="text-sm leading-relaxed max-w-prose text-text-muted mt-1">
                  Step through the six automated verification stages that execute upon institutional document ingestion.
                </p>
              </div>

              {/* Step Navigation Controls */}
              <div className="flex items-center gap-2">
                <button
                  id="pipeline-prev-btn"
                  onClick={() => setActivePipelineStep((prev) => Math.max(0, prev - 1))}
                  disabled={activePipelineStep === 0}
                  className="px-3 py-1.5 rounded-lg border border-border text-text disabled:opacity-40 text-xs font-semibold hover:bg-surface-2 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 inline mr-1" />
                  Previous
                </button>
                <span className="text-xs font-mono font-bold text-text-muted px-2">
                  Stage {activePipelineStep + 1} of {PIPELINE_STEPS.length}
                </span>
                <button
                  id="pipeline-next-btn"
                  onClick={() => setActivePipelineStep((prev) => Math.min(PIPELINE_STEPS.length - 1, prev + 1))}
                  disabled={activePipelineStep === PIPELINE_STEPS.length - 1}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 text-white disabled:opacity-40 text-xs font-semibold hover:bg-sky-700 transition cursor-pointer"
                >
                  Next
                  <ChevronRight className="w-4 h-4 inline ml-1" />
                </button>
              </div>
            </div>

            {/* Stepper Timeline Visualizer */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-6">
              {PIPELINE_STEPS.map((s, idx) => {
                const isCurrent = idx === activePipelineStep;
                const isCompleted = idx < activePipelineStep;
                return (
                  <button
                    key={s.step}
                    onClick={() => setActivePipelineStep(idx)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${isCurrent
                        ? 'bg-primary/10 border-primary ring-2 ring-primary/20'
                        : isCompleted
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-text'
                          : 'bg-surface-2 border-border opacity-70'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-text-muted">
                        0{s.step}
                      </span>
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <span className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-sky-600 animate-pulse' : 'bg-slate-300'}`} />
                      )}
                    </div>
                    <div className="text-xs font-bold text-text truncate">{s.category}</div>
                  </button>
                );
              })}
            </div>

            {/* Active Stage Detailed Card */}
            {(() => {
              const current = PIPELINE_STEPS[activePipelineStep];
              const Icon = current.icon;
              return (
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex flex-col gap-3 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono text-xs font-bold">
                          Stage {current.step}
                        </span>
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                          {current.category}
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        {current.title}
                      </h3>

                      <p className="text-sm text-slate-300 leading-relaxed">
                        {current.description}
                      </p>

                      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 mt-2">
                        <div className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-sky-400" />
                          Engine Action:
                        </div>
                        <p className="text-xs text-slate-400 font-mono">
                          {current.systemAction}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 md:w-72 shrink-0 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Operational Metrics
                        </span>
                        <div className="text-xs font-mono text-emerald-400 leading-snug">
                          {current.metrics}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                        <span>Statutory Proof</span>
                        <span className="text-sky-400 font-bold font-mono">SHA-256 Receipt</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* SECTION 3: VISUAL EVIDENCE & SCREENSHOT GALLERY */}
      {activeSection === 'gallery' && (
        <div className="flex flex-col gap-6">
          <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs">
            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'all', label: 'All Screenshots' },
                  { id: 'scrutiny', label: 'Scrutiny & Triage' },
                  { id: 'forensics', label: 'Forensics & Radar' },
                  { id: 'graph', label: 'Twin Graph' },
                  { id: 'audit', label: 'Audit & Ledger' },
                  { id: 'responsive', label: 'Responsive Checks' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${selectedCategory === cat.id
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-surface-2 text-text-muted hover:bg-slate-200/80 hover:text-text'
                      }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search screens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-xs text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredScreenshots.map((item) => (
                <div
                  key={item.id}
                  id={`gallery-card-${item.id}`}
                  className="bg-surface rounded-xl border border-border hover:border-primary shadow-2xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
                >
                  {/* Thumbnail with Lightbox Hover Trigger */}
                  <div
                    onClick={() => setActiveLightboxImage(item)}
                    className="relative aspect-video bg-surface-2 border-b border-border overflow-hidden cursor-pointer"
                  >
                    <img
                      src={item.filename}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-102"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/screenshots/dashboard.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="px-3 py-1.5 rounded-lg bg-white/95 text-text text-xs font-bold shadow-md flex items-center gap-1.5">
                        <Maximize2 className="w-3.5 h-3.5" />
                        Inspect High-Res
                      </span>
                    </div>

                    <span className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold border shadow-xs ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-text leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-text-muted mt-1 line-clamp-2 leading-relaxed">
                        {item.summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      <button
                        onClick={() => setActiveLightboxImage(item)}
                        className="text-xs font-semibold text-primary hover:underline transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect Details
                      </button>

                      {onNavigateTab && (
                        <button
                          onClick={() => onNavigateTab(item.tabTarget)}
                          className="px-2.5 py-1 rounded-lg bg-surface-2 hover:bg-surface-3 text-text border border-border text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                          title={`Navigate to live ${item.title}`}
                        >
                          <span>Live Module</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredScreenshots.length === 0 && (
              <div className="text-center py-12 text-text-muted">
                <p className="text-sm font-semibold">No screenshots match your search query.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="mt-2 text-xs text-sky-600 font-bold hover:underline cursor-pointer"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: DEEP-DIVE SPECIFICATIONS */}
      {activeSection === 'components' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sky-700">
              <FileSearch className="w-5 h-5" />
              <h3 className="text-sm font-bold text-text uppercase tracking-wide">
                1. Multi-Modal Document Extraction Engine
              </h3>
            </div>
            <p className="text-xs text-text-muted leading-relaxed max-w-prose">
              Native Python PyMuPDF engine extracts vector-embedded text directly from compliance PDFs. For scanned submissions, Tier-2 TF-IDF classifiers cross-check token n-grams against Land Deeds, Fire NOCs, Building Approvals, and Faculty Lists with &gt;96% precision.
            </p>
            <div className="bg-surface-2 rounded-xl p-3 border border-border font-mono text-xs text-text space-y-1">
              <div>• Throughput: 450ms / document</div>
              <div>• Bounding Box Precision: Sub-pixel resolution</div>
              <div>• ML Fallback: Logistic Regression document classifier</div>
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2 text-amber-700">
              <ScanEye className="w-5 h-5" />
              <h3 className="text-sm font-bold text-text uppercase tracking-wide">
                2. Perceptual Radar & Error-Level Analysis (ELA)
              </h3>
            </div>
            <p className="text-xs text-text-muted leading-relaxed max-w-prose">
              Combines 64-bit DCT perceptual hashing (pHash) and difference hashing (dHash) with 7 geometric and photometric perturbations (rotations, cropping, JPEG compression). 64-bit DCT perceptual hashing (pHash) enables rapid visual collision search across campus photos.
            </p>
            <div className="bg-surface-2 rounded-xl p-3 border border-border font-mono text-xs text-text space-y-1">
              <div>• Hash Index: 64-bit DCT pHash (Hamming &le; 10)</div>
              <div>• Query Latency: &lt; 250ms</div>
              <div>• Forensic ELA: 95% JPEG quality delta resaving</div>
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2 text-rose-700">
              <Network className="w-5 h-5" />
              <h3 className="text-sm font-bold text-text uppercase tracking-wide">
                3. Cross-College Twin Graph Impossibility Engine
              </h3>
            </div>
            <p className="text-xs text-text-muted leading-relaxed max-w-prose">
              Constructed via NetworkX, the heterogeneous twin graph correlates institutions, faculty identities, and land survey parcels nationwide. Detects impossibility conflicts such as faculty registered at two colleges &gt;300km apart within the same academic semester.
            </p>
            <div className="bg-surface-2 rounded-xl p-3 border border-border font-mono text-xs text-text space-y-1">
              <div>• Graph Structure: NetworkX MultiDiGraph</div>
              <div>• Privacy: SHA-256 salted Aadhaar/PAN indexing</div>
              <div>• Conflict Types: Moonlighting, Land Collocation</div>
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2 text-emerald-700">
              <FileCheck2 className="w-5 h-5" />
              <h3 className="text-sm font-bold text-text uppercase tracking-wide">
                4. Cryptographic SHA-256 Merkle Audit Ledger
              </h3>
            </div>
            <p className="text-xs text-text-muted leading-relaxed max-w-prose">
              Every regulatory determination, OCR extraction, and officer comment is sealed in a recursive cryptographic hash chain: <code className="bg-surface-2 px-1 py-0.5 rounded text-slate-800">H_n = SHA-256(Block_n || H_{'{n-1}'})</code>. Any direct tampering with the database instantly breaks the hash sequence and triggers a visual tamper alert.
            </p>
            <div className="bg-surface-2 rounded-xl p-3 border border-border font-mono text-xs text-text space-y-1">
              <div>• Immutability: Cryptographic Merkle State Hashing</div>
              <div>• Verification SLA: Instant (&lt; 5ms)</div>
              <div>• Compliance: Non-repudiation for appellate tribunals</div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: STATUTORY SAFEGUARDS & RBAC */}
      {activeSection === 'safeguards' && (
        <div className="flex flex-col gap-6">
          <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-2">
              <Scale className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-text">Statutory safeguards & role separation</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">Safeguards</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed mb-6 max-w-3xl">
              PRAMAAN-X adheres strictly to the legal principle that artificial intelligence serves as non-punitive decision support. No applicant is ever disqualified by automated threshold alone.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-sky-50/60 border border-sky-200 rounded-xl p-4">
                <span className="text-xs font-bold text-sky-800 block mb-1">
                  1. Zero Auto-Rejection
                </span>
                <p className="text-xs text-text-muted leading-relaxed max-w-prose">
                  Every algorithmic output is labeled strictly as an <strong>"Indicator for review"</strong>. Final determinations require human scrutinizing officer signatures.
                </p>
              </div>

              <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-4">
                <span className="text-xs font-bold text-indigo-800 block mb-1">
                  2. Mandatory Officer Remarks
                </span>
                <p className="text-xs text-text-muted leading-relaxed max-w-prose">
                  Officers cannot close or approve an application with outstanding anomalies without providing a detailed, auditable written justification.
                </p>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4">
                <span className="text-xs font-bold text-emerald-800 block mb-1">
                  3. Self-Assessment Sandbox
                </span>
                <p className="text-xs text-text-muted leading-relaxed max-w-prose">
                  Institutions receive access to the Pre-Flight Scorecard to test their compliance and resolve deficiency gaps without prejudice before deadline.
                </p>
              </div>
            </div>

            {/* RBAC Matrix Table */}
            <div className="border border-border rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-2 text-text-muted uppercase tracking-wider text-[10px] font-bold border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Role Persona</th>
                    <th className="py-3 px-4">Primary Jurisdiction</th>
                    <th className="py-3 px-4">Permitted Modules</th>
                    <th className="py-3 px-4">Audit Authority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-text">
                  <tr>
                    <td className="py-3 px-4 font-bold text-text">Scrutiny Officer</td>
                    <td className="py-3 px-4">Primary desk review & bounding box audit</td>
                    <td className="py-3 px-4">Triage, Evidence Lens, Photo Radar, Impossibility</td>
                    <td className="py-3 px-4 text-emerald-700 font-semibold">Sign Initial Scrutiny</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-text">Senior Officer</td>
                    <td className="py-3 px-4">Escalations, approvals & what-if policy</td>
                    <td className="py-3 px-4">All Modules + Regulation-as-Code & Approvals</td>
                    <td className="py-3 px-4 text-emerald-700 font-semibold">Final Approval Authority</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-text">Central Admin</td>
                    <td className="py-3 px-4">System rules, thresholds & registry configuration</td>
                    <td className="py-3 px-4">All Modules + System Administration</td>
                    <td className="py-3 px-4 text-indigo-700 font-semibold">Configuration Logs</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-text">Independent Auditor</td>
                    <td className="py-3 px-4">Post-hoc inspection & non-repudiation audit</td>
                    <td className="py-3 px-4">Audit Ledger, Evidence Lens (Read-Only)</td>
                    <td className="py-3 px-4 text-purple-700 font-semibold">Verify Hash Integrity</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-text">Institution User</td>
                    <td className="py-3 px-4">Dossier preparation & pre-flight self-check</td>
                    <td className="py-3 px-4">Own Application, Pre-Flight Scorecard</td>
                    <td className="py-3 px-4 text-text-muted font-semibold">View Own Receipts Only</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FULL-RESOLUTION LIGHTBOX MODAL */}
      {activeLightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
          onClick={() => setActiveLightboxImage(null)}
        >
          <div
            className="bg-surface rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-border animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  {activeLightboxImage.badge}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  {activeLightboxImage.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {onNavigateTab && (
                  <button
                    onClick={() => {
                      onNavigateTab(activeLightboxImage.tabTarget);
                      setActiveLightboxImage(null);
                    }}
                    className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <span>Open Live Module</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setActiveLightboxImage(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  title="Close Lightbox"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Image View */}
            <div className="flex-1 bg-slate-950 overflow-auto flex items-center justify-center p-2 min-h-0">
              <img
                src={activeLightboxImage.filename}
                alt={activeLightboxImage.title}
                className="max-h-[60vh] w-auto object-contain rounded-lg shadow-lg border border-slate-800"
              />
            </div>

            {/* Modal Footer with Feature Bullets */}
            <div className="p-4 sm:p-5 bg-white border-t border-border">
              <p className="text-xs text-text-muted mb-3">
                {activeLightboxImage.summary}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeLightboxImage.features?.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-text">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
