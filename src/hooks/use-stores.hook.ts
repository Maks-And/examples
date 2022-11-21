import { rootStore, StoresType } from "store";

export const useStores = (): StoresType => rootStore.stores;

export default useStores;
