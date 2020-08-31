import { cursor } from '@airtable/blocks'
import { useBase, useLoadable, useWatchable } from '@airtable/blocks/ui'

import { useRecordsByIds } from './useRecords'

export const useCursor = () => {
  useLoadable(cursor)
  useWatchable(cursor, ['selectedRecordIds', 'activeTableId', 'activeViewId'])

  const base = useBase()
  const table = base.getTableByIdIfExists(cursor.activeTableId!)

  const selectedRecords = useRecordsByIds(table!, cursor.selectedRecordIds)

  return { base, table, selectedRecords, cursor }
}
