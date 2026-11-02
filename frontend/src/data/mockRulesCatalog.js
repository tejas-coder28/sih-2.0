/**
 * Authoritative AICTE Approval Process Handbook (APH) 2025-26 Rules Catalog Baseline:
 * Standardized Regulation-as-Code definitions for offline fallback & client-side governance inspection.
 */
export const FALLBACK_APH_RULES = [
  {
    id: "RULE_FIRE_NOC_VALIDITY",
    rule_code: "APH-2025-Cl-6.3.2",
    clause_id: "APH-2025-Cl-6.3.2",
    clause_ref: "APH-2025-Cl-6.3.2",
    title: "Statutory Fire Safety Certificate Validity at Submission",
    category: "Safety & Compliance",
    severity: "CRITICAL",
    version: "1.0.0",
    current_version: {
      version_number: "1.0.0",
      parameters: {
        field: "fire_noc_expiry_date",
        min_valid_date: "2026-06-30",
        allow_grace_period_days: 0
      },
      failure_message_template: "Fire Safety NOC expired prior to mandatory academic session threshold (2026-06-30)."
    },
    description: "Mandatory statutory fire clearance certificate must remain valid across the forthcoming academic session without grace allowance."
  },
  {
    id: "RULE_FACULTY_STUDENT_RATIO",
    rule_code: "APH-2025-Cl-4.1.1",
    clause_id: "APH-2025-Cl-4.1.1",
    clause_ref: "APH-2025-Cl-4.1.1",
    title: "Faculty to Student Ratio (FSR) in Technical Programs",
    category: "Faculty & Cadre",
    severity: "CRITICAL",
    version: "1.0.0",
    current_version: {
      version_number: "1.0.0",
      parameters: {
        numerator_field: "sanctioned_intake",
        denominator_field: "total_faculty",
        max_ratio: 20.0,
        tolerance_pct: 5.0
      },
      failure_message_template: "Faculty-to-student ratio exceeds statutory ceiling of 1:20 (with 5% tolerance margin)."
    },
    description: "Undergraduate Engineering & Technology institutions require a minimum full-time regular Faculty-to-Student Ratio of 1:20 based on approved student intake."
  },
  {
    id: "RULE_BUILTUP_CARPET_AREA",
    rule_code: "APH-2025-Cl-4.2.1",
    clause_id: "APH-2025-Cl-4.2.1",
    clause_ref: "APH-2025-Cl-4.2.1",
    title: "Minimum Instructional Built-Up Carpet Area",
    category: "Infrastructure",
    severity: "CRITICAL",
    version: "1.0.0",
    current_version: {
      version_number: "1.0.0",
      parameters: {
        min_carpet_sqm_per_student: 4.0,
        tolerance_deficit_pct: 15.0
      },
      failure_message_template: "Instructional built-up area deficit exceeds 15% permissible negative tolerance threshold."
    },
    description: "Sanctioned master architectural plan must provide at least 4.0 sq.m of instructional space per enrolled student across classrooms, computing centers, and specialized laboratories."
  },
  {
    id: "RULE_CONTIGUOUS_LAND_METRO",
    rule_code: "APH-2025-Cl-2.3.1",
    clause_id: "APH-2025-Cl-2.3.1",
    clause_ref: "APH-2025-Cl-2.3.1",
    title: "Minimum Contiguous Land Parcel for Metro Campus",
    category: "Land & Title",
    severity: "CRITICAL",
    version: "1.0.0",
    current_version: {
      version_number: "1.0.0",
      parameters: {
        min_land_acres: 7.5,
        contiguous_required: true
      },
      failure_message_template: "Campus land parcel is non-contiguous or falls below statutory metro threshold of 7.5 acres."
    },
    description: "Institutions located in Tier-1 and metropolitan municipal boundaries must possess at least 7.5 contiguous acres registered in the name of the sponsoring trust or society."
  },
  {
    id: "RULE_FACULTY_CADRE_RATIO",
    rule_code: "APH-2025-Cl-4.1.2",
    clause_id: "APH-2025-Cl-4.1.2",
    clause_ref: "APH-2025-Cl-4.1.2",
    title: "Academic Cadre Distribution (1:2:6 Ratio)",
    category: "Faculty & Cadre",
    severity: "WARNING",
    version: "1.0.0",
    current_version: {
      version_number: "1.0.0",
      parameters: {
        cadre_ratio: "1:2:6",
        min_professors_pct: 10.0
      },
      failure_message_template: "Cadre distribution deviates significantly from Professor : Associate Professor : Assistant Professor (1:2:6) norm."
    },
    description: "Academic teaching departments must balance seniority profiles according to the recommended 1:2:6 cadence for Professors, Associate Professors, and Assistant Professors."
  },
  {
    id: "RULE_BUILDING_STABILITY_NOC",
    rule_code: "APH-2025-Cl-6.3.1",
    clause_id: "APH-2025-Cl-6.3.1",
    clause_ref: "APH-2025-Cl-6.3.1",
    title: "Structural Safety & Building Stability Certification",
    category: "Safety & Compliance",
    severity: "CRITICAL",
    version: "1.0.0",
    current_version: {
      version_number: "1.0.0",
      parameters: {
        issuing_authority: "State PWD or Chartered Structural Engineer",
        validity_years_min: 1
      },
      failure_message_template: "Building stability certificate has expired or lacks authoritative State PWD executive engineer counter-signature."
    },
    description: "Every physical educational block, instructional hall, and laboratory structure must possess an active Structural Stability Fitness Certificate issued under the State PWD Act."
  },
  {
    id: "RULE_LAND_TITLE_ENCUMBRANCE",
    rule_code: "APH-2025-Cl-2.1.2",
    clause_id: "APH-2025-Cl-2.1.2",
    clause_ref: "APH-2025-Cl-2.1.2",
    title: "Unencumbered Land Title & 30-Year Non-Alienation",
    category: "Land & Title",
    severity: "CRITICAL",
    version: "1.0.0",
    current_version: {
      version_number: "1.0.0",
      parameters: {
        min_lease_period_years: 30,
        encumbrance_free: true
      },
      failure_message_template: "Title search registers active mortgage encumbrance or government acquisition reservation."
    },
    description: "Campus land title deed or registered long-term government lease (minimum 30 years) must be certified free of legal dispute, mortgage lien, or non-educational easement."
  },
  {
    id: "RULE_AICTE_NBA_ACCREDITATION",
    rule_code: "APH-2025-Cl-1.4.3",
    clause_id: "APH-2025-Cl-1.4.3",
    clause_ref: "APH-2025-Cl-1.4.3",
    title: "NBA Tier-I/II Program Accreditation for Seat Expansion",
    category: "Governance & Quality",
    severity: "WARNING",
    version: "1.0.0",
    current_version: {
      version_number: "1.0.0",
      parameters: {
        min_nba_score: 650,
        validity_min_months: 12
      },
      failure_message_template: "Expansion in sanctioned intake requested without active NBA accreditation in corresponding department."
    },
    description: "Institutions requesting more than 180 seats in any single engineering or technical discipline must hold valid NBA accreditation for at least 50% of eligible programs."
  }
];

