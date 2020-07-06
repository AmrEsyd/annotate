import React, { useMemo, useState } from 'react'

import {
  Record,
  Table,
  View,
} from '@airtable/blocks/dist/types/src/models/models'
import { expandRecordPickerAsync } from '@airtable/blocks/ui'
import is from '@sindresorhus/is'

import { snackbar, ToolbarButton } from '../components'
import { useCursor, useDeepCompareEffect } from './'

export const useActiveRecords = () => {
  const [activeRecords, setActiveRecords] = useState<Record[] | null>(null)
  const cursor = useCursor()

  useDeepCompareEffect(() => {
    if (is.nonEmptyArray(cursor.selectedRecords))
      setActiveRecords(cursor.selectedRecords)
  }, [cursor.selectedRecords])

  const reloadRecords = () => {
    if (activeRecords) setActiveRecords([...activeRecords])
  }

  const { previousIndex, nextIndex } = useMemo(() => {
    const viewRecords = cursor.viewRecords
    const lastSelectedRecordId = activeRecords?.[activeRecords.length - 1]?.id
    const lastSelectedRecordIndex = viewRecords?.findIndex(
      (record) => record.id === lastSelectedRecordId
    )

    const firstSelectedRecordId = activeRecords?.[0]?.id
    const firstSelectedRecordIndex = viewRecords?.findIndex(
      (record) => record.id === firstSelectedRecordId
    )

    const previousIndex =
      is.number(lastSelectedRecordIndex) && lastSelectedRecordIndex > 0
        ? lastSelectedRecordIndex - 1
        : null

    const nextIndex =
      is.number(firstSelectedRecordIndex) &&
      viewRecords &&
      firstSelectedRecordIndex < viewRecords?.length - 1
        ? firstSelectedRecordIndex + 1
        : null

    return { previousIndex, nextIndex }
  }, [activeRecords, cursor.viewRecords])

  const goToNextRecord = () => {
    if (is.number(nextIndex)) {
      const nextRecord = cursor.viewRecords?.[nextIndex]
      if (nextRecord && !nextRecord.isDeleted) {
        setActiveRecords([nextRecord])
        snackbar(nextRecord.name)
      }
    }
  }

  const goToPreviousRecord = () => {
    if (is.number(previousIndex)) {
      const previousRecord = cursor.viewRecords?.[previousIndex]
      if (previousRecord && !previousRecord.isDeleted) {
        setActiveRecords([previousRecord])
        snackbar(previousRecord.name)
      }
    }
  }

  const showPicker = async (viewOrTable: View | Table | null) => {
    if (!viewOrTable) return
    const { records } = await viewOrTable.selectRecordsAsync()
    const selectedRecord = await expandRecordPickerAsync(records)
    if (selectedRecord) setActiveRecords([selectedRecord])
  }

  const pickerButton = (
    <ToolbarButton
      label="Select Other Record"
      labelMinWidth={900}
      variant="secondary"
      shortcutId="lookupRecord"
      icon="search"
      onClick={() => {
        showPicker(cursor.table)
      }}
    />
  )

  return [
    activeRecords,
    {
      reloadRecords,
      showPicker,
      pickerButton,
      activeTable: cursor.table,
      goToNextRecord,
      goToPreviousRecord,
      isFirstRecord: previousIndex === null,
      isLastRecord: nextIndex === null,
      isDataLoaded: cursor.queryResult?.isDataLoaded,
    },
  ] as const
}
