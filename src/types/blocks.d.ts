import { Table } from '@airtable/blocks/models'

declare module '@airtable/blocks/models' {
  interface Record {
    parentTable: Table
  }
}
