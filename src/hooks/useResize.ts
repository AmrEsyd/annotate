import throttle from 'lodash/throttle'
import { DependencyList, useEffect } from 'react'

export const useResize = (
  fun: () => void,
  deps?: DependencyList,
  time: number = 300
) => {
  useEffect(() => {
    const throttledFunction = throttle(fun, time)
    throttledFunction() // run on load
    window.addEventListener('resize', throttledFunction)
    return () => window.removeEventListener('resize', throttledFunction)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
