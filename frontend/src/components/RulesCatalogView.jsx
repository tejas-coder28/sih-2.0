import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpenCheck, 
  Search, 
  Scale, 
  Sliders, 
  AlertTriangle, 
  ChevronRight, 
  ChevronDown, 
  Copy, 
  Check, 
  RefreshCw, 
  Info
} from 'lucide-react';
import DemoDataBadge from './DemoDataBadge';
import CopyButton from './ui/CopyButton';
import { FALLBACK_APH_RULES } from '../data/mockRulesCatalog';
import { api } from '../services/api';

/**
 * AICTE Approval Process Handbook (APH) Rules Catalog:
 * - Formatted clause-citation format: [AICTE APH 2025-26 Clause X.X.X]
 * - Category filters (Faculty & Cadre, Infrastructure, Land & Title, Safety & Compliance, Governance & Quality)
 * - Search by clause citation, title, or rule code
 * - Expanded detail drawer with exact parameter thresholds and failure message template
 * - "Simulate in What-If" action button
 */
export default function RulesCatalogView({ onSelectForSimulation }) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemoData, setIsDemoData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [expandedRuleId, setExpandedRuleId] = useState(null);

  // Load rules from backend API with authoritative fallback
  const fetchRules = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getRules();
      if (Array.isArray(data) && data.length > 0) {
        setRules(data);
        setIsDemoData(false);
      } else {
        throw new Error('Empty rules catalog');
      }
    } catch (err) {
      console.warn('Backend rules API offline, falling back to authoritative APH baseline:', err);
      setRules(FALLBACK_APH_RULES);
      setError('Live regulations catalog temporarily offline. Displaying authoritative APH 2025-26 baseline.');
      setIsDemoData(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  // Standardize clause citation format with defensive null guards
  const formatClauseCitation = (rule) => {
    if (!rule) return 'AICTE APH 2025-26 Standard Clause';
    const rawClause = rule.clause_id || rule.clause_ref || rule.rule_code || 'APH-2025-Cl-Norm';
    const cleanClause = String(rawClause)
      .replace(/^APH-2025-Cl-/, '')
      .replace(/^APH\s*2025-26\s*Clause\s*/i, '')
      .replace(/^APH-CH\d+-Clause-/, '')
      .replace(/^RULE_/, '');
    return `AICTE APH 2025-26 Clause ${cleanClause}`;
  };

  // Safe rules list guaranteed to be an array
  const safeRules = Array.isArray(rules) && rules.length > 0 ? rules : (loading ? [] : FALLBACK_APH_RULES);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set();
    safeRules.forEach((r) => r?.category && set.add(r.category));
    return ['ALL', ...Array.from(set)];
  }, [safeRules]);

  // Filtered rules with safe access
  const filteredRules = useMemo(() => {
    return safeRules.filter((r) => {
      if (!r) return false;
      const citation = formatClauseCitation(r).toLowerCase();
      const title = String(r.title || '').toLowerCase();
      const code = String(r.rule_code || r.id || '').toLowerCase();
      const desc = String(r.description || '').toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch = !q || citation.includes(q) || title.includes(q) || code.includes(q) || desc.includes(q);
      const matchesCategory = selectedCategory === 'ALL' || r.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [safeRules, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Statutory Guidance Banner */}
      <div className="bg-surface rounded-xl border border-border p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
              <BookOpenCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-text tracking-tight">AICTE Handbook Rules Catalog</h2>
                {isDemoData && <DemoDataBadge reason="Handbook Baseline Fallback" />}
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Official AICTE Approval Process Handbook (APH) 2025-26 statutory codification with formal clause citations and automated evaluation constraints.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-purple-700 dark:text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/20 self-start md:self-auto">
          <span>Edition: <strong>AICTE APH 2025-26</strong></span>
          <span>•</span>
          <span>Version: <strong>v2.0.0</strong></span>
        </div>
      </div>

      {/* Statutory Section 6 Caveat */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 flex items-start space-x-3 text-xs text-text">
        <Info className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Mandatory Statutory Protocol:</strong> Rule evaluations in PRAMAAN-X serve as 
          <em> "Indicators for review"</em>. Non-compliance findings cite the exact handbook clause to ensure full legal defensibility during scrutiny committee inquiry. Automated rejections are strictly prohibited.
        </div>
      </div>

      {error && isDemoData && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchRules}
            className="text-[11px] font-semibold underline hover:no-underline text-amber-900 dark:text-amber-200 cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* 2. Search & Category Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search clause citation (e.g. Clause 4.1), title, or rule code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 bg-surface border border-border rounded-xl pl-10 pr-4 text-xs text-text placeholder-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5" role="tablist">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-2xs font-bold'
                  : 'bg-surface-2 text-text hover:bg-surface border border-border'
              }`}
            >
              {cat === 'ALL' ? 'All Regulations' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Rules Catalog List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-surface border border-border rounded-xl p-16 text-center text-text-muted space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-600" />
            <p className="text-sm font-semibold text-text-muted">Loading statutory rule definitions...</p>
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-12 text-center text-text-muted space-y-2">
            <BookOpenCheck className="w-10 h-10 mx-auto text-text-muted opacity-40" />
            <p className="text-sm font-bold text-text">No regulations match your query</p>
            <p className="text-xs text-text-muted">Try adjusting the search keyword or category filter.</p>
          </div>
        ) : (
          filteredRules.map((rule, idx) => {
            const citation = formatClauseCitation(rule);
            const isExpanded = expandedRuleId === (rule.id || idx);
            const version = rule.current_version || {};
            const params = version.parameters || rule.parameters || {};
            const severityUpper = String(rule.severity || 'CRITICAL').toUpperCase();

            return (
              <div
                key={rule.id || idx}
                id={`rule-card-${rule.id || idx}`}
                className="bg-surface border border-border rounded-xl p-5 shadow-xs hover:border-purple-300 dark:hover:border-purple-800 transition-all space-y-3"
              >
                {/* Rule Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Official Clause Citation Badge */}
                    <CopyButton
                      text={citation}
                      title="Click to copy statutory citation"
                      showLabel={false}
                      className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 cursor-pointer transition-colors"
                    >
                      {(copied) => (
                        <>
                          <Scale className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                          <span>[{citation}]</span>
                          {copied ? (
                            <Check className="w-3 h-3 text-emerald-600 shrink-0 ml-1" />
                          ) : (
                            <Copy className="w-3 h-3 text-purple-500 shrink-0 ml-1" />
                          )}
                        </>
                      )}
                    </CopyButton>

                    <span className="text-[10px] font-mono text-text-muted bg-surface-2 px-2 py-0.5 rounded border border-border">
                      {rule.rule_code || rule.id}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      severityUpper === 'CRITICAL'
                        ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                    }`}>
                      {severityUpper}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-text-muted">
                    <span className="font-semibold text-text">{rule.category || 'General'}</span>
                    <span>•</span>
                    <span className="font-mono text-[11px] bg-surface-2 px-1.5 py-0.5 rounded text-text-muted border border-border">
                      v{version.version_number || rule.version || '1.0.0'}
                    </span>
                  </div>
                </div>

                {/* Rule Body */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  <div className="lg:col-span-8 space-y-2">
                    <h3 className="text-sm font-bold text-text leading-snug">
                      {rule.title}
                    </h3>
                    <p className="text-xs text-text-muted leading-relaxed">
                      {rule.description}
                    </p>
                  </div>

                  {/* Quick Parameters Summary (4 cols) */}
                  <div className="lg:col-span-4 bg-surface-2 border border-border/80 rounded-xl p-3 text-xs space-y-1.5">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Statutory Parameters</span>
                    <div className="space-y-1 font-mono text-[11px] text-text-muted">
                      {Object.keys(params).length > 0 ? (
                        Object.entries(params).slice(0, 3).map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <span className="text-text-muted truncate max-w-[120px]">{k}:</span>
                            <span className="font-bold text-text truncate max-w-[140px]">{JSON.stringify(v)}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-[11px] text-text-muted">Standard regulatory threshold</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="pt-3 border-t border-border space-y-3 text-xs">
                    {/* Failure Template Box */}
                    {(version.failure_message_template || rule.message_template) && (
                      <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5 space-y-1 text-text">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 flex items-center space-x-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                          <span>Statutory Non-Compliance Output Template</span>
                        </div>
                        <p className="text-xs font-mono leading-relaxed text-rose-900 dark:text-rose-200">
                          {version.failure_message_template || rule.message_template}
                        </p>
                      </div>
                    )}

                    {/* Condition & Technical Expression */}
                    <div className="bg-slate-900 text-slate-100 rounded-xl p-3.5 font-mono text-[11px] space-y-2">
                      <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-1.5 text-[10px]">
                        <span>Handbook Edition: {version.handbook_edition || 'AICTE APH 2025-26'}</span>
                        <span>Evaluation Mode: Deterministic Rules Engine</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Full Parameter Dictionary:</span>
                        <pre className="text-emerald-400 overflow-x-auto text-[10px] mt-1 whitespace-pre-wrap">
                          {JSON.stringify(params, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setExpandedRuleId(isExpanded ? null : (rule.id || idx))}
                    className="text-xs font-semibold text-purple-700 dark:text-purple-300 hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <span>{isExpanded ? 'Hide Statutory Details' : 'Inspect Citation & Parameters'}</span>
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>

                  {onSelectForSimulation && (
                    <button
                      type="button"
                      id={`simulate-btn-${rule.id || idx}`}
                      onClick={() => onSelectForSimulation(rule)}
                      className="px-3 py-1.5 bg-primary text-white hover:bg-primary-hover rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Simulate in What-If</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
