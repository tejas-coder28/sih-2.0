import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import CopyButton from '../components/ui/CopyButton';
import { 
  Upload, 
  AlertTriangle, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Search, 
  RefreshCw, 
  Info, 
  Crosshair, 
  Eye, 
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  X,
  FileText,
  CheckCircle2
} from 'lucide-react';
import DemoDataBadge from '../components/DemoDataBadge';
import { api } from '../services/api';

const PRESET_INTELLIGENCE_DOCS = [
  {
    id: 'doc_fire_noc',
    name: 'Fire Safety NOC',
    filename: 'gt_font_inconsistency.pdf',
    type: 'Fire Safety Certificate',
    refNo: 'FS/NOC/BLR/2024/9812',
    institution: 'Apex Institute of Technology & Science',
    validity: '2025-04-01 to 2026-03-31',
    capacity: '750 Students / 8,500 m²',
    authority: 'Karnataka State Fire & Emergency Services',
    filePath: 'generated_data/forensic_samples/gt_font_inconsistency.pdf',
    desc: 'State emergency services clearance with validity date and reference number.',
    bodyText: 'This certifies that the educational premises and instructional infrastructure of Apex Institute of Technology & Science have been inspected in compliance with the National Building Code (NBC) Part IV and State Fire Prevention Rules. Adequate fire hydrants, pressurized hoses, smoke detection arrays, and wide emergency exits are commissioned and verified as functional.'
  },
  {
    id: 'doc_building_plan',
    name: 'Building Plan',
    filename: 'gt_ela_tampered.jpg',
    type: 'Building Plan Approval',
    refNo: 'BP/BBMP/2023/1104',
    institution: 'Apex Institute of Technology & Science',
    validity: 'Permanent Sanction (2030-12-31)',
    capacity: 'Built-up Area: 14,250.50 m²',
    authority: 'Bruhat Bengaluru Mahanagara Palike (Town Planning)',
    filePath: 'generated_data/forensic_samples/gt_ela_tampered.jpg',
    desc: 'Sanctioned master floor plan with declared instructional and carpet areas.',
    bodyText: 'Sanction is hereby accorded under municipal town planning regulations for instructional blocks A, B, and Central Technical Library situated at Survey No. 42/1. Verified instructional carpet area conforms strictly with AICTE statutory norms for technical education infrastructure.'
  },
  {
    id: 'doc_faculty_list',
    name: 'Faculty List',
    filename: 'gt_clean_authentic_affidavit.pdf',
    type: 'Faculty Cadre & Ratio Record',
    refNo: 'FAC/AFF/2025/088',
    institution: 'Apex Institute of Technology & Science',
    validity: 'Academic Year 2025-2026',
    capacity: 'Faculty Strength: 85 (Ratio 1:15)',
    authority: 'Institutional Scrutiny Cell & Notary Public',
    filePath: 'generated_data/forensic_samples/gt_clean_authentic_affidavit.pdf',
    desc: 'Clean legal affidavit with uniform typography, notarized seal, and matching QR.',
    bodyText: 'Notarized statutory affidavit affirming regular faculty cadre appointments in accordance with AICTE pay scales and prescribed teacher-to-student cadre ratios across all sanctioned undergraduate technical departments.'
  },
  {
    id: 'doc_land_deed',
    name: 'Land Deed',
    filename: 'gt_qr_reference_mismatch.pdf',
    type: 'Land Ownership / Encumbrance Certificate',
    refNo: 'LND/KA/SURV/42/1',
    institution: 'Apex Institute of Technology & Science',
    validity: 'Perpetual Title / Encumbrance-Free',
    capacity: 'Contiguous Land Area: 7.5 Acres',
    authority: 'Department of Stamps & Registration (Karnataka)',
    filePath: 'generated_data/forensic_samples/gt_qr_reference_mismatch.pdf',
    desc: 'State revenue department registered title deed for contiguous land parcel.',
    bodyText: 'Registered title deed executed before the Sub-Registrar certifying peaceful, lawful, and encumbrance-free ownership of 7.5 contiguous acres of educational designated land parcel exclusively allocated for technical institutional establishment.'
  }
];

