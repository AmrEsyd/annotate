import React, { useState } from 'react'

import { Box, useSettingsButton } from '@airtable/blocks/ui'

import { KeyboardShortcutsList, Setup, shortcutsList } from './components'
import { Editor } from './Editor'
import { useHotkeys, useSettings } from './hooks'
import { Settings } from './Settings'

type BlockContextType = {
  showSettings: () => unknown
  showKeyboardShortcuts: () => unknown
}

export const BlockContext = React.createContext<BlockContextType>(null as any)

export function Main() {
  const [shouldRenderSettings, setShouldRenderSettings] = useState(false)
  const [
    shouldRenderKeyboardShortcuts,
    setShouldRenderKeyboardShortcuts,
  ] = useState(false)
  const { annotationsTableId, storageFieldId } = useSettings()

  useSettingsButton(() => {
    setShouldRenderSettings(!shouldRenderSettings)
  })

  useHotkeys(
    shortcutsList.keyboardShortcuts.shortcuts,
    () => {
      setShouldRenderKeyboardShortcuts(true)
    },
    [setShouldRenderKeyboardShortcuts]
  )

  let render
  if (!annotationsTableId || !storageFieldId) {
    render = <Setup />
  } else {
    render = <Editor />
  }

  const contextValue: BlockContextType = {
    showSettings: () => setShouldRenderSettings(true),
    showKeyboardShortcuts: () => setShouldRenderKeyboardShortcuts(true),
  }

  return (
    <BlockContext.Provider value={contextValue}>
      <Box overflow="hidden">
        {shouldRenderKeyboardShortcuts && (
          <KeyboardShortcutsList
            onClose={() => setShouldRenderKeyboardShortcuts(false)}
          />
        )}
        {shouldRenderSettings && (
          <Settings onClose={() => setShouldRenderSettings(false)} />
        )}
        {render}
      </Box>
    </BlockContext.Provider>
  )
}
