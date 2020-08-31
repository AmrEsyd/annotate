import flatMap from 'lodash/flatMap'
import { useMemo } from 'react'

import { Record } from '@airtable/blocks/models'
import { useLoadable } from '@airtable/blocks/ui'

import { recordLinksOptions } from '../types'
import { isDefined } from '../utils'

export const useLinkedRecords = (
  records?: Record[] | null,
  tableId?: string | null
): Record[] | null => {
  const linkedRecordsQueryResults = useMemo(() => {
    return flatMap(records, (record) => {
      if (record && !record.isDeleted && !record.parentTable.isDeleted)
        return record.parentTable.fields.map((field) => {
          const options = field.options as recordLinksOptions
          if (
            !field.isDeleted &&
            field.type === 'multipleRecordLinks' &&
            options.linkedTableId === tableId
          ) {
            return record?.selectLinkedRecordsFromCell(field)
          }
        })
    }).filter(isDefined)
  }, [records, tableId])

  useLoadable(linkedRecordsQueryResults, { shouldSuspend: false })

  return useMemo(
    () =>
      flatMap(linkedRecordsQueryResults, (result) =>
        result.isDataLoaded ? result.records : []
      ),
    [
      linkedRecordsQueryResults,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      linkedRecordsQueryResults.every((result) => result.isDataLoaded),
    ]
  )
}
