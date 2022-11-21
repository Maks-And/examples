import {
  CapablePatientModel,
  CapablePhoneModel,
  CapableAddressModel,
  ShippoRateModel,
  CapableProductModel,
} from "models";

export type PostPatientOrderData = {
  order: {
    patient_id: CapablePatientModel["id"];
    carrier: ShippoRateModel["provider"];
    submission_id: string;
    requires_approval: boolean;
    order_type: "medication" | "encounter";
    order_line_items: Array<{
      product_id: CapableProductModel["id"];
      quantity: number;
      prescription_id?: string;
    }>;
    billing_address: {
      city: string;
      country: string;
      line1: string;
      line2: string;
      state: string;
      zip: string;
    };
    shipping_address: {
      city: string;
      country: string;
      line1: string;
      line2: string;
      state: string;
      zip: string;
    };
  };
};

export type PatchCapablePatientData = {
  patient: Partial<
    Pick<
      CapablePatientModel,
      | "identity_id"
      | "external_id"
      | "identity_external_id"
      | "organization_ids"
      | "first_name"
      | "middle_name"
      | "last_name"
      | "birth_date"
      | "gender_identity"
      | "administrative_gender"
      | "races"
      | "ethnicities"
      | "tag_list"
      | "metadata"
    > & {
      addresses_attributes: Partial<
        Pick<
          CapableAddressModel,
          | "id"
          | "line1"
          | "line2"
          | "city"
          | "state"
          | "country"
          | "zip"
          | "label"
          | "active"
          | "primary"
        >
      >[];
      phones_attributes: Partial<CapablePhoneModel>[];
    }
  >;
};
