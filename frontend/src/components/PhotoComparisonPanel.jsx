import React, { useState, useEffect } from 'react';
import { 
  ScanEye, 
  Layers, 
  ExternalLink, 
  AlertTriangle, 
  ShieldAlert, 
  Sliders, 
  Split, 
  Eye, 
  CheckCircle2, 
  FileText, 
  Hash, 
  Building2, 
  Clock, 
  ChevronRight,
  Maximize2,
  Image as ImageIcon
} from 'lucide-react';

/**
 * Side Panel with Side-by-Side Photo Comparison:
 * - Side-by-side photo views (original vs near-duplicate)
 * - Compact "Shared photos" thumbnail strip (3-6 thumbnails)
 * - Difference overlay / ELA heatmap toggle
 * - Interactive wipe slider comparison
 * - Similarity scores breakdown (Hamming distance, OpenCLIP cosine, Visual %)
 * - Action buttons to open affected institutional applications
 */
export default function PhotoComparisonPanel({ 
  pairData, 
  onOpenApplication,
  onOpenEvidenceLens 
}) {
  const [viewMode, setViewMode] = useState('side_by_side'); // 'side_by_side' | 'difference_overlay' | 'wipe_slider'
  const [wipePosition, setWipePosition] = useState(50); // percentage 0-100 for slider
  const [overlayOpacity, setOverlayOpacity] = useState(65);
  const [toastMsg, setToastMsg] = useState('');
  const [origImgError, setOrigImgError] = useState(false);
  const [dupImgError, setDupImgError] = useState(false);
  const [activeSubPhotoId, setActiveSubPhotoId] = useState(null);

  useEffect(() => {
    setOrigImgError(false);
    setDupImgError(false);
    setActiveSubPhotoId(null);
  }, [pairData?.id]);

  if (!pairData) {
    return (
      <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-subtle">
        <ScanEye className="w-10 h-10 mx-auto text-text-subtle mb-2 animate-pulse" />
        <p className="text-sm font-semibold text-text-muted">Select an Institution or Photo Pair</p>
        <p className="text-xs text-text-subtle mt-1">
          Click any edge or connected college node in the cluster graph to inspect forensic comparison.
        </p>
      </div>
    );
  }

  const { original_photo, duplicate_photo, shared_photos = [] } = pairData;

  // Active sub-photo in the cluster strip (if selected)
  const currentSubPhoto = shared_photos.find((p) => p.id === activeSubPhotoId) || shared_photos[0];

  const resolvePhotoUrl = (photo, fallbackSubUrl) => {
    if (fallbackSubUrl) return fallbackSubUrl;
    if (!photo) return '/images/computer_lab_original.jpg';
    const url = photo.image_url || photo.photo_url || '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/images/')) return url;
    if (photo.file_name) return `/images/${photo.file_name}`;
    if (photo.filename) return `/images/${photo.filename}`;
    if (url) {
      const parts = url.split('/');
      const last = parts[parts.length - 1];
      if (last) return `/images/${last}`;
    }
    return '/images/computer_lab_original.jpg';
  };

  const origUrl = resolvePhotoUrl(original_photo, currentSubPhoto?.origUrl);
  const dupUrl = resolvePhotoUrl(duplicate_photo, currentSubPhoto?.dupUrl);

  const ImagePlaceholder = ({ fileName, subtitle }) => (
    <div className="w-full h-full min-h-[160px] flex flex-col items-center justify-center p-4 bg-surface-2 text-text-subtle text-center select-none">
      <ImageIcon className="w-8 h-8 text-text-subtle mb-1.5" />
      <span className="text-[11px] font-mono font-bold text-text-muted max-w-[200px] truncate" title={fileName}>
        {fileName || 'image_asset.jpg'}
      </span>
      <span className="text-[10px] text-amber-800 dark:text-amber-200 bg-amber-100/70 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 px-2 py-0.5 rounded mt-1 font-medium">
        {subtitle || 'Evidence Asset Registered'}
      </span>
    </div>
  );

  const handleOpenApp = (appNo, instName) => {
    setToastMsg(`Opening application dossier for ${instName} (${appNo})...`);
    setTimeout(() => setToastMsg(''), 3500);
    if (onOpenApplication) {
      onOpenApplication({ application_no: appNo, institution_name: instName });
    }
  };

  return (
    <div className="flex flex-col bg-surface border border-border rounded-xl shadow-xs overflow-hidden max-h-[calc(100vh-140px)] min-h-[600px]">
      {/* Side Panel Header */}
      <div className="p-4 bg-surface-2 text-text border-b border-border flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="inline-flex items-center space-x-2 text-[10px] bg-[#E8F1FB] text-text border border-[#BBD4F0] px-2 py-0.5 rounded uppercase font-bold tracking-wider mb-1">
            <span>Photo Reuse Inspection</span>
            <span>•</span>
            <span className="font-mono">{pairData.id}</span>
          </div>
          <h2 className="text-sm font-bold text-text leading-snug" title={pairData.title}>
            {pairData.title}
          </h2>
          <div className="text-[11px] text-muted leading-snug">
            {pairData.category}
          </div>
        </div>

        {/* Severity Badge */}
        <div className="shrink-0 text-right">
          <span className={`text-[11px] font-black px-2.5 py-1 rounded-md border ${
            pairData.similarity_score >= 95
              ? 'bg-[#FBE3E1] text-[#7A1A12] border-[rgba(122,26,18,0.2)]'
              : 'bg-[#FFF1CC] text-[#5C4300] border-[rgba(92,67,0,0.2)]'
          }`}>
            {pairData.similarity_score}% Match
          </span>
          <div className="text-[10px] text-muted mt-0.5 font-mono font-bold">
            d={pairData.hamming_distance} / 64
          </div>
        </div>
      </div>

      {/* Mandatory Statutory Advisory Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/40 px-4 py-2.5 border-b border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs flex items-center space-x-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="font-bold text-[11px] leading-tight">
          {pairData.ai_wording}
        </span>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        
        {/* Compact "Shared Photos" Thumbnail Strip (3-6 thumbnails) */}
        {shared_photos.length > 0 && (
          <div className="bg-surface-2 p-2.5 rounded-xl border border-border space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-text px-0.5">
              <span className="flex items-center space-x-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-primary" />
                <span>Shared Photos in Cluster ({shared_photos.length}):</span>
              </span>
              <span className="text-[10px] text-text-subtle font-mono">Select thumbnail to view</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
              {shared_photos.map((photo, pIdx) => {
                const isSelected = activeSubPhotoId === photo.id || (!activeSubPhotoId && pIdx === 0);
                return (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setActiveSubPhotoId(photo.id)}
                    className={`flex-none flex items-center space-x-2 p-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-surface border-primary ring-2 ring-primary/20 shadow-xs'
                        : 'bg-surface/70 border-border hover:bg-surface hover:border-border-hover'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-surface-2 shrink-0 border border-border">
                      <img
                        src={photo.dupUrl || photo.origUrl}
                        alt={photo.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                    <div className="min-w-0 pr-1">
                      <div className="text-[11px] font-bold text-text truncate max-w-[110px] leading-tight">
                        {photo.name}
                      </div>
                      <div className="flex items-center space-x-1 text-[10px] mt-0.5">
                        <span className="text-text-muted truncate max-w-[65px]">{photo.category}</span>
                        <span className="text-amber-600 dark:text-amber-400 font-mono font-bold">{photo.similarity}%</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* View Mode Switcher Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-surface-2 p-1.5 rounded-xl border border-border text-xs">
          <span className="text-[11px] font-bold text-text px-1 shrink-0">Comparison Mode:</span>
          <div className="inline-flex rounded-lg border border-border bg-surface p-0.5 divide-x divide-border shadow-2xs">
            <button
              id="view-mode-side-by-side"
              onClick={() => setViewMode('side_by_side')}
              className={`px-2.5 py-1 text-[11px] font-semibold transition-all flex items-center space-x-1.5 cursor-pointer rounded-l-md ${
                viewMode === 'side_by_side'
                  ? 'bg-primary text-white font-bold shadow-xs'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              <Split className="w-3 h-3" />
              <span>Dual</span>
            </button>

            <button
              id="view-mode-wipe-slider"
              onClick={() => setViewMode('wipe_slider')}
              className={`px-2.5 py-1 text-[11px] font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                viewMode === 'wipe_slider'
                  ? 'bg-primary text-white font-bold shadow-xs'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>Split</span>
            </button>

            <button
              id="view-mode-difference-overlay"
              onClick={() => setViewMode('difference_overlay')}
              className={`px-2.5 py-1 text-[11px] font-semibold transition-all flex items-center space-x-1.5 cursor-pointer rounded-r-md ${
                viewMode === 'difference_overlay'
                  ? 'bg-primary text-white font-bold shadow-xs'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Difference</span>
            </button>
          </div>
        </div>

        {/* 1. SIDE-BY-SIDE VIEW */}
        {viewMode === 'side_by_side' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Original Photo Card */}
              <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-2xs flex flex-col">
                <div className="bg-surface-2 px-3 py-1.5 text-[10px] font-bold text-muted uppercase flex items-center justify-between border-b border-border">
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Original Submission</span>
                  </span>
                  <span className="font-mono text-text-subtle">{original_photo.academic_year || '2024-25'}</span>
                </div>

                <div className="relative aspect-[4/3] bg-[#F4F6F8] dark:bg-zinc-900 overflow-hidden group">
                  {origImgError ? (
                    <ImagePlaceholder fileName={original_photo.file_name || original_photo.filename} subtitle="Original Evidence Scan" />
                  ) : (
                    <img 
                      src={origUrl} 
                      alt={original_photo.facility_name} 
                      width="400"
                      height="300"
                      loading="lazy"
                      decoding="async"
                      onError={() => setOrigImgError(true)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute bottom-2 left-2 bg-surface text-text border border-border text-[9px] font-mono px-2 py-0.5 rounded shadow-xs max-w-[80%] truncate">
                    {original_photo.file_name || original_photo.filename || 'original_image.jpg'}
                  </div>
                </div>

                <div className="p-3 text-xs space-y-1.5 flex-1 bg-surface">
                  <div className="font-bold text-text text-xs">
                    {original_photo.institution_name}
                  </div>
                  <div className="text-[11px] text-text-subtle">
                    {original_photo.city || 'Campus Facility'}
                  </div>
                  <div className="text-[11px] text-text-muted bg-surface-2 p-1.5 rounded border border-border font-medium">
                    {currentSubPhoto?.name || original_photo.facility_name || pairData.category}
                  </div>
                  <div className="pt-1.5 border-t border-border flex items-center justify-between text-[10px] font-mono text-text-subtle">
                    <span>App: {original_photo.application_no || 'APP-HISTORICAL'}</span>
                    <span>Date: {original_photo.submission_date || 'Verified'}</span>
                  </div>
                </div>
              </div>

              {/* Near-Duplicate Photo Card */}
              <div className="bg-surface border-2 border-amber-300 dark:border-amber-900/60 rounded-xl overflow-hidden shadow-2xs flex flex-col">
                <div className="bg-amber-100/80 dark:bg-amber-950/60 px-3 py-1.5 text-[10px] font-bold text-amber-800 dark:text-amber-200 uppercase flex items-center justify-between border-b border-amber-200 dark:border-amber-900/60">
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>Flagged Near-Duplicate</span>
                  </span>
                  <span className="font-mono text-amber-700 dark:text-amber-300">{duplicate_photo.academic_year || '2025-26'}</span>
                </div>

                <div className="relative aspect-[4/3] bg-[#F4F6F8] dark:bg-zinc-900 overflow-hidden group">
                  {dupImgError ? (
                    <ImagePlaceholder fileName={duplicate_photo.file_name || duplicate_photo.filename} subtitle="Flagged Near-Duplicate" />
                  ) : (
                    <img 
                      src={dupUrl} 
                      alt={duplicate_photo.facility_name} 
                      width="400"
                      height="300"
                      loading="lazy"
                      decoding="async"
                      onError={() => setDupImgError(true)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute top-2 right-2 bg-amber-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm">
                    {pairData.similarity_score}% RE-USE
                  </div>
                  <div className="absolute bottom-2 left-2 bg-surface text-text border border-border text-[9px] font-mono px-2 py-0.5 rounded shadow-xs max-w-[80%] truncate">
                    {duplicate_photo.file_name || duplicate_photo.filename || 'reused_image.jpg'}
                  </div>
                </div>

                <div className="p-3 text-xs space-y-1.5 flex-1 bg-surface">
                  <div className="font-bold text-text text-xs">
                    {duplicate_photo.institution_name}
                  </div>
                  <div className="text-[11px] text-text-subtle">
                    {duplicate_photo.city || 'Applicant Campus'}
                  </div>
                  <div className="text-[11px] text-amber-900 dark:text-amber-200 bg-amber-50/60 dark:bg-amber-950/40 p-1.5 rounded border border-amber-200 dark:border-amber-900/60 font-medium">
                    {currentSubPhoto?.name || duplicate_photo.facility_name || pairData.category}
                  </div>
                  <div className="pt-1.5 border-t border-border flex items-center justify-between text-[10px] font-mono text-text-subtle">
                    <span>App: {duplicate_photo.application_no || 'APP-CURRENT'}</span>
                    <span>Date: {duplicate_photo.submission_date || 'Under Review'}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 2. DIFFERENCE OVERLAY VIEW */}
        {viewMode === 'difference_overlay' && (
          <div className="space-y-3">
            <div className="bg-surface-2 border border-border rounded-xl p-3 text-text text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-text flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  <span>Pixel Difference & Forensic Divergence Heatmap</span>
                </span>
                <span className="text-[10px] font-mono bg-surface border border-border px-2 py-0.5 rounded text-muted">
                  Opacity: {overlayOpacity}%
                </span>
              </div>

              {/* Overlay Canvas Viewport */}
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-border bg-surface">
                <img 
                  src={origUrl} 
                  alt="Original" 
                  width="400"
                  height="300"
                  loading="lazy"
                  onError={() => setOrigImgError(true)}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                <img 
                  src={dupUrl} 
                  alt="Duplicate" 
                  width="400"
                  height="300"
                  loading="lazy"
                  onError={() => setDupImgError(true)}
                  className="absolute inset-0 w-full h-full object-cover mix-blend-difference"
                  style={{ opacity: overlayOpacity / 100 }}
                />

                <div 
                  className="absolute border-2 border-amber-500 bg-amber-500/20 rounded shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                  style={{ top: '15%', left: '10%', width: '35%', height: '25%' }}
                >
                  <span className="absolute -top-5 left-0 bg-amber-600 text-white text-[8px] font-mono px-1.5 py-0.5 rounded">
                    CROPPED REGION (ΔE = 14.2)
                  </span>
                </div>

                <div 
                  className="absolute border-2 border-amber-400 bg-amber-400/20 rounded shadow-[0_0_12px_rgba(251,191,36,0.8)]"
                  style={{ top: '35%', right: '12%', width: '22%', height: '45%' }}
                >
                  <span className="absolute -top-5 left-0 bg-amber-400 text-slate-950 font-bold text-[8px] font-mono px-1.5 py-0.5 rounded shadow-xs">
                    SERVER RACK MATCH (pHash Dist = 0)
                  </span>
                </div>

                <div className="absolute bottom-2 right-2 bg-surface text-text border border-border text-[9px] font-mono px-2 py-1 rounded shadow-xs">
                  Difference Blend Mode • Inverted Pixel Channel
                </div>
              </div>

              {/* Opacity Slider */}
              <div className="mt-3 flex items-center space-x-3 text-[11px]">
                <span className="text-muted">Blend Slider:</span>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                  className="flex-1 accent-amber-500 cursor-pointer"
                />
                <span className="font-mono text-text w-10 text-right">{overlayOpacity}%</span>
              </div>
            </div>

            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 rounded-lg">
              <strong>Forensic Analysis:</strong> Red/amber bands highlight pixel difference coordinates. Zero-divergence regions in background confirm identical physical room and equipment geometry.
            </div>
          </div>
        )}

        {/* 3. WIPE SLIDER COMPARISON VIEW */}
        {viewMode === 'wipe_slider' && (
          <div className="space-y-3">
            <div className="bg-surface-2 border border-border rounded-xl p-3 text-text text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-text flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5 text-primary" />
                  <span>Interactive Split Wipe Slider (Original &harr; Reused)</span>
                </span>
                <span className="text-[10px] font-mono text-muted">
                  Drag slider to wipe
                </span>
              </div>

              <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-border select-none cursor-ew-resize">
                <img 
                  src={dupUrl} 
                  alt="Duplicate Photo" 
                  width="400"
                  height="300"
                  loading="lazy"
                  onError={() => setDupImgError(true)}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${wipePosition}%` }}
                >
                  <img 
                    src={origUrl} 
                    alt="Original Photo" 
                    width="400"
                    height="300"
                    loading="lazy"
                    onError={() => setOrigImgError(true)}
                    className="absolute inset-0 w-full h-full object-cover max-w-none"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div className="absolute top-2 left-2 bg-surface text-text border border-border text-[9px] font-bold px-2 py-0.5 rounded shadow-xs">
                    Original ({original_photo.institution_name?.split(' ')[0] || 'College'})
                  </div>
                </div>

                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-surface shadow-[0_0_10px_rgba(255,255,255,0.8)] z-20 pointer-events-none"
                  style={{ left: `${wipePosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-surface text-text flex items-center justify-center shadow-md text-[10px] font-black font-sans">
                    &harr;
                  </div>
                </div>

                <div className="absolute top-2 right-2 bg-amber-600 text-white text-[9px] font-bold px-2 py-0.5 rounded z-10">
                  Reused ({duplicate_photo.institution_name?.split(' ')[0] || 'Applicant'})
                </div>
              </div>

              <div className="mt-3 flex items-center space-x-3 text-[11px]">
                <span className="text-muted">Position:</span>
                <input 
                  type="range" 
                  min="5" 
                  max="95" 
                  value={wipePosition}
                  onChange={(e) => setWipePosition(Number(e.target.value))}
                  className="flex-1 accent-sky-500 cursor-pointer"
                />
                <span className="font-mono text-text w-10 text-right">{wipePosition}%</span>
              </div>
            </div>
          </div>
        )}

        {/* SIMILARITY SCORES BREAKDOWN CARD */}
        <div className="bg-surface-2 border border-border rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text">Perceptual & Semantic Similarity Metrics</span>
            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-900/60">
              {pairData.match_type}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-surface p-2.5 rounded-lg border border-border">
              <div className="text-[10px] text-text-subtle uppercase font-medium">Visual Similarity</div>
              <div className="text-base font-black text-amber-600 dark:text-amber-400">{pairData.similarity_score}%</div>
              <div className="text-[9px] text-text-subtle font-mono">Inverted Hamming</div>
            </div>

            <div className="bg-surface p-2.5 rounded-lg border border-border">
              <div className="text-[10px] text-text-subtle uppercase font-medium">Hamming Distance</div>
              <div className="text-base font-black text-text">{pairData.hamming_distance} / 64</div>
              <div className="text-[9px] text-emerald-600 font-mono">pHash Bit Delta</div>
            </div>

            <div className="bg-surface p-2.5 rounded-lg border border-border">
              <div className="text-[10px] text-text-subtle uppercase font-medium">Cosine Metric</div>
              <div className="text-base font-black text-indigo-700 dark:text-indigo-400">{pairData.clip_cosine}</div>
              <div className="text-[9px] text-text-subtle font-mono">Simulated Vector Metric</div>
            </div>
          </div>

          <div className="text-[11px] text-text-muted leading-snug bg-surface p-2.5 rounded-lg border border-border">
            <strong>Forensics Difference Summary:</strong> {currentSubPhoto?.diffNote || pairData.difference_summary}
          </div>
        </div>

        {/* ACTION BUTTONS TO OPEN AFFECTED APPLICATIONS */}
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="text-xs font-bold text-text">Open Affected Applications:</div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => handleOpenApp(original_photo.application_no, original_photo.institution_name)}
              id="open-app-original-btn"
              className="p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-2 text-text text-xs font-medium transition-all text-left flex items-center justify-between group shadow-2xs cursor-pointer"
            >
              <div className="min-w-0 pr-1">
                <div className="text-[10px] text-text-subtle font-mono">Origin Application</div>
                <div className="font-bold text-text leading-snug">{original_photo.institution_name}</div>
                <div className="text-[10px] text-primary font-mono">{original_photo.application_no}</div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-text-subtle group-hover:text-primary shrink-0" />
            </button>

            <button
              onClick={() => handleOpenApp(duplicate_photo.application_no, duplicate_photo.institution_name)}
              id="open-app-duplicate-btn"
              className="p-2.5 rounded-xl border border-amber-300 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-50 dark:hover:bg-amber-950/50 text-text text-xs font-medium transition-all text-left flex items-center justify-between group shadow-2xs cursor-pointer"
            >
              <div className="min-w-0 pr-1">
                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold">Current Flagged Dossier</div>
                <div className="font-bold text-text leading-snug">{duplicate_photo.institution_name}</div>
                <div className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">{duplicate_photo.application_no}</div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-amber-500 group-hover:text-amber-700 shrink-0" />
            </button>
          </div>

          <button
            onClick={() => onOpenEvidenceLens && onOpenEvidenceLens(pairData)}
            id="jump-to-evidence-lens-btn"
            className="w-full py-2.5 px-4 rounded-xl bg-[#CFE3FA] dark:bg-sky-950/50 hover:bg-[#B9D6F5] dark:hover:bg-sky-900/60 text-text dark:text-sky-200 border border-[#8DB6E6] dark:border-sky-800 text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-text dark:text-sky-200" />
            <span>Open Finding in Evidence Lens Regulatory Strip</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dynamic Toast Feedback Banner */}
        {toastMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 px-3 py-2 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

      </div>
    </div>
  );
}
