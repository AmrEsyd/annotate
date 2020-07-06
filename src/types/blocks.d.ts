import { Table } from '@airtable/blocks/dist/types/src/models/models'

declare module '@airtable/blocks/dist/types/src/models/models' {
  interface Record {
    parentTable: Table
  }
}
