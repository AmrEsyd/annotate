import React, { useState } from 'react'

import { base, globalConfig, session, undoRedo } from '@airtable/blocks'
import { FieldType } from '@airtable/blocks/models'
import {
  Box,
  Button,
  Dialog,
  Heading,
  Text,
  TextButton,
  useSettingsButton,
  ViewportConstraint,
} from '@airtable/blocks/ui'

import { KeyboardShortcutsList, shortcutsList, snackbar } from './components'
import { Editor } from './Editor'
import { useHotkeys, useSettings } from './hooks'
import { globalConfigKeys, localStorageKeys, Settings } from './Settings'

if (localStorage.getItem(localStorageKeys.undoRedo) === 'Yes') {
  undoRedo.mode = undoRedo.modes.AUTO
}

type BlockContextType = {
  showSettings?: () => unknown
  showKeyboardShortcuts?: () => unknown
}

export const BlockContext = React.createContext<BlockContextType>({})

export function Main() {
  const [shouldRenderSettings, setShouldRenderSettings] = useState(false)
  const [
    shouldRenderKeyboardShortcuts,
    setShouldRenderKeyboardShortcuts,
  ] = useState(false)
  const { annotationsTableId, imageFieldId, storageFieldId } = useSettings()

  useSettingsButton(() => {
    setShouldRenderSettings(!shouldRenderSettings)
  })

  useHotkeys(
    shortcutsList.keyboardShortcuts.shortcuts.join(),
    () => {
      setShouldRenderKeyboardShortcuts(true)
    },
    [setShouldRenderKeyboardShortcuts]
  )

  let render
  if (!annotationsTableId || !imageFieldId || !storageFieldId) {
    const STORAGE_FIELD_NAME = 'Storage'
    const IMAGE_FIELD_NAME = 'Original Image'
    const createTable = () =>
      base
        .unstable_createTableAsync('annotations', [
          { name: 'Title', type: FieldType.SINGLE_LINE_TEXT },
          { name: STORAGE_FIELD_NAME, type: FieldType.MULTILINE_TEXT },
          { name: IMAGE_FIELD_NAME, type: FieldType.MULTIPLE_ATTACHMENTS },
        ])
        .then((table) => {
          globalConfig.setPathsAsync([
            {
              path: [globalConfigKeys.annotationsTableId],
              value: table.id,
            },
            {
              path: [globalConfigKeys.storageFieldId],
              value: table.getFieldByNameIfExists(STORAGE_FIELD_NAME)?.id,
            },
            {
              path: [globalConfigKeys.imageFieldId],
              value: table.getFieldByNameIfExists(IMAGE_FIELD_NAME)?.id,
            },
          ])
        })
        .catch((error: Error) => {
          snackbar(error.message, 5)
        })
    const permissionsForCreateTable = base.unstable_checkPermissionsForCreateTable()
    render = (
      <ViewportConstraint maxFullscreenSize={{ width: 600, height: 400 }}>
        <Dialog onClose={() => {}}>
          <Heading size="small">Welcome, {session.currentUser?.name}</Heading>
          This block require a separate table to store your annotations.
          {permissionsForCreateTable.hasPermission ? (
            <Button onClick={createTable} variant="primary" marginY={2}>
              Create the required table
            </Button>
          ) : (
            permissionsForCreateTable.reasonDisplayString
          )}
          <Text size="small">
            {"If you've used it before you can select the table in "}
            <TextButton
              size="small"
              onClick={() => setShouldRenderSettings(true)}
            >
              block setting
            </TextButton>
          </Text>
        </Dialog>
      </ViewportConstraint>
    )
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
