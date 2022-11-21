import { rootStore } from "store";
import { ApiBuilder } from "./index";

export const apiBuilder = new ApiBuilder({
  baseUrl: '',
});

export const apiMiddleware = apiBuilder.build();


export const capableApiBuilder = new ApiBuilder({
  baseUrl: '',
});

capableApiBuilder.setResponseInterceptors(async (result, instance) => {
  if (result.details.statusCode === 401) {
    try {
      await rootStore.stores.userStore.silentAuth();
      return instance.fetch();
    } catch (error) {
      console.log(`Couldn't refresh user token via api interceptors`);
      console.log(error);
      return result;
    }
  }
  return result;
});

export const capableApiMiddleware = capableApiBuilder.build();
