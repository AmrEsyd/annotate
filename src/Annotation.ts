import lzString from 'lz-string'
import isEqual from 'react-fast-compare'

import { Field, Record, Table } from '@airtable/blocks/models'
import is from '@sindresorhus/is'

import { snackbar } from './components'
import { Attachment } from './hooks'

const textFieldTypes = ['multilineText', 'richText', 'singleLineText']

export class Annotation {
  record

  constructor(
    record: Record | null,
    private attachment: Attachment,
    public table: Table | null,
    private storageField: Field
  ) {
    this.record = record?.isDeleted ? null : record
    this.table = this.table?.isDeleted ? null : this.table
  }

  get name() {
    return this.attachment.filename
  }

  get storeUpdatePermission() {
    if (this.record && this.storageField && this.table) {
      return this.table.checkPermissionsForUpdateRecord(this.record, {
        [this.storageField.id]: undefined,
      })
    }
    return null
  }

  get imageUrl() {
    return this.attachment?.thumbnails?.full?.url || ''
  }

  get store() {
    const compressedValue = this.storageField
      ? this.record?.getCellValue(this.storageField)
      : null

    const storeString = is.string(compressedValue)
      ? lzString.decompressFromBase64(compressedValue) || undefined
      : undefined

    return storeString
  }

  get isDeleted() {
    if (
      !this.record ||
      !this.table ||
      !this.storageField ||
      this.record.isDeleted ||
      this.table.isDeleted ||
      this.storageField.isDeleted
    ) {
      return true
    }
    return false
  }

  private createStoreRecord(newStore: string) {
    if (!this.table) return
    const primaryFieldId = this.table.primaryField.id

    const newCompressedStore = lzString.compressToBase64(newStore)
    let newAnnotationRecordValue = {
      [primaryFieldId]: this.attachment.id,
      [this.storageField.id]: newCompressedStore,
    }

    const permissionsToCreateRecord = this.table.checkPermissionsForCreateRecord(
      newAnnotationRecordValue
    )

    if (!permissionsToCreateRecord.hasPermission)
      return snackbar(permissionsToCreateRecord.reasonDisplayString)

    return this.table.createRecordAsync(newAnnotationRecordValue)
  }

  updateStore(newStore: string | null) {
    if (!newStore) {
      if (this.record && this.table?.hasPermissionToDeleteRecord(this.record)) {
        this.table?.deleteRecordAsync(this.record)
      }
      return
    }
    if (!this.record) return this.createStoreRecord(newStore)

    if (!this.table || !this.storageField) return

    const newCompressedStore = lzString.compressToBase64(newStore)
    const oldCompressedStore = this.storageField
      ? this.record?.getCellValue(this.storageField)
      : null

    const isNotEqual = !isEqual(newCompressedStore, oldCompressedStore)

    if (
      this.storeUpdatePermission?.hasPermission &&
      isNotEqual &&
      textFieldTypes.includes(this.storageField.type)
    ) {
      return this.table
        .updateRecordAsync(this.record, {
          [this.storageField.id]: newCompressedStore,
        })
        .catch((error: Error) => {
          snackbar(error.message)
        })
    }
  }
}
