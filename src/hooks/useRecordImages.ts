import { useMemo } from 'react'

import { Field, Record } from '@airtable/blocks/dist/types/src/models/models'
import { AttachmentData } from '@airtable/blocks/dist/types/src/types/attachment'
import is from '@sindresorhus/is'

import { LookupOptions } from '../types'

export type imageData = AttachmentData & { record: Record }

export const useRecordImages = (records?: Record[] | null) => {
  return useMemo(() => {
    let lookupAttachmentsFields: { field: Field; record: Record }[] = []

    const validRecords = records?.filter(
      (record) => !record.isDeleted && !record.parentTable.isDeleted
    )

    validRecords?.forEach((record) => {
      record.parentTable.fields.forEach((field) => {
        const options = field.options as LookupOptions
        if (
          field.type === 'multipleLookupValues' &&
          options.isValid &&
          options.result?.type === 'multipleAttachments'
        )
          lookupAttachmentsFields.push({ field, record })
      })
    })

    let images: imageData[] = []

    validRecords?.forEach((record) => {
      const attachmentsFields = record?.parentTable.fields.filter((field) => {
        const options = field.options as LookupOptions | null

        return (
          field.type === 'multipleAttachments' ||
          (field.type === 'multipleLookupValues' &&
            options?.isValid &&
            options?.result?.type === 'multipleAttachments')
        )
      })

      if (attachmentsFields && record) {
        attachmentsFields.forEach((field) => {
          if (!record || record.isDeleted) return
          const value = record.getCellValue(field)
          if (!is.array(value)) return
          const imageAttachments = value.filter(
            (attachment: AttachmentData) => {
              return !!attachment.thumbnails?.full //Full thumbnails are used in editor because it supports more image types
            }
          )

          imageAttachments.forEach((value) => {
            images.push({ ...value, record: record })
          })
        })
      }
    })

    return images
  }, [records])
}
