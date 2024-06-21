import { useEffect, useRef } from "react";

// hook to emulate componentDidUpdate in prod env
// In dev env, this would still be called on first render as in
// React 18, hooks are called twice on mount in DEV env.
export function useDidUpdate(cb, depsArr = []) {
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    return cb();
  }, depsArr);
}
