import { EmptyObjectType, ObjectType } from "models";
import { ApiRequestConfigType, ApiRequestHeaders } from "../api-request";

export type ApiBuilderConfig<
  ErrorData = any,
  AuxiliaryKeys extends ObjectType = EmptyObjectType,
> = Pick<
  ApiRequestConfigType<ErrorData, AuxiliaryKeys>,
  | "tokenPrefix"
  | "responseType"
  | "cors"
  | "tokenCallback"
  | "errorMapper"
  | "requestInterceptors"
  | "responseInterceptors"
> & {
  baseUrl: string;
  headers?: ApiRequestHeaders;
};
