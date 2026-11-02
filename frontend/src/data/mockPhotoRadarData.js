/**
 * Authoritative Mock Photo Radar Clusters & Pair Comparisons Data:
 * - 7 institution nodes (168x72px cards with 40px circular thumbnails)
 * - 6 aggregated pairwise edges (104 shared photo links total across nationwide pool)
 * - Multi-photo strip support for granular per-cluster comparison
 */

export const MOCK_RADAR_PAIRS = [
  {
    id: 'PAIR-LAB-001',
    category: 'Computer Laboratory',
    title: 'Computer Center & AI Workstations Re-use',
    severity: 'CRITICAL',
    ai_wording: 'Indicator for review: Cross-institutional photo reuse detected across 2 institutions',
    similarity_score: 98.4,
    hamming_distance: 1,
    clip_cosine: 0.942,
    match_type: 'Near-Duplicate',
    difference_summary: 'Same computer laboratory photo reused with 3.2% crop and +8% warmer color temperature shift.',
    
    // Original Photo (Historical Submission)
    original_photo: {
      institution_id: 'INST_002',
      institution_name: 'Royal College of Engineering',
      city: 'Mysuru, Karnataka',
      application_no: 'APP-2024-ENG-1102',
      academic_year: '2024-25',
      facility_name: 'Computer Center Lab A (60 Systems)',
      submission_date: '2024-06-12',
      file_name: 'computer_lab_original.jpg',
      image_url: '/images/computer_lab_original.jpg',
      phash: 'a8f0c3d2e1b4a5f6',
      resolution: '1920 x 1080',
      ela_score: 0.22,
      ela_status: 'CLEAN',
    },

    // Near-Duplicate Photo (Current Submission)
    duplicate_photo: {
      institution_id: 'INST_001',
      institution_name: 'Apex Institute of Technology & Science',
      city: 'Bengaluru, Karnataka',
      application_no: 'APP-2025-09812',
      academic_year: '2025-26',
      facility_name: 'High Performance AI Computing Lab',
      submission_date: '2025-10-18',
      file_name: 'computer_lab_reused.jpg',
      image_url: '/images/computer_lab_reused.jpg',
      phash: 'a8f0c3d2e1b4a5f7',
      resolution: '1920 x 1080 (Cropped 3.2%)',
      ela_score: 0.68,
      ela_status: 'SUSPICIOUS_COMPRESSION',
    },

    // Sub-photos in this cluster for thumbnail strip
    shared_photos: [
      {
        id: 'photo-lab-1',
        name: 'Workstation Row 1',
        category: 'Lab Overview',
        similarity: 98.4,
        origUrl: '/images/computer_lab_original.jpg',
        dupUrl: '/images/computer_lab_reused.jpg',
        diffNote: 'Identical monitor layout with cropped foreground edge.'
      },
      {
        id: 'photo-lab-2',
        name: 'Server Rack Bay',
        category: 'Network Rack',
        similarity: 97.6,
        origUrl: '/images/computer_lab_original.jpg',
        dupUrl: '/images/computer_lab_reused.jpg',
        diffNote: 'Exact duplicate server rack framing.'
      },
      {
        id: 'photo-lab-3',
        name: 'Instructor Console',
        category: 'Podium',
        similarity: 96.2,
        origUrl: '/images/computer_lab_original.jpg',
        dupUrl: '/images/computer_lab_reused.jpg',
        diffNote: 'Overlapping projection surface angle.'
      },
      {
        id: 'photo-lab-4',
        name: 'Power Backup Unit',
        category: 'UPS Facility',
        similarity: 95.1,
        origUrl: '/images/computer_lab_original.jpg',
        dupUrl: '/images/computer_lab_reused.jpg',
        diffNote: 'Perceptual hash collision on auxiliary equipment.'
      }
    ]
  },

  {
    id: 'PAIR-CHEM-002',
    category: 'Chemistry / Materials Lab',
    title: 'Chemistry & Environmental Analysis Laboratory',
    severity: 'CRITICAL',
    ai_wording: 'Indicator for review: Concurrent identical laboratory imagery submitted in same cycle',
    similarity_score: 96.2,
    hamming_distance: 2,
    clip_cosine: 0.915,
    match_type: 'Near-Duplicate',
    difference_summary: 'Identical fume hood and workbench setup with cropped foreground apparatus and altered aspect ratio.',

    original_photo: {
      institution_id: 'INST_005',
      institution_name: 'Vanguard Institute of Technology',
      city: 'Hyderabad, Telangana',
      application_no: 'APP-2025-ENG-4491',
      academic_year: '2025-26',
      facility_name: 'Central Chemical Sciences Research Facility',
      submission_date: '2025-09-02',
      file_name: 'chemistry_lab_photo.jpg',
      image_url: '/images/chemistry_lab_photo.jpg',
      phash: '9e2c4f6a8b0c2e4d',
      resolution: '1600 x 1200',
      ela_score: 0.28,
      ela_status: 'CLEAN',
    },

    duplicate_photo: {
      institution_id: 'INST_004',
      institution_name: 'Greenfield Polytechnic & Research',
      city: 'Belagavi, Karnataka',
      application_no: 'APP-2025-POLY-8190',
      academic_year: '2025-26',
      facility_name: 'Applied Chemistry & Polymer Science Lab',
      submission_date: '2025-10-14',
      file_name: 'chemistry_lab_photo.jpg',
      image_url: '/images/chemistry_lab_photo.jpg',
      phash: '9e2c4f6a8b0c2e4f',
      resolution: '1600 x 1200 (Identical Hash)',
      ela_score: 0.31,
      ela_status: 'CLEAN',
    },

    shared_photos: [
      {
        id: 'photo-chem-1',
        name: 'Fume Hood Bay',
        category: 'Exhaust System',
        similarity: 96.2,
        origUrl: '/images/chemistry_lab_photo.jpg',
        dupUrl: '/images/chemistry_lab_photo.jpg',
        diffNote: 'Identical exhaust piping and pressure valve readings.'
      },
      {
        id: 'photo-chem-2',
        name: 'Titration Workbench',
        category: 'Analytical Bench',
        similarity: 95.8,
        origUrl: '/images/chemistry_lab_photo.jpg',
        dupUrl: '/images/chemistry_lab_photo.jpg',
        diffNote: 'Apparatus arrangement matches with 100% feature overlap.'
      },
      {
        id: 'photo-chem-3',
        name: 'Chemical Reagent Vault',
        category: 'Safety Storage',
        similarity: 94.7,
        origUrl: '/images/chemistry_lab_photo.jpg',
        dupUrl: '/images/chemistry_lab_photo.jpg',
        diffNote: 'Hazard warning signage layout identical.'
      }
    ]
  },

  {
    id: 'PAIR-ROBOTICS-003',
    category: 'Robotics & Automation',
    title: 'Robotics & Mechatronics Fabrication Facility',
    severity: 'WARNING',
    ai_wording: 'Indicator for review: Semantic similarity threshold exceeded on specialized lab equipment',
    similarity_score: 89.8,
    hamming_distance: 5,
    clip_cosine: 0.884,
    match_type: 'Semantically Similar',
    difference_summary: 'Robotics arm assembly with overlapping background equipment; distinct angle of capture.',

    original_photo: {
      institution_id: 'INST_001',
      institution_name: 'Apex Institute of Technology & Science',
      city: 'Bengaluru, Karnataka',
      application_no: 'APP-2025-09812',
      academic_year: '2025-26',
      facility_name: 'Mechatronics & Robotics Cell',
      submission_date: '2025-10-18',
      file_name: 'robotics_lab_original.jpg',
      image_url: '/images/robotics_lab_original.jpg',
      phash: 'f1e2d3c4b5a69788',
      resolution: '1920 x 1080',
      ela_score: 0.25,
      ela_status: 'CLEAN',
    },

    duplicate_photo: {
      institution_id: 'INST_003',
      institution_name: 'Zenith Institute of Technology',
      city: 'Pune, Maharashtra',
      application_no: 'APP-2025-MAH-3012',
      academic_year: '2025-26',
      facility_name: 'Automated Manufacturing Lab',
      submission_date: '2025-08-25',
      file_name: 'robotics_lab_reused.jpg',
      image_url: '/images/robotics_lab_reused.jpg',
      phash: 'f1e2d3c4b5a6978d',
      resolution: '1920 x 1080',
      ela_score: 0.34,
      ela_status: 'CLEAN',
    },

    shared_photos: [
      {
        id: 'photo-rob-1',
        name: 'Robotic Arm Cell',
        category: 'Manipulator',
        similarity: 89.8,
        origUrl: '/images/robotics_lab_original.jpg',
        dupUrl: '/images/robotics_lab_reused.jpg',
        diffNote: 'Industrial robotic manipulator model match with altered angle.'
      },
      {
        id: 'photo-rob-2',
        name: 'PLC Test Bench',
        category: 'Controllers',
        similarity: 88.5,
        origUrl: '/images/robotics_lab_original.jpg',
        dupUrl: '/images/robotics_lab_reused.jpg',
        diffNote: 'Identical control cabinet wiring harness visible.'
      }
    ]
  },

  {
    id: 'PAIR-ELEC-004',
    category: 'Electronics & Microprocessor',
    title: 'Microprocessor & VLSI Design Laboratory',
    severity: 'CRITICAL',
    ai_wording: 'Indicator for review: Exact perceptual hash match detected across institutions',
    similarity_score: 99.1,
    hamming_distance: 0,
    clip_cosine: 0.988,
    match_type: 'Exact Hash Duplicate',
    difference_summary: 'Bit-identical photographic asset re-uploaded across applications with stripped EXIF metadata.',

    original_photo: {
      institution_id: 'INST_002',
      institution_name: 'Royal College of Engineering',
      city: 'Mysuru, Karnataka',
      application_no: 'APP-2024-ENG-1102',
      academic_year: '2024-25',
      facility_name: 'Embedded Systems Laboratory',
      submission_date: '2024-06-12',
      file_name: 'electronics_lab_original.jpg',
      image_url: '/images/electronics_lab_original.jpg',
      phash: 'b3f1e9d2c4a87612',
      resolution: '1920 x 1080',
      ela_score: 0.19,
      ela_status: 'CLEAN',
    },

    duplicate_photo: {
      institution_id: 'INST_007',
      institution_name: 'Metro Institute of Technology',
      city: 'Chennai, Tamil Nadu',
      application_no: 'APP-2025-TN-9988',
      academic_year: '2025-26',
      facility_name: 'Advanced Microcontroller Research Facility',
      submission_date: '2025-10-22',
      file_name: 'electronics_lab_reused.jpg',
      image_url: '/images/electronics_lab_reused.jpg',
      phash: 'b3f1e9d2c4a87612',
      resolution: '1920 x 1080',
      ela_score: 0.72,
      ela_status: 'SUSPICIOUS_COMPRESSION',
    },

    shared_photos: [
      {
        id: 'photo-elec-1',
        name: 'Oscilloscope Stations',
        category: 'Test Instrumentation',
        similarity: 99.1,
        origUrl: '/images/electronics_lab_original.jpg',
        dupUrl: '/images/electronics_lab_reused.jpg',
        diffNote: 'Exact perceptual hash match.'
      },
      {
        id: 'photo-elec-2',
        name: 'FPGA Development Boards',
        category: 'Hardware Workstations',
        similarity: 98.2,
        origUrl: '/images/electronics_lab_original.jpg',
        dupUrl: '/images/electronics_lab_reused.jpg',
        diffNote: 'Exact duplicate layout.'
      }
    ]
  },

  {
    id: 'PAIR-MFG-005',
    category: 'Mechanical Engineering',
    title: 'Advanced Automated Manufacturing Cell',
    severity: 'WARNING',
    ai_wording: 'Indicator for review: Feature similarity across institutional workshop photos',
    similarity_score: 87.2,
    hamming_distance: 6,
    clip_cosine: 0.865,
    match_type: 'Semantically Similar',
    difference_summary: 'CNC lathe machine bed with matched safety enclosure; distinct ambient workshop background.',

    original_photo: {
      institution_id: 'INST_003',
      institution_name: 'Zenith Institute of Technology',
      city: 'Pune, Maharashtra',
      application_no: 'APP-2025-MAH-3012',
      academic_year: '2025-26',
      facility_name: 'Precision Machining Center',
      submission_date: '2025-08-25',
      file_name: 'mechanical_workshop_original.jpg',
      image_url: '/images/mechanical_workshop_original.jpg',
      phash: 'c4e5d6a7b8091234',
      resolution: '1920 x 1080',
      ela_score: 0.29,
      ela_status: 'CLEAN',
    },

    duplicate_photo: {
      institution_id: 'INST_005',
      institution_name: 'Vanguard Institute of Technology',
      city: 'Hyderabad, Telangana',
      application_no: 'APP-2025-ENG-4491',
      academic_year: '2025-26',
      facility_name: 'Automated Tooling Facility',
      submission_date: '2025-09-02',
      file_name: 'mechanical_workshop_reused.jpg',
      image_url: '/images/mechanical_workshop_reused.jpg',
      phash: 'c4e5d6a7b8091240',
      resolution: '1920 x 1080',
      ela_score: 0.35,
      ela_status: 'CLEAN',
    },

    shared_photos: [
      {
        id: 'photo-mfg-1',
        name: '5-Axis CNC Milling Bed',
        category: 'Machine Tool',
        similarity: 87.2,
        origUrl: '/images/mechanical_workshop_original.jpg',
        dupUrl: '/images/mechanical_workshop_reused.jpg',
        diffNote: 'Manufacturer tooling decal identical.'
      }
    ]
  },

  {
    id: 'PAIR-OPTICS-006',
    category: 'Physics & Optics',
    title: 'Physics & Optics Experimental Facility',
    severity: 'WARNING',
    ai_wording: 'Indicator for review: Shared optical isolation table imagery detected',
    similarity_score: 91.5,
    hamming_distance: 4,
    clip_cosine: 0.902,
    match_type: 'Near-Duplicate',
    difference_summary: 'Laser interferometer bench on optical isolation table; slight contrast augmentation detected.',

    original_photo: {
      institution_id: 'INST_001',
      institution_name: 'Apex Institute of Technology & Science',
      city: 'Bengaluru, Karnataka',
      application_no: 'APP-2025-09812',
      academic_year: '2025-26',
      facility_name: 'Advanced Laser & Photonics Lab',
      submission_date: '2025-10-18',
      file_name: 'physics_optics_original.jpg',
      image_url: '/images/physics_optics_original.jpg',
      phash: '8a9b0c1d2e3f4a5b',
      resolution: '1920 x 1080',
      ela_score: 0.27,
      ela_status: 'CLEAN',
    },

    duplicate_photo: {
      institution_id: 'INST_007',
      institution_name: 'Metro Institute of Technology',
      city: 'Chennai, Tamil Nadu',
      application_no: 'APP-2025-TN-9988',
      academic_year: '2025-26',
      facility_name: 'Engineering Physics Research Center',
      submission_date: '2025-10-22',
      file_name: 'physics_optics_reused.jpg',
      image_url: '/images/physics_optics_reused.jpg',
      phash: '8a9b0c1d2e3f4a5f',
      resolution: '1920 x 1080',
      ela_score: 0.44,
      ela_status: 'CLEAN',
    },

    shared_photos: [
      {
        id: 'photo-opt-1',
        name: 'Interferometer Bench',
        category: 'Optical Table',
        similarity: 91.5,
        origUrl: '/images/physics_optics_original.jpg',
        dupUrl: '/images/physics_optics_reused.jpg',
        diffNote: 'Isolation leg vibration dampeners match.'
      }
    ]
  }
];

