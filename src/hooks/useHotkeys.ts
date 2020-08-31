import hotkeys, { HotkeysEvent } from 'hotkeys-js'
import { useCallback, useEffect } from 'react'

export function useHotkeys(
  key?: string | string[],
  callback?: (
    keyboardEvent: KeyboardEvent,
    hotkeysEvent: HotkeysEvent
  ) => unknown,
  deps?: any[]
): void {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoisedCallback = useCallback(
    callback ? callback : () => {},
    deps || []
  )

  const keys = Array.isArray(key) ? key.join() : key

  useEffect(() => {
    if (keys) {
      const callback = (
        keyboardEvent: KeyboardEvent,
        HotkeysEvent: HotkeysEvent
      ) => {
        keyboardEvent.preventDefault()
        keyboardEvent.stopPropagation()
        memoisedCallback(keyboardEvent, HotkeysEvent)
      }
      hotkeys(keys, {}, callback)
      return () => hotkeys.unbind(keys, callback)
    }
  }, [memoisedCallback, keys])
}
