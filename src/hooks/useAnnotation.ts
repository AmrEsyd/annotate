import { useMemo } from 'react'

import { TableOrViewQueryResult } from '@airtable/blocks/models'
import {
  useBase,
  useLoadable,
  useRecordById,
  useWatchable,
} from '@airtable/blocks/ui'
import is from '@sindresorhus/is'

import { Annotation } from '../Annotation'
import { useSettings } from '../hooks'
import { Attachment } from './useRecords'

function binarySearchRecords(
  queryResult: TableOrViewQueryResult,
  searchValue: string
) {
  searchValue = searchValue?.toLowerCase()
  const recordIds = queryResult.recordIds
  if (is.nullOrUndefined(searchValue) || !is.nonEmptyArray(recordIds)) {
    return null
  }

  let maxIndex = recordIds.length - 1,
    minIndex = 0,
    currentIndex = 0

  while (minIndex <= maxIndex) {
    currentIndex = Math.floor((minIndex + maxIndex) / 2)

    const record = queryResult.getRecordByIdIfExists(recordIds[currentIndex])
    let name = record?.getCellValue(record.parentTable.primaryField) as string
    name = name?.toLowerCase()

    if (name === searchValue) {
      return record
    } else if (name < searchValue) {
      minIndex = currentIndex + 1
    } else {
      maxIndex = currentIndex - 1
    }
  }

  return null
}

export const useAnnotation = (attachment: Attachment | null | undefined) => {
  const base = useBase()
  const { annotationsTableId, storageFieldId } = useSettings()
  const annotationTable = base.getTableByIdIfExists(annotationsTableId || '')

  const queryResultImageIds = annotationTable?.selectRecords({
    fields: [annotationTable.primaryField],
    sorts: [{ field: annotationTable.primaryField, direction: 'asc' }],
  })

  useLoadable(queryResultImageIds || null)
  useWatchable(queryResultImageIds, ['records'])

  const annotationRecordId = useMemo(() => {
    if (queryResultImageIds && attachment?.id) {
      const record = binarySearchRecords(queryResultImageIds, attachment?.id)
      return record?.id
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachment?.id, queryResultImageIds, queryResultImageIds?.recordIds])

  const annotationRecord = useRecordById(
    annotationTable!,
    annotationRecordId || ''
  )

  return useMemo(() => {
    const storageField = annotationTable?.getFieldByIdIfExists(
      storageFieldId || ''
    )

    if (attachment && storageField) {
      return new Annotation(
        annotationRecord,
        attachment,
        annotationTable,
        storageField
      )
    } else {
      return null
    }
  }, [annotationTable, annotationRecord, attachment, storageFieldId])
}
