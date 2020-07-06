import React, { FC, useState } from 'react'
import { recordLinksOptions } from 'types'

import { Record } from '@airtable/blocks/dist/types/src/models/models'
import { AttachmentData } from '@airtable/blocks/dist/types/src/types/attachment'
import {
  Box,
  Button,
  Dialog,
  FormField,
  Heading,
  Input,
  Text,
  useBase,
} from '@airtable/blocks/ui'
import is from '@sindresorhus/is'

import { imageData, useRecordImages, useSettings } from '../hooks'
import { ImageContainer } from './AnnotationsList'
import { snackbar } from './snackbar'

type NewAnnotationDialogProps = Omit<
  Dialog['props'],
  'children' | 'onClose'
> & {
  records: Record[] | null
  onSelect: (newAnnotationRecordId: Record | null) => void
}

const EMPTY_CANVAS_ID = 'emptyCanvas'

export const NewAnnotationDialog: FC<NewAnnotationDialogProps> = (props) => {
  const { records, onSelect, ...dialogProps } = props
  const base = useBase()
  const { annotationsTableId, imageFieldId } = useSettings()
  const activeRecordsImages = useRecordImages(records)
  const annotationsTable = base.getTableByIdIfExists(annotationsTableId!)
  const [dialogContent, setDialogContent] = useState<React.ReactNode | null>(
    null
  )

  const createAnnotation = async (
    name: string,
    imageToAdd: AttachmentData,
    record: Record
  ) => {
    if (!annotationsTable || annotationsTable.isDeleted)
      return Error(`There is no Annotations Table`)

    const annotationsTableName = annotationsTable.name

    if (!is.string(imageFieldId)) {
      return Error('imageFieldId is not selected')
    }

    if (!record || record.isDeleted) return Error('Selected record is deleted')

    const recordTable = record.parentTable

    if (!recordTable || recordTable.isDeleted)
      return Error('Selected record table is deleted')

    const recordTableName = recordTable?.name

    /** First field linking to the annotations table*/
    const linkField = recordTable.fields.find((field) => {
      const { linkedTableId } = (field.options || {}) as recordLinksOptions
      return (
        field.type === 'multipleRecordLinks' &&
        linkedTableId === annotationsTableId
      )
    })

    if (!linkField) {
      if (recordTable.unstable_hasPermissionToCreateField()) {
        //TODO : Create field when 'multipleRecordLinks' fields are supported
        setDialogContent(
          `You need to add a 'Link to another record' field in '${recordTableName}' table linking to '${annotationsTableName}' table.`
        )
      }
      return Error(
        `You can't create a new annotation because '${recordTableName}' it is not linked to '${annotationsTableName}'.`
      )
    }

    const primaryFieldId = annotationsTable.primaryField.id

    let newAnnotationRecordValue = {
      [primaryFieldId]: name,
      [imageFieldId]: [imageToAdd],
    }

    if (imageToAdd.id === EMPTY_CANVAS_ID)
      newAnnotationRecordValue = {
        [primaryFieldId]: name,
      }

    const permissionsToCreateRecord = annotationsTable.checkPermissionsForCreateRecord(
      newAnnotationRecordValue
    )

    if (!permissionsToCreateRecord.hasPermission)
      return Error(permissionsToCreateRecord.reasonDisplayString)

    const newAnnotationRecordId = await annotationsTable.createRecordAsync(
      newAnnotationRecordValue
    )

    const oldValue = record.getCellValue(linkField)
    const recordUpdate = {
      [linkField.id]: is.array(oldValue)
        ? [...oldValue, { id: newAnnotationRecordId }]
        : [{ id: newAnnotationRecordId }],
    }

    const permissionToUpdate = recordTable.checkPermissionsForUpdateRecord(
      record,
      recordUpdate
    )

    if (permissionToUpdate.hasPermission) {
      await recordTable.updateRecordAsync(record, recordUpdate)
      return newAnnotationRecordId
    } else {
      return Error(permissionToUpdate.reasonDisplayString)
    }
  }

  const emptyCanvas: imageData | undefined = records?.[0] && {
    id: EMPTY_CANVAS_ID,
    url: '',
    filename: 'Empty Canvas',
    record: records?.[0],
  }

  return (
    <>
      {dialogContent && (
        <Dialog
          onClose={() => {
            setDialogContent(null)
          }}
        >
          <Dialog.CloseButton />
          <Box marginRight={2}>{dialogContent}</Box>
        </Dialog>
      )}
      <Dialog
        width="auto"
        maxHeight="90vh"
        onClose={() => {
          onSelect(null)
        }}
        {...dialogProps}
      >
        <Dialog.CloseButton />
        <ImageList
          images={[emptyCanvas, ...activeRecordsImages]}
          primaryFieldName={
            (!annotationsTable?.isDeleted &&
              annotationsTable?.primaryField.name) ||
            'Annotation'
          }
          onSelect={async (name, selected, onFailed) => {
            if (!selected) return
            const { record, ...image } = selected
            const recordId = await createAnnotation(
              name || 'Annotation',
              image,
              record
            )

            if (is.error(recordId)) {
              snackbar(recordId.message, 5)
              onFailed()
            } else {
              snackbar(`Added '${name}' to '${annotationsTable?.name}'`, 5)
              annotationsTable?.selectRecordsAsync().then((records) => {
                onSelect(records.getRecordByIdIfExists(recordId))
              })
            }
          }}
        />
      </Dialog>
    </>
  )
}

type ImageListProps = {
  images: (imageData | undefined)[]
  primaryFieldName: string
  onSelect: (
    name: string,
    imageData: imageData | null,
    onFailed: () => void
  ) => void
}
const ImageList: React.FC<ImageListProps> = (props) => {
  const { images, primaryFieldName, onSelect } = props
  const [searchValue, setSearchValue] = useState('')
  const [selectedImage, setSelectedImage] = useState<imageData>()
  const [nameValue, setNameValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (selectedImage) {
    return (
      <Box width="250px">
        <FormField label={`Annotation ${primaryFieldName}`}>
          <Input
            autoFocus
            disabled={isLoading}
            onChange={(e) => setNameValue(e.target.value)}
            value={nameValue}
          />
        </FormField>
        <Button
          variant="primary"
          disabled={isLoading}
          onClick={() => {
            onSelect(nameValue, selectedImage, () => {
              setIsLoading(false)
            })
            setIsLoading(true)
          }}
        >
          Create Annotation
        </Button>
      </Box>
    )
  }

  return (
    <Box width="80vw" maxWidth="500px">
      <Heading>Create new annotation</Heading>
      <Box
        position="sticky"
        top="-16px"
        backgroundColor="#fff"
        zIndex={20}
        paddingTop="16px"
        paddingBottom="5px"
      >
        <Input
          placeholder="Find an image"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </Box>
      <Box display="flex" flexWrap="wrap" justifyContent="center">
        {images
          .filter(
            (image) =>
              image &&
              image.filename.toLowerCase().includes(searchValue.toLowerCase())
          )
          .map(
            (image) =>
              image && (
                // eslint-disable-next-line react/jsx-key
                <ImageContainer
                  style={{ width: '160px' }}
                  variant={'secondary'}
                  onClick={() => setSelectedImage(image)}
                  icon={
                    <Box
                      flex="1"
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      overflow="hidden"
                    >
                      {image.id === EMPTY_CANVAS_ID && (
                        <Text fontSize={64}>🎨</Text>
                      )}
                      <img src={image.thumbnails?.large?.url} />
                    </Box>
                  }
                >
                  {image.filename}
                </ImageContainer>
              )
          )}
      </Box>
    </Box>
  )
}
