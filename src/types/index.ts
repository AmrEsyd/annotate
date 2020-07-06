import { ComponentProps } from 'react'

import { FieldType } from '@airtable/blocks/dist/types/src/types/field'
import { Button } from '@airtable/blocks/ui'

type FieldId = string
type TableId = string
type ViewId = string

export type ButtonProps = ComponentProps<typeof Button>

export type LookupOptions = {
  /**
   * whether the lookup field is correctly configured
   */
  isValid: boolean
  /**
   * the linked record field in this table that this field is
   * looking up
   */
  recordLinkFieldId: FieldId
  /**
   * the field in the foreign table that will be looked up on
   * each linked record
   */
  fieldIdInLinkedTable: FieldId | null
  /**
   * the local field configuration for the foreign field being
   * looked up
   */
  result?: undefined | { type: FieldType; options: unknown }
}

export type recordLinksOptions = {
  /**
   * The ID of the table this field links to
   */
  linkedTableId: TableId
  /**
   * The ID of the field in the linked table that links back
   * to this one
   */
  inverseLinkFieldId?: FieldId
  /**
   * The ID of the view in the linked table to use when showing
   * a list of records to select from
   */
  viewIdForRecordSelection?: ViewId
  /**
   * Whether linked records are rendered in the reverse order from the cell value in the
   * Airtable UI (i.e. most recent first)
   * You generally do not need to rely on this option.
   */
  isReversed: boolean
}
