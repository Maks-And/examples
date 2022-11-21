import { useRef, useEffect } from "react";

export const useDidUnmount = (f: VoidFunction) => {
  const callbackRef = useRef(f);
  callbackRef.current = f;

  useEffect(() => {
    return () => callbackRef.current();
  }, []);
};

export default useDidUnmount;
