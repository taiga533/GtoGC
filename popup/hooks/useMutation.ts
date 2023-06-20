import { useCallback, useEffect, useState } from "react";
import { handleError } from "./handleError";
import { useObserver } from "./useObserver";

export function useMutation<T>(asyncFn: (data: T) => Promise<void>) {
  const {dispatcher, observer} = useObserver<T>();
  const mutate = (data: T) => {
    dispatcher.loadStart();
    (data)
    asyncFn(data)
      .catch((e) => {
        console.error(e);
        dispatcher.setError(handleError(e));
      })
      .finally(() => {
        dispatcher.loadStop();
      });
  }
  return { ...observer, mutate };
}
