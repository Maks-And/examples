import { useEffect } from "react";

export const useDidMount = (f: VoidFunction) => useEffect(f, []);

export default useDidMount;
