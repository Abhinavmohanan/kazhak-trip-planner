'use client';

import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';

/**
 * Drop-in replacement for useState that persists to localStorage.
 * SSR-safe: starts with initialValue on server, reads localStorage after mount.
 * Each browser/device gets its own independent state — perfect for a shared-link trip app.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initialValue);

  // Read from localStorage once after client mount (avoids SSR hydration mismatch)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        setValue(JSON.parse(stored) as T);
      }
    } catch {
      // Ignore parse errors — fall back to initialValue
    }
  }, [key]);

  // Write to localStorage on every state change
  const setValueAndStore: Dispatch<SetStateAction<T>> = useCallback(
    (action) => {
      setValue((prev) => {
        const next =
          typeof action === 'function'
            ? (action as (prev: T) => T)(prev)
            : action;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // Ignore quota errors
        }
        return next;
      });
    },
    [key],
  );

  return [value, setValueAndStore];
}
