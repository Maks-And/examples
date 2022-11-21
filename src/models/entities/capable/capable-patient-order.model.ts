import { CapableAddressModel } from "models";

export type CapablePatientOrderModel = {
  id: string;
  patient_id: string;
  shipping_level: number;
  carrier?: any;
  carrier_service?: any;
  tracking_number?: any;
  order_type: string;
  status: string;
  processing_status_details: string;
  requires_approval: boolean;
  status_details?: any;
  notes?: any;
  subtotal_price_cents: number;
  total_price_cents: number;
  payment_gateway: string;
  payment_gateway_transaction_id: string;
  external_reference_id?: any;
  stripe_order_id: string;
  order_date?: any;
  shipping_date?: any;
  delivery_date?: any;
  created_at: Date;
  updated_at: Date;
  order_line_items: CapableOrderLineItem[];
  shipping_address: CapableAddressModel;
  billing_address: CapableAddressModel;
};

export type CapableOrderLineItem = {
  id: string;
  price_cents: number;
  quantity: number;
  vendor_name: string;
  vendor_product_id?: any;
  status: string;
  status_details?: any;
  order_id: string;
  product_id: string;
  prescription_id?: any;
  encounter_id?: any;
  created_at: Date;
  updated_at: Date;
  product_name: string;
};
