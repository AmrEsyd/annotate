import { DependencyList, EffectCallback, useEffect, useRef } from 'react'
import isDeepEqual from 'react-fast-compare'

export const useDeepCompareEffect = (
  callback: EffectCallback,
  dependencies: DependencyList
) => {
  const ref = useRef<DependencyList>()

  if (!isDeepEqual(dependencies, ref.current)) {
    ref.current = dependencies
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(callback, ref.current)
}
