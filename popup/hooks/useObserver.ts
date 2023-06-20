import { useState } from "react";

export type AsyncObserver = {
  loading: boolean;
  error: Error | null;
};

export type QueryObserver<T> = {
  data: T | null;
} & AsyncObserver;

export type MutationObserver<T> = {
  mutate: (data: T) => void;
} & AsyncObserver;

export function useObserver<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);
  function loadStart() {
    setLoading(true);
  }
  function loadStop() {
    setLoading(false);
  }
  function makeSuccess() {
    setSuccess(true);
  }
  return {
    observer: {
      success,
      loading,
      error,
    },
    dispatcher: {
      loadStart,
      loadStop,
      setError,
      makeSuccess,
    },
  };
}
