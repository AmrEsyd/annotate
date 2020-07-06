import { useMemo } from 'react'

import { cursor } from '@airtable/blocks'
import {
  useBase,
  useLoadable,
  useRecords,
  useWatchable,
} from '@airtable/blocks/ui'

export const useCursor = () => {
  useLoadable(cursor)
  useWatchable(cursor, ['selectedRecordIds', 'activeTableId', 'activeViewId'])

  const base = useBase()
  const table = base.getTableByIdIfExists(cursor.activeTableId!)
  const view = table?.getViewByIdIfExists(cursor.activeViewId!)
  const queryResult = view?.selectRecords()
  const viewRecords = useRecords(queryResult!)

  const selectedRecords = useMemo(() => {
    return viewRecords && viewRecords?.length > 0
      ? viewRecords.filter((record) =>
          cursor.selectedRecordIds.includes(record.id)
        )
      : null
  }, [viewRecords])

  return { table, selectedRecords, viewRecords, cursor, queryResult }
}
