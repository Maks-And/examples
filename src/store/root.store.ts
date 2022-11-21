import { GlobalStore } from "./global";
import { StoresType } from "./root.store.types";

class RootStore {
  private _stores: StoresType = {
    globalStore: new GlobalStore(),
  };

  get stores() {
    return this._stores;
  }
}

export const rootStore = new RootStore();

export default rootStore;
