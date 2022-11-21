export type CapableDestinationLabelModel = "shipping" | "billing";

export type CapablePhoneModel = {
  id: string;
  user_id: string;
  label: CapableDestinationLabelModel;
  number: string; // "+12014222730"
  created_at: string;
  updated_at: string;
  active: boolean;
  primary: boolean;
};

export type CapableAddressModel = {
  id: string;
  addressable_id: string;
  user_id: string | null;
  addressable_type: string; // "User"
  label: CapableDestinationLabelModel;
  city: string;
  country: string;
  line1: string;
  line2: string;
  state: string;
  zip: string;
  created_at: string;
  updated_at: string;
  active: boolean;
  primary: boolean;
};

export type CapableOrderShortModel = {
  id: string; // "b8ecd633-88ba-4eb6-a5fa-f2d18c6e8a80"
  timestamp: number; // 1660383780
};