export default function DocumentIntelligencePage({ onNavigateTab, onSelectApplication: _onSelectApplication }) {
  // Source State: Only one source is active at a time (Requirement 2)
  const [activeSourceType, setActiveSourceType] = useState('sample'); // 'sample' | 'upload'
  const [selectedPreset, setSelectedPreset] = useState(PRESET_INTELLIGENCE_DOCS[0]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [documentResult, setDocumentResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDemoData, setIsDemoData] = useState(false);

  // Viewer state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showBoxes, setShowBoxes] = useState(true);
  const [activePageIndex, _setActivePageIndex] = useState(0);
  const [selectedFieldKey, setSelectedFieldKey] = useState(null);
  const [hoveredFieldKey, setHoveredFieldKey] = useState(null);
  const [pulsingFieldKey, setPulsingFieldKey] = useState(null);
  const [ocrSearchQuery, setOcrSearchQuery] = useState('');
  const [activeViewMode, setActiveViewMode] = useState('visual'); // 'visual' | 'text'

  // Dynamic measured box positions { [fieldKey]: { x, y, w, h } } in original page coordinate space
  const [measuredBoxes, setMeasuredBoxes] = useState({});

  const fileInputRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const pageContainerRef = useRef(null);
  const activeRequestIdRef = useRef(0);
  const initialLoadedRef = useRef(false);

  // Ingest and extract document
  const processDocument = async (fileOrPreset) => {
    const currentRequestId = ++activeRequestIdRef.current;
    console.log(`[DocIntel] processDocument #${currentRequestId} called with:`, fileOrPreset instanceof File ? `File(${fileOrPreset.name})` : fileOrPreset?.name);
    setLoading(true);
    setError(null);
    try {
      let ingestRes;
      let forensicRes = null;

      if (fileOrPreset instanceof File) {
        // Validate file format
        const allowedExts = ['.pdf', '.png', '.jpg', '.jpeg'];
        const fn = fileOrPreset.name.toLowerCase();
        if (!allowedExts.some(ext => fn.endsWith(ext))) {
          if (currentRequestId !== activeRequestIdRef.current) return;
          setError('Unsupported file format. Supported formats are: PDF, JPG, PNG.');
          setDocumentResult(null);
          setLoading(false);
          return;
        }

        // Upload custom file to backend ingestion pipeline
        ingestRes = await api.ingestDocument(fileOrPreset);
        if (currentRequestId !== activeRequestIdRef.current) return;

        if (ingestRes?.status === 'ocr_unavailable') {
          setError(ingestRes.status_message || 'OCR engine unavailable on server for this scan/image.');
          setDocumentResult({
            ...ingestRes,
            extracted_fields: [],
            engine: 'None',
            ocr_engine: 'None'
          });
          setLoading(false);
          return;
        }

        try {
          const fData = new FormData();
          fData.append('file', fileOrPreset);
          forensicRes = await api.analyzeDocumentForensics(fData);
        } catch (_fe) {
          // Forensics optional
        }
      } else {
        // Preset sample file
        const filePath = fileOrPreset.filePath;
        const formData = new FormData();
        formData.append('file_path', filePath);
        
        try {
          forensicRes = await api.analyzeDocumentForensics(formData);
        } catch (_fe) {
          // ignore
        }

        if (currentRequestId !== activeRequestIdRef.current) return;

        const docType = fileOrPreset.type;
        const refNo = fileOrPreset.refNo;
        const institution = fileOrPreset.institution;
        const validity = fileOrPreset.validity;
        const capacity = fileOrPreset.capacity;
        const bodyText = fileOrPreset.bodyText;
        const authority = fileOrPreset.authority;

        ingestRes = {
          filename: fileOrPreset.filename,
          doc_type: docType,
          classifier_confidence: 0.96,
          classifier_method: 'tf_idf_logistic_regression',
          total_pages: 1,
          full_extracted_text: `GOVERNMENT OF INDIA • AICTE STATUTORY SCRUTINY CELL\n${docType.toUpperCase()}\nInstitution: ${institution}\nReference Number: ${refNo}\nValidity: ${validity}\nCapacity / Approved Area: ${capacity}\nIssuing Authority: ${authority}\n\n${bodyText}\n\nRegulatory Clause: AICTE Approval Process Handbook (APH) Statutory Norms.\nVerified by: Competent Scrutiny Officer.`,
          per_page_ocr: [
            {
              page_number: 1,
              width: 1200,
              height: 1700,
              full_text: `GOVERNMENT OF INDIA • AICTE STATUTORY SCRUTINY CELL\n${docType.toUpperCase()}\nInstitution: ${institution}\nReference Number: ${refNo}\nValidity: ${validity}\nCapacity / Approved Area: ${capacity}\nIssuing Authority: ${authority}\n\n${bodyText}`,
              lines: [
                { text: 'GOVERNMENT OF INDIA • AICTE STATUTORY SCRUTINY CELL', confidence: 0.99, bounding_box: [100, 120, 150, 1080] },
                { text: docType.toUpperCase(), confidence: 0.97, bounding_box: [220, 120, 290, 1080] },
                { text: `Institution: ${institution}`, confidence: 0.98, bounding_box: [420, 120, 480, 1080] },
                { text: `Reference Number: ${refNo}`, confidence: 0.96, bounding_box: [550, 120, 605, 800] },
                { text: `Validity: ${validity}`, confidence: 0.95, bounding_box: [680, 120, 735, 750] },
                { text: `Capacity / Area: ${capacity}`, confidence: 0.96, bounding_box: [810, 120, 865, 850] }
              ]
            }
          ]
        };
      }

      if (currentRequestId !== activeRequestIdRef.current) return;

      // Structure extracted fields for the table
      const fullText = ingestRes.full_extracted_text || '';
      const isCustomFile = fileOrPreset instanceof File;
      const presetData = typeof fileOrPreset === 'object' && !(fileOrPreset instanceof File) ? fileOrPreset : selectedPreset;

      let extractedFields = [];
      if (isCustomFile && ingestRes.extracted_fields && ingestRes.extracted_fields.length > 0) {
        extractedFields = ingestRes.extracted_fields;
      } else if (!isCustomFile && presetData) {
        extractedFields = [
          {
            key: 'doc_type',
            label: 'Classified Document Type',
            value: ingestRes.doc_type || presetData.type,
            confidence: ingestRes.classifier_confidence ? Math.round(ingestRes.classifier_confidence * 100) : 96,
            page: 1,
            box: { x: 96, y: 190, w: 1008, h: 76 }
          },
          {
            key: 'institution',
            label: 'Applicant Institution',
            value: presetData.institution,
            confidence: 98,
            page: 1,
            box: { x: 96, y: 350, w: 1008, h: 60 }
          },
          {
            key: 'ref_no',
            label: 'Reference / NOC Number',
            value: presetData.refNo,
            confidence: 96,
            page: 1,
            box: { x: 96, y: 440, w: 680, h: 56 }
          },
          {
            key: 'validity',
            label: 'Validity Expiry Date',
            value: presetData.validity,
            confidence: 95,
            page: 1,
            box: { x: 96, y: 530, w: 720, h: 56 }
          },
          {
            key: 'capacity',
            label: 'Sanctioned Intake / Area',
            value: presetData.capacity,
            confidence: 94,
            page: 1,
            box: { x: 96, y: 620, w: 840, h: 56 }
          }
        ];
      }

      setDocumentResult({
        ...ingestRes,
        extracted_fields: extractedFields,
        bodyText: presetData?.bodyText,
        authority: presetData?.authority,
        forensic_findings: forensicRes?.indicators || []
      });
      setIsDemoData(!isCustomFile);
    } catch (err) {
      if (currentRequestId !== activeRequestIdRef.current) return;
      console.warn('Document intelligence error:', err);
      const statusCode = err.response?.status;
      const detailMsg = err.response?.data?.detail || err.message;
      const formattedError = statusCode ? `HTTP ${statusCode}: ${detailMsg}` : `Request failed: ${detailMsg}`;
      setError(formattedError);
      setDocumentResult(null); // Never fall back silently to sample data!
      if (fileOrPreset && !(fileOrPreset instanceof File)) {
        setIsDemoData(true);
      } else {
        setIsDemoData(false);
      }
    } finally {
      if (currentRequestId === activeRequestIdRef.current) {
        setLoading(false);
      }
    }
  };

  // Staging an uploaded file: replaces any previous result completely (Requirement 2)
  const handleFileSelect = (file) => {
    if (!file) return;
    activeRequestIdRef.current++;
    setLoading(false);
    setSelectedPreset(null);
    setUploadedFile(file);
    setActiveSourceType('upload');
    setDocumentResult(null); // Clear previous results completely (no stale fields)
    setError(null);
    setIsDemoData(false);
  };

  // Selecting a sample: clears uploaded file and loads sample (Requirement 2)
  const handleSelectPreset = (doc) => {
    activeRequestIdRef.current++;
    setLoading(false);
    setUploadedFile(null);
    setSelectedPreset(doc);
    setActiveSourceType('sample');
    setDocumentResult(null); // Clear previous result
    setError(null);
    processDocument(doc);
  };

  // Initial mount load for sample: only once on mount
  useEffect(() => {
    if (!initialLoadedRef.current) {
      initialLoadedRef.current = true;
      processDocument(PRESET_INTELLIGENCE_DOCS[0]);
    }
  }, []);

  // Actual OCR page width and height from OCR response
  const activePage = documentResult?.per_page_ocr?.[activePageIndex] || documentResult?.per_page_ocr?.[0];
  const originalWidth = activePage?.width || 1200;
  const originalHeight = activePage?.height || 1700;

  // Single base rendered width for the paper container (A4 aspect ratio maintained)
  const renderedWidth = 680;
  const renderedHeight = Math.round(renderedWidth * (originalHeight / originalWidth));

  // Measure rendered DOM elements inside page container with sub-pixel precision (only for HTML mock)
  const measureDomBoxes = useCallback(() => {
    if (documentResult?.preview_image) {
      // Authoritative image preview uses backend coordinates directly
      return;
    }
    if (!pageContainerRef.current) return;
    const container = pageContainerRef.current;
    const cWidth = container.offsetWidth;
    const cHeight = container.offsetHeight;
    if (!cWidth || !cHeight) return;

    const newBoxes = {};
    const fields = documentResult?.extracted_fields || [];
    fields.forEach((field) => {
      const el = document.getElementById(`doc-field-target-${field.key}`);
      if (el) {
        let top = 0;
        let left = 0;
        let current = el;
        while (current && current !== container) {
          top += current.offsetTop;
          left += current.offsetLeft;
          current = current.offsetParent;
        }

        const padX = 2.5;
        const padY = 2;
        const boxLeft = Math.max(0, left - padX);
        const boxTop = Math.max(0, top - padY);
        const boxWidth = el.offsetWidth + padX * 2;
        const boxHeight = el.offsetHeight + padY * 2;

        newBoxes[field.key] = {
          x: Math.round((boxLeft / cWidth) * originalWidth),
          y: Math.round((boxTop / cHeight) * originalHeight),
          w: Math.round((boxWidth / cWidth) * originalWidth),
          h: Math.round((boxHeight / cHeight) * originalHeight)
        };
      }
    });

    if (Object.keys(newBoxes).length > 0) {
      setMeasuredBoxes(newBoxes);
    }
  }, [originalWidth, originalHeight, documentResult]);

  useLayoutEffect(() => {
    if (activeViewMode === 'visual' && documentResult && !documentResult.preview_image) {
      measureDomBoxes();
      const t = setTimeout(measureDomBoxes, 50);
      return () => clearTimeout(t);
    }
  }, [documentResult, activeViewMode, selectedPreset, measureDomBoxes]);

  useEffect(() => {
    window.addEventListener('resize', measureDomBoxes);
    return () => window.removeEventListener('resize', measureDomBoxes);
  }, [measureDomBoxes]);

  // Handle Drag & Drop
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Zoom controls (CSS transform scale)
  const handleZoomIn = () => setZoomLevel((z) => Math.min(Number((z + 0.15).toFixed(2)), 2.0));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(Number((z - 0.15).toFixed(2)), 0.6));
  const handleSetExactZoom = (lvl) => setZoomLevel(lvl);
  const handleResetZoom = () => setZoomLevel(1.0);

  // Clicking a table row scrolls to and pulses its box once
  const handleRowClick = (fieldKey) => {
    setSelectedFieldKey(fieldKey);
    setPulsingFieldKey(fieldKey);
    setTimeout(() => setPulsingFieldKey(null), 850);

    const boxEl = document.getElementById(`box-field-${fieldKey}`);
    if (boxEl && scrollContainerRef.current) {
      boxEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const hasFindings = (documentResult?.forensic_findings && documentResult.forensic_findings.length > 0) || 
                      (documentResult?.doc_type?.toLowerCase().includes('fire') && selectedPreset?.id === 'doc_fire_noc') ||
                      (documentResult?.doc_type?.toLowerCase().includes('building') && selectedPreset?.id === 'doc_building_plan');

  return (
    <div className="space-y-6 max-w-[1720px] mx-auto text-text">
      {/* 1. Top Section: Compact Upload Bar & Preset Sample Pills */}
      <div className="bg-surface border border-border rounded-xl p-4 shadow-xs space-y-3">
        {/* Active Source indicator & Demo Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/40 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-muted font-medium">Active Source:</span>
            <span 
              id="active-source-pill"
              className={`font-semibold px-2.5 py-0.5 rounded-full border text-[11px] ${
                activeSourceType === 'upload' && uploadedFile
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              }`}
            >
              {activeSourceType === 'upload' && uploadedFile 
                ? `Your upload: ${uploadedFile.name}` 
                : `Sample: ${selectedPreset?.name || 'Fire Safety NOC'}`}
            </span>
          </div>
          {isDemoData && <DemoDataBadge reason="OCR Fallback Simulation" />}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Upload Bar / Dropzone */}
          <div 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => !loading && fileInputRef.current?.click()}
            className={`flex-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 px-3.5 py-2.5 sm:py-2 rounded-lg border border-dashed border-border bg-surface-2 transition-colors cursor-pointer text-xs ${
              loading ? 'opacity-70 cursor-not-allowed' : 'hover:border-primary/50'
            }`}
          >
            <input
              type="file"
              id="doc-intel-file-input"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              disabled={loading}
            />
            <div className="flex items-center space-x-2.5 min-w-0">
              <Upload className="w-4 h-4 text-primary shrink-0" />
              {uploadedFile ? (
                <div className="flex items-center space-x-2 truncate">
                  <span className="font-semibold text-text truncate max-w-[240px]" id="staged-file-name">{uploadedFile.name}</span>
                  <span className="text-[11px] font-mono text-muted">({(uploadedFile.size / 1024).toFixed(0)} KB)</span>
                </div>
              ) : (
                <span className="text-muted text-[11px] sm:text-xs">
                  <strong className="text-text font-medium">PDF, JPG or PNG (max 25MB)</strong>. Text read from text layer or OCR.
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
              {uploadedFile && (
                <button
                  type="button"
                  id="btn-clear-uploaded-file"
                  disabled={loading}
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadedFile(null);
                    setActiveSourceType('sample');
                    setSelectedPreset(PRESET_INTELLIGENCE_DOCS[0]);
                    setDocumentResult(null);
                    processDocument(PRESET_INTELLIGENCE_DOCS[0]);
                  }}
                  className="w-10 h-10 sm:w-7 sm:h-7 flex items-center justify-center text-muted hover:text-text rounded cursor-pointer"
                  title="Clear uploaded file"
                  aria-label="Clear uploaded file"
                >
                  <X className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                </button>
              )}
              <button
                type="button"
                id="btn-analyze-document"
                disabled={loading}
                onClick={(e) => {
                  e.stopPropagation();
                  if (uploadedFile) {
                    processDocument(uploadedFile);
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                className={`btn-solid min-h-[44px] sm:min-h-0 h-11 sm:h-8 px-4 sm:px-3 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{loading ? 'Analyzing...' : (uploadedFile ? 'Analyze' : 'Browse')}</span>
              </button>
            </div>
          </div>

          {/* Sample Document Pills: Horizontally scrollable row on mobile */}
          <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none snap-x pb-1 w-full sm:w-auto flex-nowrap">
            <span className="text-[11px] font-medium text-muted mr-1 shrink-0">Samples:</span>
            {PRESET_INTELLIGENCE_DOCS.map((doc) => {
              const isSelected = activeSourceType === 'sample' && selectedPreset?.id === doc.id;
              return (
                <button
                  key={doc.id}
                  type="button"
                  id={`btn-sample-${doc.id}`}
                  disabled={loading}
                  onClick={() => handleSelectPreset(doc)}
                  className={`min-h-[44px] sm:min-h-0 h-11 sm:h-8 px-3.5 sm:px-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer shrink-0 snap-start flex items-center ${
                    isSelected
                      ? 'btn-solid shadow-xs'
                      : 'bg-surface border-border text-text-muted hover:text-text hover:bg-surface-2'
                  }`}
                >
                  {doc.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Advisory / Indicator Notice (Compact) */}
        <div className="flex items-center space-x-2 text-[11px] text-muted pt-2 border-t border-border/60">
          <Info className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="truncate">
            <strong className="text-text font-medium">Indicator for review:</strong> Automated OCR extractions are advisory. Extractions are verified against statutory issuer registries prior to formal committee review.
          </span>
        </div>
      </div>

      {/* Error Banner: Prominently displayed with HTTP status if extraction fails */}
      {error && (
        <div 
          id="doc-intel-error-banner" 
          className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-between text-xs font-medium shadow-xs"
        >
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="p-1 hover:bg-rose-500/20 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Main Workspace: Loading State / Staged State / Results */}
      {loading ? (
        <div className="bg-surface border border-border rounded-xl p-16 text-center text-muted space-y-3" id="doc-intel-loading-card">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-sm font-semibold text-text">Executing Document Intelligence & Schema Extraction...</p>
          <p className="text-xs text-muted">Running pluggable OCR engine, word-level vector layout analysis, and schema binding.</p>
        </div>
      ) : !documentResult && uploadedFile ? (
        /* Staged File Prompt (Requirement 2: Staged file with Analyze button) */
        <div className="bg-surface border border-border rounded-xl p-12 text-center text-muted space-y-4 shadow-xs" id="doc-intel-staged-card">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-text">Document Staged: {uploadedFile.name}</h3>
            <p className="text-xs text-muted max-w-md mx-auto">
              Ready to process <span className="font-mono text-text">{(uploadedFile.size / 1024).toFixed(0)} KB</span> via multi-modal OCR pipeline. Click Analyze below to execute extraction.
            </p>
          </div>
          <button
            type="button"
            id="btn-staged-run-analyze"
            onClick={() => processDocument(uploadedFile)}
            className="btn-solid h-9 px-5 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-semibold text-xs inline-flex items-center space-x-2 shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Analyze Staged Document</span>
          </button>
        </div>
      ) : documentResult && (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start" id="doc-intel-results-grid">
          
          {/* LEFT Card (60% / xl:col-span-3): Document Preview (Rendered Page or Sample) */}
          <div className="xl:col-span-3 space-y-4">
            <div className="bg-surface rounded-xl border border-border p-4 shadow-xs space-y-3">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border text-xs">
                {/* Left: Page indicator & Tabs */}
                <div className="flex items-center space-x-4">
                  <span className="text-xs font-mono font-medium text-muted bg-surface-2 px-2 py-0.5 rounded border border-border">
                    Page {activePageIndex + 1} of {documentResult.total_pages || 1}
                  </span>

                  {/* Underline Tabs: Preview | Extracted text */}
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeViewMode === 'visual'}
                      onClick={() => setActiveViewMode('visual')}
                      className={`tab px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        activeViewMode === 'visual'
                          ? 'is-active btn-solid'
                          : 'text-text-muted hover:text-text hover:bg-surface-2'
                      }`}
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeViewMode === 'text'}
                      onClick={() => setActiveViewMode('text')}
                      className={`tab px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        activeViewMode === 'text'
                          ? 'is-active btn-solid'
                          : 'text-text-muted hover:text-text hover:bg-surface-2'
                      }`}
                    >
                      Extracted text
                    </button>
                  </div>
                </div>

                {/* Right: Show/Hide Boxes & Zoom Controls */}
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    id="btn-toggle-boxes"
                    onClick={() => setShowBoxes(!showBoxes)}
                    className={`h-8 px-2.5 rounded-lg text-xs font-medium border flex items-center space-x-1 transition-colors cursor-pointer ${
                      showBoxes
                        ? 'btn-solid shadow-xs'
                        : 'bg-surface border-border text-text-muted hover:text-text'
                    }`}
                    title="Toggle bounding boxes"
                  >
                    {showBoxes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{showBoxes ? 'Hide boxes' : 'Show boxes'}</span>
                  </button>

                  <div className="h-4 w-px bg-border mx-1" />

                  {/* Quick Zoom Presets */}
                  <div className="inline-flex items-center rounded-lg border border-border bg-surface-2 p-0.5 divide-x divide-border shadow-2xs">
                    <button 
                      type="button"
                      onClick={() => handleSetExactZoom(0.75)} 
                      className={`h-6 px-2 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                        zoomLevel === 0.75 ? 'bg-primary text-white font-bold shadow-xs' : 'text-text-muted hover:text-text'
                      }`}
                      title="Zoom to 75%"
                    >
                      75%
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleSetExactZoom(1.0)} 
                      className={`h-6 px-2 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                        zoomLevel === 1.0 ? 'bg-primary text-white font-bold shadow-xs' : 'text-text-muted hover:text-text'
                      }`}
                      title="Zoom to 100%"
                    >
                      100%
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleSetExactZoom(1.5)} 
                      className={`h-6 px-2 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                        zoomLevel === 1.5 ? 'bg-primary text-white font-bold shadow-xs' : 'text-text-muted hover:text-text'
                      }`}
                      title="Zoom to 150%"
                    >
                      150%
                    </button>
                  </div>

                  <div className="h-4 w-px bg-border mx-0.5" />

                  <button 
                    type="button"
                    onClick={handleZoomOut} 
                    className="w-8 h-8 rounded-lg border border-border hover:bg-surface-2 text-text flex items-center justify-center cursor-pointer transition-colors" 
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    type="button"
                    onClick={handleZoomIn} 
                    className="w-8 h-8 rounded-lg border border-border hover:bg-surface-2 text-text flex items-center justify-center cursor-pointer transition-colors" 
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    type="button"
                    onClick={handleResetZoom} 
                    className="w-8 h-8 rounded-lg border border-border hover:bg-surface-2 text-text flex items-center justify-center cursor-pointer transition-colors" 
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Mode A: Preview Canvas (Rendered Upload Page OR Sample HTML Mock) */}
              {activeViewMode === 'visual' && (
                <div 
                  ref={scrollContainerRef}
                  className="relative bg-surface-2 rounded-xl overflow-auto max-h-[660px] p-8 flex flex-col items-center justify-start border border-border"
                >
                  <div
                    style={{
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: 'top center',
                      marginBottom: zoomLevel > 1 ? `${Math.round((zoomLevel - 1) * renderedHeight)}px` : '0px',
                    }}
                    className="shrink-0"
                  >
                    <div 
                      ref={pageContainerRef}
                      id="document-page-canvas"
                      style={{ 
                        width: `${renderedWidth}px`, 
                        minHeight: `${renderedHeight}px`,
                        backgroundColor: '#FFFFFF',
                        color: '#111827'
                      }}
                      className="document-paper-canvas relative document-paper-sheet select-text font-serif text-[#111827] box-border shadow-md overflow-hidden"
                    >
                      {/* True Rendered Page Image (when available from backend or custom upload) */}
                      {documentResult.preview_image ? (
                        <div className="relative w-full h-full select-none" id="uploaded-doc-preview-wrapper">
                          <img
                            id="document-rendered-page-img"
                            src={documentResult.preview_image}
                            alt={documentResult.filename || 'Uploaded Document'}
                            className="w-full h-auto object-contain block"
                            style={{ width: `${renderedWidth}px` }}
                          />
                        </div>
                      ) : (
                        /* Sample HTML Mock (only used when no preview image exists for sample presets) */
                        <div className="p-8 space-y-4">
                          <div className="space-y-4 text-center border-b-2 border-slate-800 pb-5">
                            <div className="text-[11px] tracking-widest font-sans font-bold text-slate-700 uppercase flex items-center justify-center space-x-2">
                              <span className="w-2 h-2 rounded-full bg-[#3B6CFF]" />
                              <span>Government of India • AICTE Statutory Regulatory Scrutiny</span>
                              <span className="w-2 h-2 rounded-full bg-[#3B6CFF]" />
                            </div>

                            <div className="py-1">
                              <h2 
                                id="doc-field-target-doc_type"
                                style={{ color: '#111827' }}
                                className="inline-block text-lg font-bold text-[#111827] uppercase tracking-tight"
                              >
                                {documentResult.doc_type || 'Statutory Compliance Record'}
                              </h2>
                            </div>

                            <div className="text-xs font-sans text-slate-600">
                              Official AICTE National Regulatory Archive Verification Dossier
                            </div>
                          </div>

                          <div className="py-6 space-y-4 text-xs leading-relaxed text-[#111827]">
                            <div className="flex justify-between items-center text-[11px] font-sans border-b border-slate-100 pb-2.5">
                              <span className="text-slate-600">Applicant Institution:</span>
                              <span 
                                id="doc-field-target-institution"
                                className="font-bold text-[#111827]"
                              >
                                {documentResult.extracted_fields?.find(f => f.key === 'institution' || f.key === 'institution_name')?.value || selectedPreset?.institution || 'Apex Institute of Technology & Science'}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-[11px] font-sans border-b border-slate-100 pb-2.5">
                              <span className="text-slate-600">Statutory Reference / NOC:</span>
                              <span 
                                id="doc-field-target-ref_no"
                                className="font-mono font-bold text-[#111827]"
                              >
                                {documentResult.extracted_fields?.find(f => f.key === 'ref_no' || f.key === 'noc_number' || f.key === 'reference_number')?.value || selectedPreset?.refNo || 'DOC/REG/2025/9821'}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-[11px] font-sans border-b border-slate-100 pb-2.5">
                              <span className="text-slate-600">Validity & Compliance Period:</span>
                              <span 
                                id="doc-field-target-validity"
                                className="font-semibold text-[#111827]"
                              >
                                {documentResult.extracted_fields?.find(f => f.key === 'validity' || f.key === 'validity_date' || f.key === 'expiry_date')?.value || selectedPreset?.validity || '2025-04-01 to 2026-03-31'}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-[11px] font-sans border-b border-slate-100 pb-2.5">
                              <span className="text-slate-600">Sanctioned Intake / Area:</span>
                              <span 
                                id="doc-field-target-capacity"
                                className="font-bold text-[#111827]"
                              >
                                {documentResult.extracted_fields?.find(f => f.key === 'capacity' || f.key === 'extent_acres')?.value || selectedPreset?.capacity || '750 Students / 8,500 m²'}
                              </span>
                            </div>

                            <div className="py-2 text-justify leading-relaxed text-slate-800 font-serif">
                              {documentResult.bodyText || selectedPreset?.bodyText || (
                                `This is to certify that the regulatory compliance inspection for the applicant institution has been evaluated 
                                in conformance with AICTE Approval Process Handbook (APH) regulations.`
                              )}
                            </div>
                          </div>

                          <div className="pt-6 mt-4 flex justify-between items-end text-[10px] font-sans border-t border-slate-200 text-slate-500">
                            <div className="space-y-1">
                              <div className="font-semibold text-slate-700">Issued by Competent Scrutiny Cell</div>
                              <div className="font-mono text-slate-800 font-bold">SHA-256: 98f1c8a2...32e182b4</div>
                            </div>
                            <div 
                              id="seal-stamp"
                              className="w-20 h-20 rounded-full border-2 border-dashed border-[#3B6CFF]/60 bg-[#3B6CFF]/[0.03] flex flex-col items-center justify-center text-center p-2 shrink-0 select-none"
                            >
                              <ShieldCheck className="w-5 h-5 text-[#3B6CFF] mb-0.5" />
                              <span className="text-[8px] font-bold text-[#3B6CFF] tracking-wider uppercase leading-tight">
                                AICTE SEAL
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Extracted Bounding Boxes Overlay */}
                      {showBoxes && (
                        <div className="absolute inset-0 pointer-events-none">
                          {documentResult.extracted_fields?.map((field) => {
                            const box = measuredBoxes[field.key] || field.box;
                            if (!box) return null;

                            const leftPct = (box.x / originalWidth) * 100;
                            const topPct = (box.y / originalHeight) * 100;
                            const widthPct = (box.w / originalWidth) * 100;
                            const heightPct = (box.h / originalHeight) * 100;

                            const isHovered = hoveredFieldKey === field.key;
                            const isSelected = selectedFieldKey === field.key;
                            const isPulsing = pulsingFieldKey === field.key;
                            const isHighlighted = isHovered || isSelected;

                            return (
                              <div
                                key={field.key}
                                id={`box-field-${field.key}`}
                                style={{
                                  position: 'absolute',
                                  left: `${leftPct}%`,
                                  top: `${topPct}%`,
                                  width: `${widthPct}%`,
                                  height: `${heightPct}%`,
                                  border: '1.5px solid #3B6CFF',
                                  backgroundColor: isHighlighted ? 'rgba(59, 108, 255, 0.22)' : 'rgba(59, 108, 255, 0.10)',
                                  borderRadius: '2px',
                                  boxShadow: 'none',
                                  pointerEvents: 'auto',
                                  cursor: 'pointer',
                                  transition: 'background-color 150ms ease, transform 180ms ease, border-color 150ms ease',
                                  transform: isPulsing ? 'scale(1.03)' : 'scale(1)',
                                }}
                                className={isPulsing ? 'doc-box-pulsing ring-2 ring-[#3B6CFF] ring-offset-1' : ''}
                                onMouseEnter={() => setHoveredFieldKey(field.key)}
                                onMouseLeave={() => setHoveredFieldKey(null)}
                                onClick={() => handleRowClick(field.key)}
                              >
                                {isHighlighted && (
                                  <div className="absolute -top-7 left-0 bg-[#0F1B33] text-white text-[10px] font-sans font-semibold px-2 py-0.5 rounded shadow-md whitespace-nowrap z-40 pointer-events-none flex items-center space-x-1.5">
                                    <span>{field.label}</span>
                                    <span className="text-[#3B6CFF] font-mono">• {field.confidence}%</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              )}

              {/* Mode B: Extracted Text View */}
              {activeViewMode === 'text' && (
                <div className="bg-surface-2 border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search OCR text..."
                        value={ocrSearchQuery}
                        onChange={(e) => setOcrSearchQuery(e.target.value)}
                        className="w-full h-10 bg-surface border border-border rounded-lg pl-9 pr-3 text-xs text-text placeholder-muted focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <CopyButton
                      text={documentResult?.full_extracted_text || ''}
                      label="Copy Text"
                      copiedLabel="Copied"
                      className="h-10 px-3.5 bg-surface border border-border hover:bg-surface-2 rounded-lg text-xs font-semibold text-text shadow-2xs transition-colors"
                    />
                  </div>

                  <pre className="p-4 bg-surface border border-border rounded-lg text-xs font-mono text-text whitespace-pre-wrap max-h-[500px] overflow-y-auto leading-relaxed" id="ocr-raw-text-view">
                    {ocrSearchQuery
                      ? documentResult.full_extracted_text
                          .split('\n')
                          .filter((l) => l.toLowerCase().includes(ocrSearchQuery.toLowerCase()))
                          .join('\n') || 'No matching lines found.'
                      : documentResult.full_extracted_text}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT Card (40% / xl:col-span-2): Extraction Results Table */}
          <div className="xl:col-span-2 space-y-4" id="doc-intel-right-card">
            {/* Top Block: Document Type & Confidence */}
            <div className="bg-surface rounded-xl border border-border p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Classified Document Type</span>
                  <h3 className="text-base font-semibold text-text mt-0.5" id="doc-intel-doc-type">{documentResult.doc_type}</h3>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                  {Math.round((documentResult.classifier_confidence || 0.96) * 100)}% Conf.
                </span>
              </div>

              {/* Three meta rows: File, Engine, Mean Confidence */}
              <div className="pt-3 border-t border-border grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-muted text-[11px] block font-medium">File</span>
                  <span className="font-mono text-text truncate block mt-0.5" id="doc-intel-filename" title={documentResult.filename}>
                    {documentResult.filename}
                  </span>
                </div>
                <div>
                  <span className="text-muted text-[11px] block font-medium">Engine</span>
                  <span className="font-medium text-text block mt-0.5" id="doc-intel-engine">
                    {documentResult.engine || documentResult.ocr_engine || 'PyMuPDF text layer'}
                  </span>
                </div>
                <div>
                  <span className="text-muted text-[11px] block font-medium">Confidence</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mt-0.5 font-mono" id="doc-intel-confidence">
                    {documentResult.mean_confidence != null ? `${(documentResult.mean_confidence * 100).toFixed(1)}%` : '98.0%'}
                  </span>
                </div>
              </div>

              {/* Technical Details Collapsible */}
              <details className="text-xs group border border-border rounded-lg bg-surface-2/50 px-3 py-2 mt-2">
                <summary className="cursor-pointer font-medium text-muted hover:text-text flex items-center justify-between select-none">
                  <span>Technical Details</span>
                  <span className="text-[11px] text-muted font-mono">Classifier & OCR Engine</span>
                </summary>
                <div className="pt-2 mt-2 border-t border-border space-y-1.5 font-mono text-[11px] text-muted">
                  <div className="flex justify-between">
                    <span>Method:</span>
                    <span className="text-text">{documentResult.classifier_method || 'tf_idf_logistic_regression'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Internal Key:</span>
                    <span className="text-text">{documentResult.doc_type?.toLowerCase().replace(/\s+/g, '_') || 'doc_type'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Pages:</span>
                    <span className="text-text">{documentResult.total_pages || 1}</span>
                  </div>
                </div>
              </details>
            </div>

            {/* Extracted Fields Table: All fields from API response */}
            <div className="bg-surface rounded-xl border border-border shadow-xs overflow-hidden" id="doc-intel-fields-table">
              <div className="px-3.5 py-2.5 bg-surface-2 border-b border-border flex items-center justify-between">
                <span className="text-xs font-semibold text-text flex items-center space-x-1.5">
                  <Crosshair className="w-3.5 h-3.5 text-primary" />
                  <span>Extracted Fields</span>
                </span>
                <span className="text-[11px] font-mono text-muted" id="doc-intel-field-count">
                  {documentResult.extracted_fields?.length || 0} fields
                </span>
              </div>

              {/* Desktop Table View (>= 768px) */}
              <div className="hidden md:block">
                <div className="bg-surface-2/70 text-[11px] font-semibold text-text-muted uppercase border-b border-border px-3.5 py-2 grid grid-cols-[38%_44%_18%] items-center">
                  <div>Field</div>
                  <div>Value</div>
                  <div className="text-right">Conf.</div>
                </div>

                {/* Row Grid */}
                <div className="divide-y divide-border text-text" id="doc-intel-field-rows">
                  {documentResult.extracted_fields?.map((f) => {
                    const isHovered = hoveredFieldKey === f.key;
                    const isSelected = selectedFieldKey === f.key;
                    const isRowActive = isHovered || isSelected;

                    const confBadgeClass = f.confidence >= 95
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : f.confidence >= 90
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';

                    return (
                      <div 
                        key={f.key}
                        id={`table-row-${f.key}`}
                        onClick={() => handleRowClick(f.key)}
                        onMouseEnter={() => setHoveredFieldKey(f.key)}
                        onMouseLeave={() => setHoveredFieldKey(null)}
                        className={`px-3.5 py-2.5 grid grid-cols-[38%_44%_18%] items-center transition-colors cursor-pointer min-h-[48px] ${
                          isRowActive ? 'bg-primary/10 font-semibold' : 'hover:bg-surface-2/50'
                        }`}
                      >
                        <div className="pr-2 min-w-0">
                          <div className="font-semibold text-text truncate text-xs" title={f.label}>{f.label}</div>
                          <div className="text-[10px] font-mono text-text-muted truncate">{f.key}</div>
                        </div>
                        <div className="pr-2 min-w-0">
                          <div className="line-clamp-2 break-words text-xs font-medium text-text leading-snug" title={f.value}>{f.value}</div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center justify-center w-12 py-0.5 rounded text-[11px] font-semibold font-mono ${confBadgeClass}`}>
                            {f.confidence}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Stacked Label/Value Cards (< 768px) */}
              <div className="divide-y divide-border text-text md:hidden" id="doc-intel-field-rows-mobile">
                {documentResult.extracted_fields?.map((f) => {
                  const isHovered = hoveredFieldKey === f.key;
                  const isSelected = selectedFieldKey === f.key;
                  const isRowActive = isHovered || isSelected;

                  const confBadgeClass = f.confidence >= 95
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : f.confidence >= 90
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';

                  return (
                    <div 
                      key={f.key}
                      id={`table-row-mobile-${f.key}`}
                      onClick={() => handleRowClick(f.key)}
                      className={`p-3 space-y-1.5 transition-colors cursor-pointer min-h-[44px] ${
                        isRowActive ? 'bg-primary/10 font-semibold' : 'hover:bg-surface-2/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="font-semibold text-text text-xs">{f.label}</span>
                          <span className="text-[10px] font-mono text-text-muted ml-1.5">({f.key})</span>
                        </div>
                        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-semibold font-mono shrink-0 ${confBadgeClass}`}>
                          {f.confidence}%
                        </span>
                      </div>
                      <div className="text-xs text-text font-medium break-words leading-relaxed">
                        {f.value}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Findings / Review Indicator Callout */}
            {hasFindings && (
              <div className="bg-surface-2 border border-border rounded-xl p-3.5 space-y-2.5 shadow-xs">
                <div className="flex items-start space-x-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-text">Indicator for review detected</h4>
                    <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed font-normal">
                      Extracted fields indicate statutory review required under AICTE Handbook regulations. 
                      Route this document to Evidence Lens for multi-stage determination.
                    </p>
                  </div>
                </div>

                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('evidence-lens')}
                    className="w-full h-11 sm:h-9 min-h-[44px] bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>Send to Evidence Lens</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
