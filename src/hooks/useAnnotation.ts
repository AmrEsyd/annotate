import lzString from 'lz-string'

import { Record } from '@airtable/blocks/dist/types/src/models/models'
import { AttachmentData } from '@airtable/blocks/dist/types/src/types/attachment'
import { colorUtils, useLoadable } from '@airtable/blocks/ui'
import is from '@sindresorhus/is'

import { useFieldValue } from './useFieldValue'

export const useAnnotation = (
  annotationRecord: Record | null | undefined,
  {
    imageFieldId,
    storageFieldId,
  }: { imageFieldId: string | null; storageFieldId: string | null }
) => {
  annotationRecord =
    !annotationRecord || annotationRecord?.isDeleted ? null : annotationRecord
  const [rawValue, setStorageValue, updatePermission] = useFieldValue<any>(
    annotationRecord,
    storageFieldId
  )
  const table = annotationRecord?.parentTable
  const view = !table || table?.isDeleted ? null : table.views[0]
  const viewMetadata = !view || view?.isDeleted ? null : view.selectMetadata()

  useLoadable(viewMetadata)

  //TODO: Return useful error messages
  if (annotationRecord?.isDeleted || table?.isDeleted)
    return { isDeleted: true }

  const color =
    viewMetadata && annotationRecord?.getColorInView(viewMetadata.parentView)

  const isImageFieldValid =
    is.string(imageFieldId) &&
    annotationRecord?.parentTable?.getFieldByIdIfExists(imageFieldId)?.type ===
      'multipleAttachments'

  const images =
    isImageFieldValid && imageFieldId && !annotationRecord?.isDeleted
      ? (annotationRecord?.getCellValue(imageFieldId) as AttachmentData[])
      : null

  const jsonValue = is.string(rawValue)
    ? lzString.decompressFromBase64(rawValue) || undefined
    : undefined

  const updateJsonStorage = (newDrawJson: string) => {
    if (updatePermission?.hasPermission) {
      setStorageValue(lzString.compressToBase64(newDrawJson))
    } else {
      //TODO: Show error
    }
  }

  return {
    image: images?.[0] || null,
    color: color && {
      hex: colorUtils.getHexForColor(color),
      shouldUseLightText: colorUtils.shouldUseLightTextOnColor(color),
    },
    jsonValue,
    updateJsonStorage,
    updatePermission,
  } as const
}
