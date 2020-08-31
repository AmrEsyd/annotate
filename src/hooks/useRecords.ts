import { useMemo } from 'react'

import { SingleRecordQueryResultOpts } from '@airtable/blocks/dist/types/src/models/record_query_result'
import { AttachmentData } from '@airtable/blocks/dist/types/src/types/attachment'
import {
  Record,
  Table,
  TableOrViewQueryResult,
  View,
} from '@airtable/blocks/models'
import { useLoadable, useWatchable } from '@airtable/blocks/ui'
import is from '@sindresorhus/is'

import { LookupOptions } from '../types'

export function useRecordsByIds(
  tableOrView: Table | View,
  recordsIds: string[],
  opts?: SingleRecordQueryResultOpts
): Record[] | null {
  let queryResult: TableOrViewQueryResult | null = null
  if (tableOrView instanceof Table || tableOrView instanceof View) {
    queryResult = tableOrView.selectRecords(opts)
  }

  useLoadable(queryResult)
  useWatchable(queryResult, ['records', 'recordColors'])

  const records = useMemo(() => {
    const records: Record[] = []
    recordsIds.map((recordId) => {
      const record = queryResult?.getRecordByIdIfExists(recordId)
      if (record) records.push(record)
    })
    return records
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordsIds.join()])

  useWatchable(records, ['cellValues'])

  return records
}

export type Attachment = AttachmentData & {
  record: Record
  attachmentId: string
}

export const useRecordsAttachments = (
  table?: Table,
  records?: Record[] | null
): Attachment[] | null => {
  return useMemo(() => {
    if (!table || !is.nonEmptyArray(records)) return null

    const attachmentsFields = table.fields.filter((field) => {
      const options = field.options as LookupOptions
      return (
        field.type === 'multipleAttachments' ||
        (field.type === 'multipleLookupValues' &&
          options.isValid &&
          options.result?.type === 'multipleAttachments')
      )
    })

    const values: Attachment[] = []

    if (records)
      for (let record of records) {
        for (let field of attachmentsFields) {
          const cellValue = record.getCellValue(field)

          if (is.array<AttachmentData>(cellValue)) {
            for (let attachment of cellValue) {
              values.push({
                ...attachment,
                record,
                attachmentId: attachment.id,
                id: `${record.id}_${attachment.id}`,
              })
            }
          }
        }
      }
    return values
  }, [records, table])
}
