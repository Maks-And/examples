import { ApiBuilderConfig } from "./api-builder.types";

export const initialBuilderConfig: Omit<ApiBuilderConfig, "baseUrl"> = {
  tokenPrefix: "Bearer",
  responseType: "json",
  cors: false,
  headers: {},
  tokenCallback: undefined,
  errorMapper: undefined,
  responseInterceptors: [],
};