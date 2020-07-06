import hotkeys, { HotkeysEvent } from 'hotkeys-js'
import { useCallback, useEffect } from 'react'

export function useHotkeys(
  keys?: string,
  callback?: (
    keyboardEvent: KeyboardEvent,
    hotkeysEvent: HotkeysEvent
  ) => unknown,
  deps?: any[]
): void {
  const memoisedCallback = useCallback(
    callback ? callback : () => {},
    deps || []
  )

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
