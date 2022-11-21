import {
  CapablePatientModel,
  CapablePatientOrderModel,
  CapablePatientCaseModel,
  CapablePatientPrescriptionModel,
} from "models";
import { capableApiMiddleware } from "../index";
import { PostPatientOrderData, PatchCapablePatientData } from "./capable.interface";

export const getCapableCurrentPatient = capableApiMiddleware<CapablePatientModel>()({
  method: "get",
  endpoint: "/patients/me",
  disableInterception: true,
});

export const getCapablePatientOrders = capableApiMiddleware<CapablePatientOrderModel[]>()({
  method: "get",
  endpoint: "/orders",
});

export const getPatientPrescriptions = capableApiMiddleware<CapablePatientPrescriptionModel[]>()({
  method: "get",
  endpoint: "/prescriptions",
});

export const getPatientPrescriptionOrder = capableApiMiddleware<CapablePatientOrderModel>()({
  method: "get",
  endpoint: "/orders/:id",
});

export const getPatientCases = capableApiMiddleware<CapablePatientCaseModel[]>()({
  method: "get",
  endpoint: "/mdi/patient_cases",
});

export const postPatientOrder = capableApiMiddleware<
  CapablePatientOrderModel,
  PostPatientOrderData
>()({
  method: "post",
  endpoint: "/orders",
});

export const postPatientPaymentIntent = capableApiMiddleware<
  {
    client_secret: string;
  },
  {
    payment_intent: {
      order_id: CapablePatientOrderModel["id"];
    };
  }
>()({
  method: "post",
  endpoint: "/payment_intents",
});

export const patchCapablePatient = capableApiMiddleware<
  CapablePatientModel,
  PatchCapablePatientData
>()({
  method: "patch",
  endpoint: "/patients/:id",
});
