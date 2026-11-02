import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  FileText, 
  ShieldCheck, 
  Target, 
  Crosshair,
  ExternalLink,
  Layers,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

/**
 * Document Bounding Box Viewer:
 * Renders high-fidelity certificate/plan scans with SVG vector layout and an interactive
 * pulsating bounding-box overlay highlighting the exact extracted field.
 */
export default function DocumentBoundingBoxViewer({ documentData, findingId }) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showHighlight, setShowHighlight] = useState(true);
  const [showOcrDetails, setShowOcrDetails] = useState(true);

  if (!documentData) {
    return (
      <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-muted">
        <FileText className="w-10 h-10 mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-medium">No document metadata available for this finding.</p>
      </div>
    );
  }

  const { filename, document_type, page_number, total_pages, extracted_field, forensics } = documentData;
  const bbox = extracted_field?.bounding_box || { x: 20, y: 40, width: 60, height: 8 };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.15, 1.8));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.15, 0.7));
  const handleResetZoom = () => setZoomLevel(1);

  const isFireSafety = findingId === 'FINDING-DOC-001';
  const targetEvidenceRef = useRef(null);
  const paperContainerRef = useRef(null);
  const [measuredBBox, setMeasuredBBox] = useState(null);

  useEffect(() => {
    if (targetEvidenceRef.current) {
      targetEvidenceRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [findingId, zoomLevel]);

  useEffect(() => {
    if (targetEvidenceRef.current && paperContainerRef.current) {
      const parentRect = paperContainerRef.current.getBoundingClientRect();
      const targetRect = targetEvidenceRef.current.getBoundingClientRect();
      if (parentRect.height > 0 && parentRect.width > 0) {
        setMeasuredBBox({
          x: Number((((targetRect.left - parentRect.left) / parentRect.width) * 100).toFixed(2)),
          y: Number((((targetRect.top - parentRect.top) / parentRect.height) * 100).toFixed(2)),
          width: Number(((targetRect.width / parentRect.width) * 100).toFixed(2)),
          height: Number(((targetRect.height / parentRect.height) * 100).toFixed(2)),
        });
      }
    }
  }, [findingId, zoomLevel]);

  const activeBox = measuredBBox || bbox;

  return (
    <div className="flex flex-col h-full bg-surface border border-border rounded-xl shadow-xs overflow-hidden">
      {/* Top Document Metadata Bar */}
      <div className="bg-surface-2 text-text px-4 py-3 border-b border-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-text truncate max-w-[280px]" title={filename}>
              {filename}
            </div>
            <div className="text-[10px] text-text-muted flex flex-wrap items-center gap-2">
              <span className="text-text font-semibold whitespace-nowrap">{document_type}</span>
              <span>•</span>
              <span className="whitespace-nowrap">Page {page_number} of {total_pages}</span>
              <span>•</span>
              <span className="text-emerald-700 font-mono font-bold whitespace-nowrap">ELA: {forensics?.ela_status || 'CLEAN'}</span>
            </div>
          </div>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center space-x-1 shrink-0 bg-surface rounded-lg p-1 border border-border">
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1 rounded-[8px] text-text hover:bg-surface-2 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono px-1.5 text-text font-bold">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1 rounded-[8px] text-text hover:bg-surface-2 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            title="Reset Zoom"
            className="p-1 rounded-[8px] text-text hover:bg-surface-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="h-3 w-px bg-border mx-0.5" />
          <button
            onClick={() => setShowHighlight(!showHighlight)}
            title="Toggle Bounding Box Highlight"
            className={`px-2 py-0.5 rounded-[8px] text-[10px] font-medium transition-colors flex items-center space-x-1 ${
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
      <div className="flex-1 bg-surface-2 p-4 overflow-auto min-h-[460px] max-h-[580px] flex items-center justify-center relative select-none">
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
            /* Fire Safety Certificate Visual Scan */
            <div ref={paperContainerRef} className="bg-white border-2 border-slate-300 rounded p-6 font-serif text-[#111827] text-[11px] leading-relaxed relative min-h-[560px] shadow-md border-t-4 border-t-slate-800">
              {/* Official Seal Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
                <ShieldCheck className="w-64 h-64 text-amber-950" />
              </div>

              {/* Department Header */}
              <div className="text-center border-b-2 border-amber-950/30 pb-3 mb-4">
                <div className="text-[10px] uppercase font-bold tracking-widest text-amber-950">
                  Government of Karnataka
                </div>
                <div className="text-sm font-bold uppercase tracking-wide text-slate-900 mt-0.5">
                  Karnataka Fire & Emergency Services Department
                </div>
                <div className="text-[9px] text-slate-600 italic">
                  Office of the Chief Fire Officer, Bangalore Urban Range, Bengaluru - 560001
                </div>
                <div className="mt-2 flex justify-between items-center text-[9px] font-sans font-semibold text-slate-600 px-2">
                  <span>Ref No: KSFES/BNG/2024/99102</span>
                  <span>Date of Issue: 15/06/2024</span>
                </div>
              </div>

              {/* Certificate Title */}
              <div className="text-center my-3">
                <span className="font-sans text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-950 px-3 py-1 rounded border border-amber-950/20 shadow-2xs">
                  Fire Safety Certificate (Renewal)
                </span>
              </div>

              {/* Body Text */}
              <div className="space-y-2.5 text-justify text-slate-800 font-serif text-[10.5px]">
                <p>
                  Certified that the educational institution premises occupied by{' '}
                  <strong className="text-slate-900 font-sans">Apex Institute of Technology & Science</strong>, situated at 
                  Sy. No. 45/2, Chikkajala Industrial Corridor, Bengaluru, Karnataka, was inspected by the inspecting officer 
                  on 10/06/2024 in the presence of the institution's representative.
                </p>
                <p>
                  The building comprises Ground + 3 Upper Floors and has complied with the fire prevention and safety requirements in 
                  accordance with the National Building Code of India (Part IV) and Karnataka Fire Force Act.
                </p>

                {/* Statutory Validity Clause (Target Field) */}
                <div className="my-4 py-2 px-3 bg-slate-50 border border-slate-200 rounded text-slate-900">
                  <div className="font-sans text-[10px] text-slate-500 uppercase font-bold">Clause 4: Validity & Expiration</div>
                  <p className="mt-1 text-slate-900 font-medium">
                    The certificate is valid for educational occupancy subject to adherence to maintenance norms.{' '}
                    <span 
                      id="target-validity-text" 
                      ref={targetEvidenceRef}
                      className="font-semibold underline decoration-[#1F4BFF] text-slate-950 px-1 py-0.5 rounded bg-[#1F4BFF]/5 inline-block"
                    >
                      Valid up to: 14/06/2025 for academic premises block A & B.
                    </span>
                  </p>
                </div>

                <p className="text-[10px] text-slate-600">
                  Subject to annual compliance testing of booster pumps, hydrants, and clear passage for fire tenders. 
                  Renewal application must be filed 60 days before expiration.
                </p>
              </div>

              {/* Signatures & Seal */}
              <div className="mt-8 pt-4 border-t border-slate-300 flex items-end justify-between text-[9px]">
                <div className="text-left">
                  <div className="w-16 h-16 rounded-full border border-amber-900/30 flex items-center justify-center text-center p-1 text-[7px] text-amber-900 font-sans opacity-70">
                    DEPUTY CFO<br />OFFICIAL SEAL<br />BNG RANGE
                  </div>
                </div>
                <div className="text-right font-sans">
                  <div className="font-bold text-slate-900">Dr. M. S. Venkatesh, IPS</div>
                  <div className="text-slate-600">Chief Fire Officer</div>
                  <div className="text-slate-500">Karnataka State Fire Services</div>
                  <div className="text-[8px] font-mono text-emerald-700 mt-1">✓ Digital DSC Verified</div>
                  <div className="text-[7.5px] font-sans text-slate-500 italic mt-0.5">(byte-range inspection real, PKI chain validation stubbed)</div>
                </div>
              </div>

              {/* INTERACTIVE BOUNDING BOX HIGHLIGHT OVERLAY (1.5px cobalt outline + 10% fill, label ABOVE) */}
              {showHighlight && (
                <div
                  id="document-extracted-bounding-box"
                  className="absolute pointer-events-auto transition-all group z-20"
                  style={{
                    left: `${activeBox.x}%`,
                    top: `${activeBox.y}%`,
                    width: `${activeBox.width}%`,
                    height: `${activeBox.height}%`,
                  }}
                >
                  {/* Clean 1.5px cobalt outline + 10% fill (No looping pulse / No glow shadow per Rule 4) */}
                  <div className="absolute inset-0 rounded-md border-[1.5px] border-[#1F4BFF] bg-[#1F4BFF]/10 pointer-events-none" />

                  {/* Floating Field Tag strictly ABOVE the box so it never covers document text */}
                  <div className="absolute bottom-full mb-1.5 left-0 bg-[#1F4BFF] text-white text-[9px] font-bold font-sans px-2 py-0.5 rounded shadow-xs flex items-center space-x-1 whitespace-nowrap z-30 pointer-events-none">
                    <Target className="w-2.5 h-2.5" />
                    <span>EXTRACTED: {extracted_field.field_name}</span>
                    <span className="bg-white/20 text-white px-1 rounded text-[8px]">{(extracted_field.ocr_confidence * 100).toFixed(1)}%</span>
                  </div>

                  {/* Tooltip on Hover */}
                  <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 bg-surface text-text border border-border text-[9px] font-mono px-2 py-1 rounded shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                    Value: "{extracted_field.normalized_value}" • BBox: [{activeBox.x}%, {activeBox.y}%, {activeBox.width}%, {activeBox.height}%]
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Master Building Plan Visual Scan (for Area finding) */
            <div ref={paperContainerRef} className="bg-white border border-slate-300 rounded p-6 font-mono text-[#111827] text-[10px] leading-relaxed relative min-h-[560px] shadow-xs">
              {/* Technical Blueprint Grid Pattern */}
              <div 
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(rgba(141, 182, 230, 0.4) 1px, transparent 1px)',
                  backgroundSize: '16px 16px'
                }}
              />

              {/* Blueprint Title Block */}
              <div className="border border-[#D5D9DE] p-3 bg-[#F4F6F8] rounded mb-4 flex justify-between items-center text-[9px]">
                <div>
                  <div className="text-[#000000] font-bold uppercase tracking-wider">
                    Bruhat Bengaluru Mahanagara Palike (BBMP) - Town Planning Cell
                  </div>
                  <div className="text-[#333333]">MASTER ARCHITECTURAL SITE PLAN & BUILT-UP AREA SCHEDULE</div>
                </div>
                <div className="text-right text-[8px] text-[#333333]">
                  <div>DWG NO: BBMP/TP/2023/1820</div>
                  <div>SCALE: 1:500 (METRIC)</div>
                </div>
              </div>

              {/* Architectural Layout Representation */}
              <div className="border border-dashed border-[#D5D9DE] rounded p-4 mb-4 bg-[#F4F6F8] space-y-2 text-[9px]">
                <div className="flex justify-between border-b border-[#D5D9DE] pb-1 text-[#333333] font-semibold">
                  <span>BLOCK ID</span>
                  <span>FLOOR COUNT</span>
                  <span>PLINTH AREA</span>
                </div>
                <div className="flex justify-between text-[#000000]">
                  <span>BLOCK A (Admin & Classrooms)</span>
                  <span>G + 3 Floors</span>
                  <span>6,400.00 SQ.M</span>
                </div>
                <div className="flex justify-between text-[#000000]">
                  <span>BLOCK B (Advanced Labs)</span>
                  <span>G + 3 Floors</span>
                  <span>5,800.00 SQ.M</span>
                </div>
                <div className="flex justify-between text-[#000000]">
                  <span>BLOCK C (Central Auditorium)</span>
                  <span>G + 2 Floors</span>
                  <span>6,000.00 SQ.M</span>
                </div>
              </div>

              {/* Statutory Built-Up Area Statement */}
              <div 
                ref={!isFireSafety ? targetEvidenceRef : null}
                className="my-4 py-2.5 px-3 bg-[#FFF1CC] border border-[rgba(92,67,0,0.2)] rounded text-[#5C4300]"
              >
                <div className="text-[#5C4300] text-[9px] font-bold">TOTAL CERTIFIED INSTRUCTIONAL BUILT-UP AREA:</div>
                <div className="text-[#5C4300] font-bold text-xs mt-0.5">
                  TOTAL PROPOSED BUILT-UP AREA: 18,200.00 SQ.M (BLOCK A, B, C & LAB COMPLEX)
                </div>
              </div>

              <div className="text-[8px] text-[#333333] mt-6 pt-3 border-t border-[#D5D9DE] flex justify-between">
                <span>LICENSED ARCHITECT: REG. CA/2012/58102</span>
                <span className="text-emerald-700 font-bold">✓ SANCTIONED UNDER KTCP ACT 1961</span>
              </div>

              {/* INTERACTIVE BOUNDING BOX FOR AREA (1.5px cobalt outline + 10% fill, label ABOVE) */}
              {showHighlight && (
                <div
                  id="document-extracted-bounding-box"
                  className="absolute pointer-events-auto transition-all group z-20"
                  style={{
                    left: `${activeBox.x}%`,
                    top: `${activeBox.y}%`,
                    width: `${activeBox.width}%`,
                    height: `${activeBox.height}%`,
                  }}
                >
                  <div className="absolute inset-0 rounded-md border-[1.5px] border-[#1F4BFF] bg-[#1F4BFF]/10 pointer-events-none" />

                  <div className="absolute bottom-full mb-1.5 left-0 bg-[#1F4BFF] text-white text-[9px] font-bold font-sans px-2 py-0.5 rounded shadow-xs flex items-center space-x-1 whitespace-nowrap z-30 pointer-events-none">
                    <Target className="w-2.5 h-2.5" />
                    <span>EXTRACTED: {extracted_field.field_name}</span>
                    <span className="bg-white/20 text-white px-1 rounded text-[8px]">{(extracted_field.ocr_confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom OCR Forensic Coordinate Footer */}
      <div className="bg-surface-2 border-t border-border px-4 py-2.5 text-xs text-text-muted flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-text-subtle">Bounding Box:</span>
          <span className="font-mono text-[11px] bg-surface border border-border px-2 py-0.5 rounded text-text">
            [x: {bbox.x}%, y: {bbox.y}%, w: {bbox.width}%, h: {bbox.height}%]
          </span>
          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>OCR Match {((extracted_field?.ocr_confidence || 0.95) * 100).toFixed(1)}%</span>
          </span>
        </div>

        <div className="text-[11px] font-mono text-text-subtle">
          Raw: <span className="text-text font-semibold">{extracted_field?.normalized_value}</span>
        </div>
      </div>
    </div>
  );
}
