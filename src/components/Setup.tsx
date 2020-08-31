import React, { useContext } from 'react'

import { globalConfig, session } from '@airtable/blocks'
import { FieldType } from '@airtable/blocks/models'
import {
  Button,
  Dialog,
  Heading,
  Text,
  TextButton,
  useBase,
  ViewportConstraint,
} from '@airtable/blocks/ui'

import { snackbar } from '../components'
import { BlockContext } from '../Main'
import { globalConfigKeys } from '../Settings'

const STORAGE_FIELD_NAME = 'Storage'

export const Setup: React.FC = () => {
  const base = useBase()
  const { showSettings } = useContext(BlockContext)

  const createTable = () =>
    base
      .createTableAsync('Annotations', [
        { name: 'Image ID', type: FieldType.SINGLE_LINE_TEXT },
        { name: STORAGE_FIELD_NAME, type: FieldType.MULTILINE_TEXT },
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
        ])
      })
      .catch((error: Error) => {
        snackbar(error.message, 5)
      })
  const permissionsForCreateTable = base.checkPermissionsForCreateTable()

  return (
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
          <TextButton size="small" onClick={() => showSettings?.()}>
            block setting
          </TextButton>
        </Text>
      </Dialog>
    </ViewportConstraint>
  )
}
