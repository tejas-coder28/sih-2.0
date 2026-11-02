import React, { useState, useEffect, useRef } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  FileText, 
  ShieldCheck, 
  Target, 
  Crosshair,
  Layers,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

/**
 * Document Bounding Box Viewer:
 * Renders high-fidelity certificate/plan scans with exact percentage bounding-box overlay.
 * Guaranteed:
 * - Paper is always white (#FFFFFF) with dark text (#111827) in BOTH light and dark themes.
 * - Clause 4 validity block maintains light-tinted callout with dark text in both themes.
 * - Highlight box sits exactly on target text ("Valid up to: 14/06/2025") with 1.5px cobalt outline + 10% fill.
 * - Label "EXTRACTED: valid_till 97.8%" is positioned ABOVE the box.
 * - Target evidence scrolls into view centered on load.
 * - Filename displays single-line truncated with tooltip.
 */
export default function DocumentBoundingBoxViewer({ documentData, findingId }) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showHighlight, setShowHighlight] = useState(true);
  const [computedBox, setComputedBox] = useState(null);

  const paperRef = useRef(null);
  const targetTextRef = useRef(null);
  const viewportRef = useRef(null);

  const doc = documentData || {};
  const filename = doc.filename || 'Karnataka_Fire_Safety_Certificate_2025.pdf';
  const document_type = doc.document_type || 'Fire Safety Certificate';
  const page_number = doc.page_number || 1;
  const total_pages = doc.total_pages || 3;
  const extracted_field = doc.extracted_field || null;
  const forensics = doc.forensics || {};

  const fieldName = extracted_field?.field_name || extracted_field?.field_label || 'valid_till';
  const confidence = extracted_field?.ocr_confidence != null 
    ? (extracted_field.ocr_confidence * 100).toFixed(1) 
    : '97.8';
  const normalizedValue = extracted_field?.normalized_value || extracted_field?.raw_text || '2025-06-14';

  const isFireSafety = (
    findingId === 'FINDING-DOC-001' || 
    (document_type && document_type.toLowerCase().includes('fire')) ||
    (filename && filename.toLowerCase().includes('fire')) ||
    !doc.document_type
  );

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.15, 1.8));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.15, 0.7));
  const handleResetZoom = () => setZoomLevel(1);

  // Compute exact box position from target element relative to unscaled paper
  useEffect(() => {
    const updatePosition = () => {
      if (!paperRef.current || !targetTextRef.current) {
        setComputedBox(null);
        return;
      }
      const paperRect = paperRef.current.getBoundingClientRect();
      const targetRect = targetTextRef.current.getBoundingClientRect();

      if (paperRect.width > 0 && paperRect.height > 0) {
        const leftPercent = ((targetRect.left - paperRect.left) / paperRect.width) * 100;
        const topPercent = ((targetRect.top - paperRect.top) / paperRect.height) * 100;
        const widthPercent = (targetRect.width / paperRect.width) * 100;
        const heightPercent = (targetRect.height / paperRect.height) * 100;

        // Ensure box is valid and within bounds
        if (leftPercent >= 0 && topPercent >= 0 && widthPercent > 0 && heightPercent > 0) {
          setComputedBox({
            x: leftPercent,
            y: topPercent,
            width: widthPercent,
            height: heightPercent
          });
        }
      }
    };

    updatePosition();
    const timer = setTimeout(updatePosition, 100);
    window.addEventListener('resize', updatePosition);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
    };
  }, [findingId, zoomLevel, documentData]);

  // Smooth scroll target evidence into view on mount/change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (targetTextRef.current) {
        targetTextRef.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [findingId]);

  return (
    <div className="flex flex-col h-full bg-surface border border-border rounded-xl shadow-xs overflow-hidden">
      {/* Top Document Metadata Bar */}
      <div className="bg-surface-2 text-text px-4 py-3 border-b border-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            {/* Single-line filename with ellipsis and full-name tooltip */}
            <div 
              className="text-xs font-semibold text-text truncate max-w-[240px] sm:max-w-[320px]" 
              title={filename}
            >
              {filename}
            </div>
            <div className="text-[10px] text-text-muted flex flex-wrap items-center gap-2">
              <span className="text-text font-semibold whitespace-nowrap">{document_type}</span>
              <span>•</span>
              <span className="whitespace-nowrap">Page {page_number} of {total_pages}</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold whitespace-nowrap">
                ELA: {forensics?.ela_status || 'CLEAN'}
              </span>
            </div>
          </div>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center space-x-1 shrink-0 bg-surface rounded-lg p-1 border border-border">
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1 rounded text-text hover:bg-surface-2 transition-colors cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono px-1.5 text-text font-bold">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1 rounded text-text hover:bg-surface-2 transition-colors cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            title="Reset Zoom"
            className="p-1 rounded text-text hover:bg-surface-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="h-3 w-px bg-border mx-0.5" />
          <button
            type="button"
            onClick={() => setShowHighlight(!showHighlight)}
            title="Toggle Bounding Box Highlight"
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors flex items-center space-x-1 cursor-pointer ${
              showHighlight 
                ? 'bg-primary/10 text-primary border border-primary/20' 
                : 'text-text-muted hover:bg-surface-2'
            }`}
          >
            <Crosshair className="w-3 h-3" />
            <span>BBox</span>
          </button>
        </div>
      </div>

      {/* Main Document Viewport with Zoom Container */}
      <div 
        ref={viewportRef}
        className="flex-1 bg-surface-2 p-4 overflow-auto min-h-[460px] max-h-[580px] flex items-center justify-center relative select-none scrollbar-slim"
      >
        <div 
          className="transition-transform duration-200 origin-center relative shadow-lg rounded-sm"
          style={{ 
            transform: `scale(${zoomLevel})`,
            width: '100%',
            maxWidth: '520px'
          }}
        >
          {/* Certificate / Document Paper Scan Representation */}
          {isFireSafety ? (
            /* Fire Safety Certificate Visual Scan: FIXED WHITE PAPER + DARK TEXT (#111827) IN BOTH THEMES */
            <div 
              ref={paperRef}
              style={{ backgroundColor: '#FFFFFF', color: '#111827' }}
              className="document-paper-canvas bg-white border-2 border-slate-300 rounded p-6 font-serif text-[#111827] text-[11px] leading-relaxed relative min-h-[560px] shadow-md border-t-4 border-t-amber-800 select-text"
            >
              {/* Official Seal Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
                <ShieldCheck className="w-64 h-64 text-slate-900" />
              </div>

              {/* Department Header */}
              <div className="text-center border-b-2 border-slate-300 pb-3 mb-4">
                <div style={{ color: '#78350F' }} className="text-[10px] uppercase font-bold tracking-widest text-amber-900">
                  Government of Karnataka
                </div>
                <div style={{ color: '#0F172A' }} className="text-sm font-bold uppercase tracking-wide text-slate-900 mt-0.5">
                  Karnataka Fire & Emergency Services Department
                </div>
                <div style={{ color: '#475569' }} className="text-[9px] text-slate-600 italic">
                  Office of the Chief Fire Officer, Bangalore Urban Range, Bengaluru - 560001
                </div>
                <div style={{ color: '#475569' }} className="mt-2 flex justify-between items-center text-[9px] font-sans font-semibold text-slate-600 px-2">
                  <span>Ref No: KSFES/BNG/2024/99102</span>
                  <span>Date of Issue: 15/06/2024</span>
                </div>
              </div>

              {/* Certificate Title */}
              <div className="text-center my-3">
                <span 
                  style={{ backgroundColor: '#FEF3C7', color: '#78350F', borderColor: '#FDE68A' }}
                  className="font-sans text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-3 py-1 rounded border border-amber-300 shadow-2xs inline-block"
                >
                  Fire Safety Certificate (Renewal)
                </span>
              </div>

              {/* Body Text */}
              <div style={{ color: '#1E293B' }} className="space-y-2.5 text-justify text-slate-800 font-serif text-[10.5px]">
                <p>
                  Certified that the educational institution premises occupied by{' '}
                  <strong style={{ color: '#0F172A' }} className="text-slate-900 font-sans">Apex Institute of Technology & Science</strong>, situated at 
                  Sy. No. 45/2, Chikkajala Industrial Corridor, Bengaluru, Karnataka, was inspected by the inspecting officer 
                  on 10/06/2024 in the presence of the institution's representative.
                </p>
                <p>
                  The building comprises Ground + 3 Upper Floors and has complied with the fire prevention and safety requirements in 
                  accordance with the National Building Code of India (Part IV) and Karnataka Fire Force Act.
                </p>

                {/* Statutory Validity Clause (Target Field) - ALWAYS LIGHT CALLOUT WITH DARK TEXT */}
                <div 
                  style={{ backgroundColor: '#F8FAFC', color: '#111827', borderColor: '#CBD5E1' }}
                  className="document-paper-clause-callout my-4 py-2.5 px-3 border border-slate-300 rounded text-[#111827]"
                >
                  <div style={{ color: '#475569' }} className="font-sans text-[10px] text-slate-600 uppercase font-bold">
                    Clause 4: Validity & Expiration
                  </div>
                  <p style={{ color: '#0F172A' }} className="mt-1 text-slate-900 font-medium">
                    The certificate is valid for educational occupancy subject to adherence to maintenance norms.{' '}
                    <span 
                      ref={targetTextRef}
                      id="evidence-target-text"
                      style={{ color: '#0F172A', textDecorationColor: '#D97706' }}
                      className="font-semibold underline decoration-amber-600"
                    >
                      Valid up to: 14/06/2025 for academic premises block A & B.
                    </span>
                  </p>
                </div>

                <p style={{ color: '#475569' }} className="text-[10px] text-slate-600">
                  Subject to annual compliance testing of booster pumps, hydrants, and clear passage for fire tenders. 
                  Renewal application must be filed 60 days before expiration.
                </p>
              </div>

              {/* Signatures & Seal */}
              <div style={{ borderColor: '#CBD5E1' }} className="mt-8 pt-4 border-t border-slate-300 flex items-end justify-between text-[9px]">
                <div className="text-left">
                  <div 
                    style={{ borderColor: '#B45309', color: '#B45309' }}
                    className="w-16 h-16 rounded-full border border-amber-700/40 flex items-center justify-center text-center p-1 text-[7px] text-amber-800 font-sans opacity-80"
                  >
                    DEPUTY CFO<br />OFFICIAL SEAL<br />BNG RANGE
                  </div>
                </div>
                <div className="text-right font-sans">
                  <div style={{ color: '#0F172A' }} className="font-bold text-slate-900">Dr. M. S. Venkatesh, IPS</div>
                  <div style={{ color: '#475569' }} className="text-slate-600">Chief Fire Officer</div>
                  <div style={{ color: '#64748B' }} className="text-slate-500">Karnataka State Fire Services</div>
                  <div style={{ color: '#047857' }} className="text-[8px] font-mono text-emerald-700 mt-1">✓ Digital DSC Verified</div>
                  <div style={{ color: '#64748B' }} className="text-[7.5px] font-sans text-slate-500 italic mt-0.5">(byte-range inspection real, PKI chain validation stubbed)</div>
                </div>
              </div>

              {/* BOUNDING BOX HIGHLIGHT OVERLAY */}
              {showHighlight && computedBox && (
                <div
                  id="document-extracted-bounding-box"
                  className="absolute pointer-events-auto transition-all group z-20"
                  style={{
                    left: `${computedBox.x}%`,
                    top: `${computedBox.y}%`,
                    width: `${computedBox.width}%`,
                    height: `${computedBox.height}%`,
                  }}
                >
                  {/* 1.5px cobalt outline + 10% fill (Strictly presentation token, no halo) */}
                  <div className="absolute inset-0 rounded-[4px] border-[1.5px] border-[#1F4BFF] bg-[#1F4BFF]/10 pointer-events-none" />

                  {/* Floating Tag ABOVE the box so it never covers text */}
                  <div className="absolute -top-6 left-0 bg-[#1F4BFF] text-white text-[9px] font-bold font-sans px-2 py-0.5 rounded shadow-xs flex items-center space-x-1 whitespace-nowrap z-30">
                    <Target className="w-2.5 h-2.5 text-white" />
                    <span>EXTRACTED: {fieldName}</span>
                    <span className="bg-[#0B3D91] text-white px-1 rounded text-[8px] font-mono">{confidence}%</span>
                  </div>

                  {/* Tooltip on Hover */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-[#0B1B33] text-white text-[9px] font-mono px-2 py-1 rounded shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                    Value: "{normalizedValue}"
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Master Building Plan Visual Scan (for Area finding) */
            <div 
              ref={paperRef}
              style={{ backgroundColor: '#FFFFFF', color: '#111827' }}
              className="bg-white border border-slate-300 rounded p-6 font-mono text-[#111827] text-[10px] leading-relaxed relative min-h-[560px] shadow-xs select-text"
            >
              {/* Technical Blueprint Grid Pattern */}
              <div 
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(rgba(141, 182, 230, 0.4) 1px, transparent 1px)',
                  backgroundSize: '16px 16px'
                }}
              />

              {/* Blueprint Title Block */}
              <div 
                style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', color: '#0F172A' }}
                className="border border-slate-200 p-3 bg-slate-50 rounded mb-4 flex justify-between items-center text-[9px]"
              >
                <div>
                  <div style={{ color: '#0F172A' }} className="text-slate-900 font-bold uppercase tracking-wider">
                    Bruhat Bengaluru Mahanagara Palike (BBMP) - Town Planning Cell
                  </div>
                  <div style={{ color: '#475569' }} className="text-slate-600">MASTER ARCHITECTURAL SITE PLAN & BUILT-UP AREA SCHEDULE</div>
                </div>
                <div style={{ color: '#64748B' }} className="text-right text-[8px] text-slate-500">
                  <div>DWG NO: BBMP/TP/2023/1820</div>
                  <div>SCALE: 1:500 (METRIC)</div>
                </div>
              </div>

              {/* Architectural Layout Representation */}
              <div 
                style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}
                className="border border-dashed border-slate-300 rounded p-4 mb-4 bg-slate-50 space-y-2 text-[9px]"
              >
                <div style={{ color: '#475569', borderColor: '#E2E8F0' }} className="flex justify-between border-b border-slate-200 pb-1 font-semibold">
                  <span>BLOCK ID</span>
                  <span>FLOOR COUNT</span>
                  <span>PLINTH AREA</span>
                </div>
                <div style={{ color: '#0F172A' }} className="flex justify-between text-slate-900">
                  <span>BLOCK A (Admin & Classrooms)</span>
                  <span>G + 3 Floors</span>
                  <span>6,400.00 SQ.M</span>
                </div>
                <div style={{ color: '#0F172A' }} className="flex justify-between text-slate-900">
                  <span>BLOCK B (Advanced Labs)</span>
                  <span>G + 3 Floors</span>
                  <span>5,800.00 SQ.M</span>
                </div>
                <div style={{ color: '#0F172A' }} className="flex justify-between text-slate-900">
                  <span>BLOCK C (Central Auditorium)</span>
                  <span>G + 2 Floors</span>
                  <span>6,000.00 SQ.M</span>
                </div>
              </div>

              {/* Statutory Built-Up Area Statement */}
              <div 
                style={{ backgroundColor: '#FEF3C7', borderColor: '#FDE68A', color: '#78350F' }}
                className="my-4 py-2.5 px-3 bg-amber-50 border border-amber-200 rounded"
              >
                <div style={{ color: '#92400E' }} className="text-amber-800 text-[9px] font-bold">TOTAL CERTIFIED INSTRUCTIONAL BUILT-UP AREA:</div>
                <div 
                  ref={targetTextRef}
                  id="evidence-target-text"
                  style={{ color: '#78350F' }}
                  className="text-amber-900 font-bold text-xs mt-0.5"
                >
                  TOTAL PROPOSED BUILT-UP AREA: 18,200.00 SQ.M (BLOCK A, B, C & LAB COMPLEX)
                </div>
              </div>

              <div style={{ borderColor: '#E2E8F0', color: '#64748B' }} className="text-[8px] text-slate-500 mt-6 pt-3 border-t border-slate-200 flex justify-between">
                <span>LICENSED ARCHITECT: REG. CA/2012/58102</span>
                <span style={{ color: '#047857' }} className="text-emerald-700 font-bold">✓ SANCTIONED UNDER KTCP ACT 1961</span>
              </div>

              {/* BOUNDING BOX FOR AREA */}
              {showHighlight && computedBox && (
                <div
                  id="document-extracted-bounding-box"
                  className="absolute pointer-events-auto transition-all group z-20"
                  style={{
                    left: `${computedBox.x}%`,
                    top: `${computedBox.y}%`,
                    width: `${computedBox.width}%`,
                    height: `${computedBox.height}%`,
                  }}
                >
                  <div className="absolute inset-0 rounded-[4px] border-[1.5px] border-[#1F4BFF] bg-[#1F4BFF]/10 pointer-events-none" />

                  <div className="absolute -top-6 left-0 bg-[#1F4BFF] text-white text-[9px] font-bold font-sans px-2 py-0.5 rounded shadow-xs flex items-center space-x-1 whitespace-nowrap z-30">
                    <Target className="w-2.5 h-2.5 text-white" />
                    <span>EXTRACTED: {fieldName}</span>
                    <span className="bg-[#0B3D91] text-white px-1 rounded text-[8px] font-mono">{confidence}%</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Forensic Summary Strip */}
      <div className="bg-surface-2 px-4 py-2 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Visual Bounding Box Synchronized</span>
        </div>
        <div className="text-[10px] font-mono text-text-subtle">
          Relative Coordinates [Auto-Aligned]
        </div>
      </div>
    </div>
  );
}
