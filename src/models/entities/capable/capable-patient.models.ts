import { CapablePhoneModel, CapableAddressModel, CapableOrderShortModel } from "models";

export type CapablePatientModel = {
  id: string;
  tenant_id: string;
  identity_id: string;
  external_id: string | null;
  email: string;
  url: string;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  birth_date: string | null;
  mdi_patient_id: string | null;
  identity_external_id: string | null;
  gender_identity: string | null;
  administrative_gender: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  avatar_url: string | null;
  tag_list: string[];
  organization_ids: string[];
  age: number | null;
  phone_number: CapablePhoneModel | null;
  addresses: CapableAddressModel[];
  phones: CapablePhoneModel[];
  relationship_ids: [];
  races: [];
  ethnicities: [];
  metadata: {
    test_submitted?: string;
    orders?: CapableOrderShortModel[];
    newsletter?: boolean;
  };
};
