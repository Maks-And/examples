export type CapableMedication = {
  dosespot_medication_id: string;
  dispense_unit_id: number;
  dose_form: string;
  route: string;
  strength: string;
  generic_product_name: string;
  lexi_gen_product_id: number;
  lexi_drug_syn_id: number;
  lexi_synonym_type_id: number;
  lexi_gen_drug_id: string;
  rx_cui: string;
  otc: boolean;
  ndc: string;
  schedule: string;
  display_name: string;
  monograph_path?: any;
  drug_classification: string;
  state_schedules: any[];
  metadata?: any;
  partner_medication_id: string;
};

export type CapableCasePrescription = {
  dosespot_prescription_id?: any;
  refills: number;
  quantity: number;
  days_supply?: any;
  directions: string;
  dosespot_prescription_sync_status: string;
  dosespot_sent_pharmacy_sync_status: string;
  no_substitutions: boolean;
  pharmacy_notes?: any;
  dosespot_confirmation_status: string;
  dosespot_confirmation_status_details?: any;
  dispense_unit_id: number;
  pharmacy_id: number;
  medication: CapableMedication;
};

export type CapableCaseStatus = {
  name: string;
  reason?: any;
  updated_at: Date;
};

export type CapableClinician = {
  specialty: string;
  clinician_id: string;
  full_name: string;
  photo?: any;
};

export type CapableCaseAssignment = {
  reason: string;
  created_at: Date;
  case_assignment_id: string;
  clinician: CapableClinician;
};

export type CapableCaseFile = {
  name: string;
  mime_type: string;
  url: string;
  url_thumbnail?: any;
  file_id: string;
};

export type CapableCaseQuestion = {
  question: string;
  answer: string;
  type: string;
  important: boolean;
};

export type CapablePatientCaseModel = {
  prioritized_at?: any;
  prioritized_reason?: any;
  created_at: Date;
  case_type: string;
  is_sync: boolean;
  metadata?: any;
  case_prescriptions: CapableCasePrescription[];
  case_notes: any[];
  case_id: string;
  case_status: CapableCaseStatus;
  case_assignment: CapableCaseAssignment;
  case_files: CapableCaseFile[];
  case_questions: CapableCaseQuestion[];
};
