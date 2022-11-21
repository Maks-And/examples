import { useEffect, useRef, DependencyList } from "react";

export const useDidUpdate = (
  f: (isMountCall: boolean) => void,
  dependencies?: DependencyList,
  callOnMount = false,
) => {
  const isMountedRef = useRef(false);
  const didMountRef = useRef(callOnMount);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    return f(!isMountedRef.current);
  }, dependencies);

  useEffect(() => {
    isMountedRef.current = true;
  }, []);
};

export default useDidUpdate;