/**
 * 7 Authoritative Institution Nodes for vis-network:
 * Each represents an institution with image thumbnail, city, and shared photo count.
 */
export const MOCK_RADAR_GRAPH = {
  nodes: [
    {
      id: 'INST_001',
      name: 'Apex Institute of Technology & Science',
      shortNameLine1: 'Apex Institute of',
      shortNameLine2: 'Tech & Science',
      label: 'Apex Institute of Tech & Science',
      city: 'Bengaluru, KA',
      sharedCount: 24,
      isConflict: true,
      thumbnail: '/images/computer_lab_reused.jpg',
      application_no: 'APP-2025-09812',
      x: 230,
      y: -30,
      fixed: { x: true, y: true },
    },
    {
      id: 'INST_002',
      name: 'Royal College of Engineering',
      shortNameLine1: 'Royal College of',
      shortNameLine2: 'Engineering',
      label: 'Royal College of Engineering',
      city: 'Mysuru, KA',
      sharedCount: 24,
      isConflict: true,
      thumbnail: '/images/computer_lab_original.jpg',
      application_no: 'APP-2024-ENG-1102',
      x: 350,
      y: 140,
      fixed: { x: true, y: true },
    },
    {
      id: 'INST_003',
      name: 'Zenith Institute of Technology',
      shortNameLine1: 'Zenith Institute',
      shortNameLine2: 'of Technology',
      label: 'Zenith Institute of Tech',
      city: 'Pune, MH',
      sharedCount: 12,
      isWarning: true,
      thumbnail: '/images/robotics_lab_original.jpg',
      application_no: 'APP-2025-MAH-3012',
      x: -10,
      y: 70,
      fixed: { x: true, y: true },
    },
    {
      id: 'INST_004',
      name: 'Greenfield Polytechnic & Research',
      shortNameLine1: 'Greenfield',
      shortNameLine2: 'Polytechnic',
      label: 'Greenfield Polytechnic',
      city: 'Belagavi, KA',
      sharedCount: 16,
      isConflict: true,
      thumbnail: '/images/chemistry_lab_photo.jpg',
      application_no: 'APP-2025-POLY-8190',
      x: -240,
      y: -10,
      fixed: { x: true, y: true },
    },
    {
      id: 'INST_005',
      name: 'Vanguard Institute of Technology',
      shortNameLine1: 'Vanguard Inst.',
      shortNameLine2: 'of Technology',
      label: 'Vanguard Institute of Tech',
      city: 'Hyderabad, TS',
      sharedCount: 16,
      isConflict: true,
      thumbnail: '/images/mechanical_workshop_original.jpg',
      application_no: 'APP-2025-ENG-4491',
      x: -20,
      y: -200,
      fixed: { x: true, y: true },
    },
    {
      id: 'INST_006',
      name: 'National Institute of Design & Tech',
      shortNameLine1: 'National Inst.',
      shortNameLine2: 'of Design & Tech',
      label: 'National Design Institute',
      city: 'Bengaluru, KA',
      sharedCount: 0,
      isClean: true,
      thumbnail: '/images/INST_006_distinct_solar_rooftop.jpg',
      application_no: 'APP-2025-KA-0012',
      x: 160,
      y: -130,
      fixed: { x: true, y: true },
    },
    {
      id: 'INST_007',
      name: 'Metro Institute of Technology',
      shortNameLine1: 'Metro Institute',
      shortNameLine2: 'of Technology',
      label: 'Metro Institute of Tech',
      city: 'Chennai, TN',
      sharedCount: 12,
      isConflict: true,
      thumbnail: '/images/electronics_lab_original.jpg',
      application_no: 'APP-2025-TN-9988',
      x: 90,
      y: 190,
      fixed: { x: true, y: true },
    },
  ],

  /**
   * Exactly 6 aggregated edges connecting institution pairs:
   * Total shared photo links: 24 + 16 + 12 + 18 + 14 + 20 = 104 links
   */
  edges: [
    {
      id: 'EDGE_001_002',
      from: 'INST_001',
      to: 'INST_002',
      pairId: 'PAIR-LAB-001',
      sharedCount: 24,
      maxSimilarity: 98.4,
      label: '24 photos • 98.4%',
    },
    {
      id: 'EDGE_004_005',
      from: 'INST_004',
      to: 'INST_005',
      pairId: 'PAIR-CHEM-002',
      sharedCount: 16,
      maxSimilarity: 96.2,
      label: '16 photos • 96.2%',
    },
    {
      id: 'EDGE_001_003',
      from: 'INST_001',
      to: 'INST_003',
      pairId: 'PAIR-ROBOTICS-003',
      sharedCount: 12,
      maxSimilarity: 89.8,
      label: '12 photos • 89.8%',
    },
    {
      id: 'EDGE_002_007',
      from: 'INST_002',
      to: 'INST_007',
      pairId: 'PAIR-ELEC-004',
      sharedCount: 18,
      maxSimilarity: 99.1,
      label: '18 photos • 99.1%',
    },
    {
      id: 'EDGE_003_005',
      from: 'INST_003',
      to: 'INST_005',
      pairId: 'PAIR-MFG-005',
      sharedCount: 14,
      maxSimilarity: 87.2,
      label: '14 photos • 87.2%',
    },
    {
      id: 'EDGE_001_007',
      from: 'INST_001',
      to: 'INST_007',
      pairId: 'PAIR-OPTICS-006',
      sharedCount: 20,
      maxSimilarity: 91.5,
      label: '20 photos • 91.5%',
    },
  ],
};

export const SIMULATED_UPLOAD_PAYLOAD = {
  institution_id: 'INST_007',
  institution_name: 'Metro Institute of Technology',
  city: 'Chennai, Tamil Nadu',
  application_no: 'APP-2025-TN-9988',
  photo_name: 'computer_lab_reused.jpg',
  category: 'Computer Laboratory',
  image_url: '/images/computer_lab_reused.jpg',
  phash: 'a8f0c3d2e1b4a5f6',
  match_target_inst: 'INST_002',
  similarity_score: 99.1,
  hamming_distance: 0,
  match_type: 'Exact Hash Duplicate',
};
