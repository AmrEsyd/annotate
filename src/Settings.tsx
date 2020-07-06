import React, { useState } from 'react'

import {
  Dialog,
  FieldPickerSynced,
  FormField,
  Heading,
  Switch,
  TablePickerSynced,
  useBase,
  useSynced,
} from '@airtable/blocks/ui'
import is from '@sindresorhus/is'

import { Divider } from './components'

export const globalConfigKeys = {
  annotationsTableId: 'annotationsTableId',
  imageFieldId: 'imageFieldId',
  storageFieldId: 'storageFieldId',
} as const

export const localStorageKeys = {
  undoRedo: 'undoRedo',
} as const

export const Settings: React.FC<{ onClose: () => unknown }> = ({ onClose }) => {
  const base = useBase()
  const [annotationsTableId] = useSynced(globalConfigKeys.annotationsTableId)
  const annotationsTable = is.string(annotationsTableId)
    ? base.getTableByIdIfExists(annotationsTableId)
    : null

  const [showUndoRedo, setShowUndoRedo] = useState(
    localStorage.getItem(localStorageKeys.undoRedo) === 'Yes'
  )

  return (
    <Dialog onClose={onClose} maxHeight="80vh" width="80vw" maxWidth="400px">
      <Dialog.CloseButton />
      <Heading>Settings</Heading>

      <Heading size="small" as="h2">
        Personal Settings
      </Heading>
      <FormField
        label="Show Undo & Redo Buttons"
        description="Unstable use with caution. Reload the page after changing the setting."
      >
        <Switch
          label="Show Undo & Redo Buttons"
          value={showUndoRedo}
          onChange={(value) => {
            setShowUndoRedo(value)
            localStorage.setItem(
              localStorageKeys.undoRedo,
              value ? 'Yes' : 'No'
            )
          }}
        />
      </FormField>
      <Divider style={{ margin: '1.5em 0' }} />
      <Heading size="small" as="h2">
        Block Settings
      </Heading>
      <FormField label="Annotation Table">
        <TablePickerSynced
          globalConfigKey={globalConfigKeys.annotationsTableId}
        />
      </FormField>
      <FormField
        label="Image Field"
        description="'Attachment' field used to store the original image."
      >
        {annotationsTable && (
          <FieldPickerSynced
            table={annotationsTable}
            globalConfigKey={globalConfigKeys.imageFieldId}
          />
        )}
      </FormField>
      <FormField
        label="Storage Field"
        description="'Long Text' field used to store the annotations in a machine readable format."
      >
        {annotationsTable && (
          <FieldPickerSynced
            table={annotationsTable}
            globalConfigKey={globalConfigKeys.storageFieldId}
          />
        )}
      </FormField>
    </Dialog>
  )
}
