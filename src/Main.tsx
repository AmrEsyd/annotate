import React, { useState } from 'react'

import { Box, useBase, useSettingsButton } from '@airtable/blocks/ui'

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
  const base = useBase()
  const [shouldRenderSettings, setShouldRenderSettings] = useState(false)
  const [
    shouldRenderKeyboardShortcuts,
    setShouldRenderKeyboardShortcuts,
  ] = useState(false)
  const { annotationsTableId, storageFieldId } = useSettings()

  const annotationsTable = annotationsTableId
    ? base.getTableByIdIfExists(annotationsTableId)
    : null

  const storageField = storageFieldId
    ? annotationsTable?.getFieldByIdIfExists(storageFieldId)
    : null

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
  if (
    !annotationsTable ||
    annotationsTable.isDeleted ||
    !storageField ||
    storageField.isDeleted
  ) {
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
