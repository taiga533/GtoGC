import { useEffect, useState } from "react"

import { handleError } from "./handleError"
import { useObserver } from "./useObserver"

export function useQuery<T>(asyncFn: () => Promise<T>) {
  const { observer, dispatcher } = useObserver<T>()
  const [data, setData] = useState<T | null>(null)
  useEffect(() => {
    let ignore = false
    dispatcher.loadStart()
    asyncFn()
      .then((data) => {
        if (!ignore) {
          setData(data)
        }
      })
      .catch((e) => {
        console.error(e)
        dispatcher.setError(handleError(e))
      })
      .finally(() => {
        dispatcher.loadStop()
      })
    return () => {
      ignore = true
    }
  }, [])
  return { ...observer, data }
}
