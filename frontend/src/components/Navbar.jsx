import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, 
  Sun, 
  Moon, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  UserCheck,
  Monitor,
  Search,
  Layers,
  SearchCode,
  FileSearch,
  BookOpenCheck,
  PlaneTakeoff,
  FileCheck2,
  Compass,
  Clock,
  LayoutDashboard,
  Network,
  ScanEye,
  Workflow
} from 'lucide-react';
import AlertBellDrawer from './AlertBellDrawer';
import ConfirmModal from './ui/ConfirmModal';
import SiteSearchModal from './ui/SiteSearchModal';
import { api } from '../services/api';

/**
 * AICTE Regulatory Emblem Shield SVG
 */
function AicteShieldLogo({ className = "w-7 h-7" }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="navShieldCobaltGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0B1B45" />
          <stop offset="50%" stopColor="#1F4BFF" />
          <stop offset="100%" stopColor="#14396B" />
        </linearGradient>
        <linearGradient id="navShieldGoldGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFC76B" />
          <stop offset="100%" stopColor="#FF9933" />
        </linearGradient>
      </defs>
      <path 
        d="M32 4L10 12V28C10 44.5 19.5 55.5 32 60C44.5 55.5 54 44.5 54 28V12L32 4Z" 
        fill="url(#navShieldCobaltGrad)" 
        stroke="#FFFFFF" 
        strokeWidth="1.5" 
      />
      <path 
        d="M32 9L15 15.5V28C15 41.5 22.5 50.5 32 54.5C41.5 50.5 49 41.5 49 28V15.5L32 9Z" 
        stroke="url(#navShieldGoldGrad)" 
        strokeWidth="1.5" 
        opacity="0.9" 
      />
      <circle cx="30" cy="30" r="10" stroke="#FFFFFF" strokeWidth="2.2" fill="none" />
      <path 
        d="M26 30L29 33L36 26" 
        stroke="#22D3EE" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <line x1="37" y1="37" x2="44" y2="44" stroke="#FF9933" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Clean 64px Command Center Header (Theme Tokens, High Readability)
 */
export default function Navbar({ 
  currentUser,
  currentRole = 'scrutiny_officer', 
  isAdmin = false,
  adminPreviewRole = null,
  onAdminSwitchRole,
  onReturnToAdmin,
  onLogout, 
  activeApplication, 
  isLiveMode = false,
  apiStatus = 'LIVE',
  apiDegradedReason = null,
  isMobileMenuOpen = false,
  onToggleMobileMenu,
  onToggleSidebarCollapse,
  isScrolled = false,
  scrollProgress = 0,
  onSelectTab,
  onNavigateTab,
  applications = [],
  onSelectApplication
}) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }
    return 'light';
  });

  const [themePref, setThemePref] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme_preference') || 'auto';
    }
    return 'auto';
  });

  const [ledgerStatus, setLedgerStatus] = useState({ intact: true, blocks: 7 });
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdvisoryDismissed, setIsAdvisoryDismissed] = useState(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem('pramaan_advisory_dismissed') === 'true';
  });

  const userMenuRef = useRef(null);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const PERMITTED_PAGES = [
    { id: 'dashboard', label: 'Dashboard', desc: 'Triage overview & metrics', category: 'Scrutiny', icon: LayoutDashboard, roles: ['scrutiny_officer', 'senior_officer', 'admin', 'auditor', 'institution_user'] },
    { id: 'evidence-lens', label: 'Evidence Lens', desc: 'Multi-modal discrepancy verification', category: 'Scrutiny', icon: SearchCode, roles: ['scrutiny_officer', 'senior_officer', 'admin', 'auditor'] },
    { id: 'manual-review-queue', label: 'Review Queue', desc: 'Manual review & officer escalations', category: 'Scrutiny', icon: Clock, roles: ['scrutiny_officer', 'senior_officer', 'admin', 'auditor'] },
    { id: 'preflight', label: 'Pre-Flight Scorecard', desc: 'Readiness & deficiency self-check', category: 'Scrutiny', icon: PlaneTakeoff, roles: ['scrutiny_officer', 'senior_officer', 'admin', 'institution_user'] },
    { id: 'document-intelligence', label: 'Doc Intelligence', desc: 'OCR & deed forensics', category: 'Intelligence', icon: FileSearch, roles: ['scrutiny_officer', 'senior_officer', 'admin', 'auditor', 'institution_user'] },
    { id: 'photo-radar', label: 'Photo Radar', desc: 'Perceptual photo hash clustering', category: 'Intelligence', icon: ScanEye, roles: ['scrutiny_officer', 'senior_officer', 'admin'] },
    { id: 'impossibility-engine', label: 'Impossibility Engine', desc: 'Faculty spatio-temporal validation', category: 'Intelligence', icon: Network, roles: ['scrutiny_officer', 'senior_officer', 'admin', 'auditor'] },
    { id: 'audit-ledger', label: 'Audit & Receipts', desc: 'Cryptographic SHA-256 action chain', category: 'Audit & Rules', icon: FileCheck2, roles: ['scrutiny_officer', 'senior_officer', 'admin', 'auditor', 'institution_user'] },
    { id: 'regulations', label: 'Rules Catalog', desc: 'APH 2025-26 rules & simulator', category: 'Audit & Rules', icon: BookOpenCheck, roles: ['senior_officer', 'admin'] },
    { id: 'inspection-planner', label: 'Inspection Planner', desc: 'Surprise inspection itinerary optimization', category: 'Planning', icon: Compass, roles: ['scrutiny_officer', 'senior_officer', 'admin'] },
    { id: 'system-architecture', label: 'System Architecture', desc: 'Interactive spec & blueprint', category: 'Showcase', icon: Workflow, roles: ['scrutiny_officer', 'senior_officer', 'admin', 'auditor', 'institution_user'] },
  ];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter permitted pages and loaded applications
  const q = searchQuery.trim().toLowerCase();
  const allowedPages = PERMITTED_PAGES.filter(p => p.roles.includes(currentRole));
  const matchingPages = allowedPages.filter(p => 
    !q || p.label.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
  );

  const matchingApps = (applications || []).filter(a =>
    q && (
      (a.institution_name && a.institution_name.toLowerCase().includes(q)) ||
      (a.application_no && a.application_no.toLowerCase().includes(q)) ||
      (a.state && a.state.toLowerCase().includes(q)) ||
      (a.category && a.category.toLowerCase().includes(q))
    )
  ).slice(0, 5);

  const combinedResults = [
    ...matchingPages.map(p => ({
      uniqueId: `page-${p.id}`,
      type: 'page',
      id: p.id,
      title: p.label,
      subtitle: p.desc,
      badge: p.category,
      icon: p.icon
    })),
    ...matchingApps.map(a => ({
      uniqueId: `app-${a.id}`,
      type: 'app',
      rawApp: a,
      title: a.institution_name,
      subtitle: `${a.application_no} • ${a.state || 'Karnataka'}`,
      badge: a.category || 'Triage Dossier',
      icon: SearchCode
    }))
  ];

  const handleSelectItem = (item) => {
    setIsDropdownOpen(false);
    setSearchQuery('');
    if (item.type === 'page') {
      (onSelectTab || onNavigateTab)?.(item.id);
    } else if (item.type === 'app') {
      onSelectApplication?.(item.rawApp);
      (onSelectTab || onNavigateTab)?.('evidence-lens');
    }
  };

  const handleSearchKeyDown = (e) => {
    if (!isDropdownOpen || combinedResults.length === 0) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsDropdownOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % combinedResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + combinedResults.length) % combinedResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (combinedResults[selectedIndex]) {
        handleSelectItem(combinedResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsDropdownOpen(false);
      searchInputRef.current?.blur();
    }
  };

  // Global Ctrl/Cmd + K shortcut for Quick Search input & palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (typeof window !== 'undefined' && window.innerWidth >= 1024 && searchInputRef.current) {
          searchInputRef.current.focus();
          setIsDropdownOpen(true);
        } else {
          setIsSearchOpen(prev => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const applyTheme = (targetTheme) => {
    setTheme(targetTheme);
    document.documentElement.setAttribute('data-theme', targetTheme);
    if (targetTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', targetTheme);
      localStorage.setItem('pramaan_theme', targetTheme);
    } catch (_e) {}
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: targetTheme } }));
  };

  useEffect(() => {
    const activeTheme = document.documentElement.getAttribute('data-theme') || localStorage.getItem('theme') || 'light';
    applyTheme(activeTheme);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const checkLedger = async () => {
      try {
        const res = await api.verifyAuditChain(activeApplication?.id || 1);
        if (isMounted && res) {
          setLedgerStatus({
            intact: res.is_intact ?? res.is_valid ?? true,
            blocks: res.chain_length ?? res.total_receipts ?? 7
          });
        }
      } catch (_err) {}
    };
    checkLedger();
    const interval = setInterval(checkLedger, 8000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [activeApplication?.id]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    setThemePref(nextTheme);
    localStorage.setItem('theme_preference', nextTheme);
  };

  const handleSelectThemeMode = (mode) => {
    setThemePref(mode);
    localStorage.setItem('theme_preference', mode);
    if (mode === 'system') {
      const isSystemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(isSystemDark ? 'dark' : 'light');
    } else {
      applyTheme(mode);
    }
  };

  const handleDismissAdvisory = () => {
    setIsAdvisoryDismissed(true);
    try {
      sessionStorage.setItem('pramaan_advisory_dismissed', 'true');
    } catch (_e) {}
  };

  const roleLabels = {
    scrutiny_officer: 'Scrutiny Officer',
    senior_officer: 'Regional Officer',
    admin: 'Central Admin',
    auditor: 'Auditor (Read-Only)',
    institution_user: 'Institution User'
  };

  const roleColors = {
    scrutiny_officer: 'bg-surface-2 text-text border-border',
    senior_officer: 'bg-surface-2 text-text border-border',
    admin: 'bg-surface-2 text-text border-border',
    auditor: 'bg-surface-2 text-text border-border',
    institution_user: 'bg-surface-2 text-text border-border'
  };

  const roleName = roleLabels[currentRole] || currentRole;
  const rawName = typeof currentUser?.full_name === 'object' && currentUser?.full_name !== null
    ? (currentUser.full_name.en || Object.values(currentUser.full_name)[0] || '')
    : (currentUser?.full_name || '');
  const isNameMissing = !rawName || rawName.trim().length === 0 || rawName.trim().toLowerCase() === roleName.toLowerCase();
  const userName = isNameMissing 
    ? (currentRole === 'institution_user' ? 'Apex Institute of Technology' : roleName)
    : rawName.trim();
  const showSubRole = !isNameMissing && userName.toLowerCase() !== roleName.toLowerCase();

  const userInitial = typeof userName === 'string' && userName.trim().length > 0
    ? userName.trim().charAt(0).toUpperCase()
    : 'U';

  return (
    <>
      {/* 3px National Tricolour Accent Stripe (Static, Full Width) */}
      <div className="h-[3px] w-full shrink-0 grid grid-cols-3 z-50 relative select-none" aria-hidden="true">
        <div className="bg-[#FF9933] h-full" />
        <div className="bg-[#FFFFFF] h-full" />
        <div className="bg-[#138808] h-full" />
      </div>

      {/* Dynamic Glass / Sticky Header (64px shrinks to 56px when scrolled) */}
      <header 
        id="app-header-bar"
        className={`sticky top-0 z-40 shrink-0 select-none border-b border-border text-text transition-all duration-200 ${
          isScrolled 
            ? 'h-14 glass-surface shadow-md border-border/80' 
            : 'h-14 sm:h-16 bg-header-bg shadow-xs border-border'
        } pt-[env(safe-area-inset-top)]`}
      >
        {/* 2px Cobalt Scroll Progress Line */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary origin-left pointer-events-none transition-transform duration-75 z-50"
          style={{ transform: `scaleX(${scrollProgress})` }}
          aria-hidden="true"
        />
        <div className="h-full px-2 sm:px-4 lg:px-6 flex items-center justify-between gap-1 sm:gap-2.5">
          
          {/* LEFT: Single Hamburger Toggle + PRAMAAN-X Wordmark + AICTE EoA Chip */}
          <div className="flex items-center space-x-1 sm:space-x-2 min-w-0 shrink-0">
            {/* Single Toggle Button for Desktop Rail & Mobile Drawer */}
            <button
              type="button"
              id="sidebar-toggle-btn"
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
                  onToggleSidebarCollapse && onToggleSidebarCollapse();
                } else {
                  onToggleMobileMenu && onToggleMobileMenu();
                }
              }}
              aria-label="Toggle navigation sidebar"
              aria-expanded={isMobileMenuOpen}
              aria-controls="sidebar-nav"
              title="Toggle sidebar"
              className="btn-icon w-11 h-11 min-w-[44px] min-h-[44px] sm:w-10 sm:h-10 sm:min-w-[40px] sm:min-h-[40px] rounded-lg text-text-muted hover:text-text hover:bg-surface-2 transition-colors flex items-center justify-center cursor-pointer flex-none shrink-0 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Menu className="w-5 h-5 shrink-0" />
            </button>

            {/* Logo Emblem & Brand Wordmark */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
              <div className="w-8 h-8 p-1 rounded-lg bg-surface-2 border border-border flex items-center justify-center shadow-xs flex-none shrink-0">
                <AicteShieldLogo className="w-6 h-6 shrink-0" />
              </div>

              <div className="flex items-center space-x-2 min-w-0">
                <div id="header-wordmark" className="flex items-baseline tracking-tight font-black font-sans text-base sm:text-lg lg:text-xl shrink-0 whitespace-nowrap min-w-0">
                  <span className="text-[#0B3D91] dark:text-white font-black tracking-tight">PRAMAAN</span>
                  <span className="text-[#FF9933] font-black ml-0.5">
                    -X
                  </span>
                </div>
                
                {/* AICTE EoA Chip: hidden on phones */}
                <span 
                  className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-surface-2 text-text-muted border border-border shadow-xs shrink-0 whitespace-nowrap"
                  title="Approval Process Handbook (APH 2025-26) Regulatory Scrutiny"
                >
                  AICTE EoA
                </span>
              </div>
            </div>

            {/* Admin Viewing As Chip */}
            {adminPreviewRole && (
              <div className="hidden xl:flex items-center space-x-2 px-3 py-1 rounded-full bg-surface-2 border border-border text-text text-xs font-medium shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Viewing as <strong className="text-text capitalize">{adminPreviewRole.replace('_', ' ')}</strong></span>
                <button
                  type="button"
                  id="return-to-admin-btn"
                  onClick={onReturnToAdmin}
                  className="ml-1 px-2.5 py-0.5 rounded-md bg-surface border border-border hover:bg-surface-2 text-text text-[11px] font-semibold cursor-pointer transition-colors"
                  title="Return to your Central Admin session"
                >
                  Return to Admin
                </button>
              </div>
            )}
          </div>

          {/* Spacer on mobile/tablet when desktop search is hidden */}
          <div className="flex-1 lg:hidden min-w-[2px]" />

          {/* CENTER: Enlarged Quick-Search Bar (h-10, full width 280-440px, clear Ctrl+K button) */}
          <div className="relative flex-1 min-w-[280px] max-w-[440px] mx-2 hidden lg:flex items-center" ref={searchContainerRef}>
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                  setSelectedIndex(0);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search pages, applications..."
                className="w-full h-10 pl-10 pr-24 text-xs font-medium rounded-xl bg-surface-2 border border-border text-text placeholder:text-text-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus:bg-surface transition-all shadow-xs"
                aria-label="Search pages and applications"
                id="header-quick-search-input"
              />
              <button
                type="button"
                onClick={() => {
                  if (searchInputRef.current) {
                    searchInputRef.current.focus();
                    setIsDropdownOpen(true);
                  }
                }}
                className="p-0 px-2.5 py-1 absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center space-x-1 rounded-lg text-xs font-mono font-medium text-text-subtle bg-surface border border-border hover:bg-surface-2 hover:text-text shadow-2xs transition-colors cursor-pointer"
                title="Press Ctrl+K to search"
                aria-label="Search keyboard shortcut Ctrl+K"
              >
                <span className="text-[10px] opacity-70">⌘</span>
                <span>Ctrl K</span>
              </button>
            </div>

            {/* Solid Results Dropdown */}
            {isDropdownOpen && (
              <div 
                id="header-search-dropdown"
                className="absolute top-full left-0 mt-1.5 w-full min-w-[320px] max-w-[420px] bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden py-1 max-h-[380px] overflow-y-auto"
                role="listbox"
              >
                {combinedResults.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-text-muted text-center">
                    No matching pages or applications found for &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  combinedResults.map((item, idx) => {
                    const isSelected = selectedIndex === idx;
                    const ItemIcon = item.icon;
                    return (
                      <div
                        key={item.uniqueId}
                        onClick={() => handleSelectItem(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`px-3 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary text-white font-medium' : 'text-text hover:bg-surface-2'
                        }`}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                          <div className={`p-1.5 rounded-lg border ${
                            isSelected 
                              ? 'bg-white/20 border-white/30 text-white' 
                              : item.type === 'page'
                              ? 'bg-surface-2 border-border text-primary'
                              : 'bg-rose-100 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900 text-rose-600'
                          }`}>
                            <ItemIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold truncate">{item.title}</div>
                            <div className={`text-[10px] truncate ${
                              isSelected ? 'text-white/80' : 'text-text-muted'
                            }`}>
                              {item.subtitle}
                            </div>
                          </div>
                        </div>
                        <span className={`text-[10px] font-mono shrink-0 px-1.5 py-0.5 rounded border ${
                          isSelected ? 'bg-white/20 border-white/30 text-white' : 'bg-surface-2 border-border text-text-subtle'
                        }`}>
                          {item.badge}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Compact Status Pill + Bell + Theme Toggle + User Menu */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            
            {/* System Architecture Quick Link */}
            {(onSelectTab || onNavigateTab) && (
              <button
                type="button"
                onClick={() => (onSelectTab || onNavigateTab)('system-architecture')}
                id="header-architecture-btn"
                className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-surface-2 hover:bg-surface text-text text-xs font-medium transition cursor-pointer shadow-xs"
                title="Open System Architecture & Evidence Showcase"
              >
                <Layers className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="hidden 2xl:inline">Architecture</span>
              </button>
            )}

            {/* Status Pill: hidden on phones, dots-only on tablet (640-1023px), full on desktop (>=1024px) */}
            <div id="header-status-pill" className="hidden sm:flex items-center space-x-2 sm:px-2 md:px-3 py-1.5 rounded-full border border-border bg-surface-2 text-xs font-medium text-text-muted shadow-xs">
              <div 
                className="flex items-center space-x-1.5 cursor-help"
                title={
                  apiStatus === 'LIVE'
                    ? "Backend operational: all systems connected (DB & Statutory Gateway)"
                    : apiStatus === 'DEGRADED'
                    ? `Degraded: ${apiDegradedReason || 'Statutory verification gateway unavailable'}`
                    : "Backend not connected: showing demo data"
                }
                aria-label={
                  apiStatus === 'LIVE'
                    ? "Backend operational: all systems connected (DB & Statutory Gateway)"
                    : apiStatus === 'DEGRADED'
                    ? `Degraded: ${apiDegradedReason || 'Statutory verification gateway unavailable'}`
                    : "Backend not connected: showing demo data"
                }
              >
                <span 
                  className={`w-2 h-2 rounded-full ${
                    apiStatus === 'LIVE'
                      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                      : apiStatus === 'DEGRADED'
                      ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                      : 'bg-slate-400'
                  }`} 
                />
                <span className="hidden md:inline text-[11px] font-semibold text-text">
                  {apiStatus === 'LIVE' ? 'API Live' : apiStatus === 'DEGRADED' ? 'Degraded' : 'Demo API'}
                </span>
              </div>

              <span className="w-px h-3 bg-border" />

              <div className="flex items-center space-x-1.5">
                <span 
                  className={`w-2 h-2 rounded-full ${
                    ledgerStatus.intact ? 'bg-emerald-500' : 'bg-rose-500'
                  }`} 
                />
                <span className="hidden md:inline text-[11px] font-semibold text-text">
                  {ledgerStatus.intact ? 'Ledger Intact' : 'Ledger Flagged'}
                </span>
              </div>
            </div>

            {/* Operational Alert Bell with Drawer */}
            <AlertBellDrawer currentRole={currentRole} />

            {/* Quick Site Search Button (44px on phone, 40px on tablet/desktop) */}
            <button
              type="button"
              id="site-search-btn"
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth >= 1024 && searchInputRef.current) {
                  searchInputRef.current.focus();
                  setIsDropdownOpen(true);
                } else {
                  setIsSearchOpen(true);
                }
              }}
              aria-label="Search navigation modules (Ctrl+K)"
              title="Search modules and applications (Ctrl+K)"
              className="btn-icon w-11 h-11 min-w-[44px] min-h-[44px] sm:w-10 sm:h-10 sm:min-w-[40px] sm:min-h-[40px] rounded-xl border border-border bg-surface-2 hover:bg-surface text-text flex lg:hidden items-center justify-center transition-all cursor-pointer flex-none shrink-0 shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Search className="w-5 h-5 text-text-muted hover:text-primary transition-colors shrink-0" />
            </button>

            {/* Compact 44px Icon Theme Toggle on Phone, 36px on Tablet/Desktop */}
            <button
              type="button"
              id="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label="Switch theme"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="btn-icon w-11 h-11 min-w-[44px] min-h-[44px] sm:w-9 sm:h-9 sm:min-w-[36px] sm:min-h-[36px] rounded-lg border border-border bg-surface-2 hover:bg-surface text-text flex items-center justify-center transition-colors cursor-pointer flex-none shrink-0 shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-accent relative overflow-hidden group"
            >
              <div className="relative w-[18px] h-[18px] flex items-center justify-center">
                <Sun 
                  className={`w-[18px] h-[18px] text-[#FBBF24] absolute transition-all duration-300 ease-out ${
                    theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-50 opacity-0 pointer-events-none'
                  }`} 
                  id="theme-toggle-light" 
                />
                <Moon 
                  className={`w-[18px] h-[18px] text-text absolute transition-all duration-300 ease-out ${
                    theme === 'light' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0 pointer-events-none'
                  }`} 
                  id="theme-toggle-dark" 
                />
              </div>
            </button>

            {/* Direct Header Sign-Out Button (Hidden below 1280px) */}
            {onLogout && (
              <button
                type="button"
                id="header-signout-btn"
                onClick={() => setShowLogoutConfirm(true)}
                title="Sign Out"
                aria-label="Sign Out"
                className="hidden xl:flex h-9 px-2.5 rounded-lg border border-border bg-surface-2 hover:bg-danger/10 hover:border-danger/30 text-danger items-center space-x-1.5 transition-colors cursor-pointer shrink-0 shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-danger"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="text-xs font-semibold">Sign Out</span>
              </button>
            )}

            {/* USER MENU (Solid Surface, High Contrast) */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                id="user-menu-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-10 h-10 min-w-[40px] min-h-[40px] sm:w-auto sm:h-auto flex items-center justify-center sm:space-x-2 p-1 sm:pl-2 sm:pr-2.5 sm:py-1.5 rounded-lg border border-border bg-surface-2 hover:bg-surface transition-all cursor-pointer shadow-xs group flex-none shrink-0"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
                aria-label="User profile and menu"
              >
                <div className="w-7 h-7 rounded-md bg-primary text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {userInitial}
                </div>

                <div className="text-left hidden md:flex flex-col items-start min-w-0 max-w-[160px]">
                  <span className="text-xs font-bold text-text leading-tight truncate w-full">
                    {userName}
                  </span>
                  {showSubRole && (
                    <span className="text-[10px] font-medium text-text-muted truncate max-w-full leading-none mt-0.5">
                      {roleName}
                    </span>
                  )}
                </div>

                <ChevronDown className={`hidden md:block w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${
                  isUserMenuOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {/* User Dropdown Menu: Solid Surface, Right Aligned, High Z-Index */}
              {isUserMenuOpen && (
                <div 
                  id="user-menu-dropdown"
                  className="fixed sm:absolute right-3 sm:right-0 top-16 sm:top-full mt-1.5 w-[calc(100vw-24px)] sm:w-[280px] max-w-[340px] rounded-xl border border-border bg-surface p-2 shadow-2xl z-50 animate-fadeIn text-xs text-text space-y-2 max-h-[85dvh] overflow-y-auto"
                  role="menu"
                  aria-orientation="vertical"
                >
                  {/* User Profile Header */}
                  <div className="p-3 bg-surface-2 rounded-lg border border-border space-y-1">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-text-subtle">
                      Signed In As
                    </div>
                    <div className="font-bold text-text truncate text-sm sm:text-xs">
                      {userName}
                    </div>
                    <div className="text-xs sm:text-[11px] text-text-muted font-mono truncate">
                      {currentUser?.email || 'scrutiny.officer@aicte-india.org'}
                    </div>
                    <div className="pt-1 flex items-center gap-2">
                      <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full border border-border bg-surface text-text-muted">
                        {roleLabels[currentRole] || currentRole}
                      </span>
                    </div>
                  </div>

                  {/* Compact Status Rows on Mobile (Hidden on Tablet & Desktop) */}
                  <div className="sm:hidden p-2.5 bg-surface-2 rounded-lg border border-border space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${apiStatus === 'LIVE' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span>API Status</span>
                      </div>
                      <span className="text-text-muted font-mono text-[11px]">
                        {apiStatus === 'LIVE' ? 'Live Gateway' : 'Demo API'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${ledgerStatus.intact ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>Audit Ledger</span>
                      </div>
                      <span className="text-text-muted font-mono text-[11px]">
                        {ledgerStatus.intact ? 'Intact (Verified)' : 'Flagged'}
                      </span>
                    </div>
                  </div>

                  {/* Architecture Link Item on Mobile / Tablet */}
                  {(onSelectTab || onNavigateTab) && (
                    <button
                      type="button"
                      id="user-menu-architecture-btn"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        (onSelectTab || onNavigateTab)('system-architecture');
                      }}
                      className="w-full flex xl:hidden items-center justify-between px-3 py-2 rounded-lg text-text hover:bg-surface-2 border border-border transition-colors cursor-pointer min-h-[44px]"
                    >
                      <div className="flex items-center space-x-2">
                        <Layers className="w-4 h-4 text-primary shrink-0" />
                        <span className="font-semibold text-xs">System Architecture</span>
                      </div>
                      <span className="text-[10px] font-mono text-text-muted">Interactive</span>
                    </button>
                  )}

                  {/* Theme Option Row */}
                  <div className="p-2 border-t border-border">
                    <div className="text-[10px] font-bold text-text-subtle uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Interface Theme</span>
                      <span className="text-primary font-mono capitalize">{theme}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'light', label: 'Light', icon: Sun },
                        { id: 'dark', label: 'Dark', icon: Moon },
                        { id: 'system', label: 'System', icon: Monitor }
                      ].map((tOpt) => {
                        const Icon = tOpt.icon;
                        const isSelected = themePref === tOpt.id;
                        return (
                          <button
                            key={tOpt.id}
                            type="button"
                            onClick={() => handleSelectThemeMode(tOpt.id)}
                            className={`py-1.5 min-h-[36px] rounded-lg text-xs font-semibold capitalize border flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-primary text-white border-primary shadow-xs'
                                : 'bg-surface-2 text-text-muted hover:text-text border-border'
                            }`}
                          >
                            <Icon className="w-3 h-3" />
                            <span>{tOpt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Switch Demo Role: Visible ONLY when logged-in role is admin */}
                  {isAdmin && onAdminSwitchRole && (
                    <div className="p-2 space-y-1 border-t border-border">
                      <label htmlFor="user-menu-role-select" className="text-[10px] font-bold text-text-subtle uppercase tracking-wider flex items-center space-x-1">
                        <UserCheck className="w-3 h-3 text-primary" />
                        <span>Switch Demo Role (Admin Only)</span>
                      </label>
                      <select
                        id="user-menu-role-select"
                        value={adminPreviewRole || 'admin'}
                        onChange={(e) => {
                          onAdminSwitchRole(e.target.value);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full bg-surface-2 border border-border rounded-lg px-2 py-2 text-xs text-text font-medium outline-none cursor-pointer min-h-[40px]"
                      >
                        <option value="admin">Central Admin</option>
                        <option value="scrutiny_officer">Scrutiny Officer</option>
                        <option value="senior_officer">Regional Officer</option>
                        <option value="auditor">Independent Auditor</option>
                        <option value="institution_user">Institution User</option>
                      </select>
                    </div>
                  )}

                  {/* Sign Out Action: Full Width, 44px, Danger-tinted */}
                  {onLogout && (
                    <div className="border-t border-border pt-1">
                      <button
                        type="button"
                        id="user-menu-signout-btn"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full h-11 min-h-[44px] flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-danger hover:bg-danger/10 border border-danger/25 transition-colors font-semibold cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-danger" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Reusable Accessible Confirmation Modal for Sign Out */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          onLogout && onLogout();
        }}
        title="Sign Out of PRAMAAN-X"
        description="Are you sure you wish to end your active AICTE scrutiny session? Any unsaved edits will be discarded."
        confirmText="Sign Out"
        variant="danger"
      />

      {/* Accessible Command Palette Site Search (Ctrl+K) */}
      <SiteSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTab={onSelectTab}
        currentRole={currentRole}
      />

      {/* Single Line Advisory Notice (Clean, No Highlighter) */}
      {!isAdvisoryDismissed && (
        <div 
          role="status"
          className="h-9 sm:h-7 shrink-0 bg-surface-2 border-b border-border px-3 sm:px-6 flex items-center justify-between text-[13px] sm:text-xs font-medium text-text-muted z-30 transition-all select-none"
        >
          <div className="flex items-center space-x-2 min-w-0">
            <AlertTriangle className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-amber-500 shrink-0" />
            <span className="text-text font-normal truncate">Advisory only. No auto-rejection.</span>
          </div>

          <button
            type="button"
            onClick={handleDismissAdvisory}
            className="w-11 h-9 sm:w-6 sm:h-6 flex items-center justify-center text-text-muted hover:text-text cursor-pointer shrink-0"
            aria-label="Dismiss advisory note"
          >
            <X className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      )}
    </>
  );
}
