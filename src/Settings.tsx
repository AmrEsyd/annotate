import React from 'react'

import { FieldType } from '@airtable/blocks/models'
import {
  Dialog,
  FieldPickerSynced,
  FormField,
  Heading,
  TablePickerSynced,
  useBase,
  useSynced,
} from '@airtable/blocks/ui'
import is from '@sindresorhus/is'

export const globalConfigKeys = {
  annotationsTableId: 'annotationsTableId',
  storageFieldId: 'storageFieldId',
} as const

export const Settings: React.FC<{ onClose: () => unknown }> = ({ onClose }) => {
  const base = useBase()
  const [annotationsTableId] = useSynced(globalConfigKeys.annotationsTableId)
  const annotationsTable = is.string(annotationsTableId)
    ? base.getTableByIdIfExists(annotationsTableId)
    : null

  return (
    <Dialog onClose={onClose} maxHeight="80vh" width="80vw" maxWidth="400px">
      <Dialog.CloseButton />
      <Heading>Settings</Heading>

      <FormField
        label="Annotation table"
        description="Table containing annotations."
      >
        <TablePickerSynced
          globalConfigKey={globalConfigKeys.annotationsTableId}
        />
      </FormField>
      <FormField
        label="Storage field"
        description="Text field for storing annotation data in a machine readable format."
      >
        {annotationsTable && (
          <FieldPickerSynced
            allowedTypes={[FieldType.MULTILINE_TEXT, FieldType.RICH_TEXT]}
            table={annotationsTable}
            globalConfigKey={globalConfigKeys.storageFieldId}
          />
        )}
      </FormField>
    </Dialog>
  )
}
