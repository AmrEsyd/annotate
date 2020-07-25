import isEqual from 'lodash/isEqual'

import { Record } from '@airtable/blocks/dist/types/src/models/models'
import { useWatchable } from '@airtable/blocks/ui'
import is from '@sindresorhus/is'

import { snackbar } from '../components'
import { safeJsonParse } from '../utils'

const textFieldTypes = ['multilineText', 'richText', 'singleLineText']

export const useFieldValue = <T = unknown>(
  record?: Record | null,
  fieldId?: string | null
) => {
  record = record?.isDeleted ? null : record
  useWatchable(record, ['cellValues'])

  if (!record || record?.isDeleted) return []

  const table =
    record?.parentTable && !record?.parentTable.isDeleted
      ? record?.parentTable
      : null
  const field = (fieldId && table?.getFieldByIdIfExists(fieldId)) || null
  const rawValue = field ? record?.getCellValue(field) : null

  const value = safeJsonParse(rawValue)

  const permissions =
    record &&
    field &&
    table?.checkPermissionsForUpdateRecord(record, {
      [field.id]: undefined,
    })

  const setValue = (newValueRaw: any) => {
    if (
      !field ||
      !table ||
      !record ||
      field.isDeleted ||
      table.isDeleted ||
      record.isDeleted
    )
      return
    let newValue

    if (!is.string(newValueRaw) && textFieldTypes.includes(field.type)) {
      newValue = JSON.stringify(newValueRaw)
    } else {
      newValue = newValueRaw
    }

    const isNotEqual = !isEqual(newValue, rawValue)

    if (permissions?.hasPermission && isNotEqual) {
      table
        .updateRecordAsync(record, {
          [field.id]: newValue,
        })
        .catch((error: Error) => {
          snackbar(error.message)
        })
    }

    return permissions
  }

  return [value as T, setValue, permissions] as const
}
