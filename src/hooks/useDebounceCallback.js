import debounce from "lodash.debounce";
import { useCallback } from "react";

export function useDebounceCallback(cb, delay, deps = []) {
  return useCallback(debounce(cb, delay), deps);
}
