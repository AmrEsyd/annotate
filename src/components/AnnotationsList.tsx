import React, { useEffect, useRef } from 'react'
import isDeepEqual from 'react-fast-compare'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList } from 'react-window'
import { ButtonProps } from 'types'

import { Record } from '@airtable/blocks/dist/types/src/models/models'
import {
  Box,
  Button,
  expandRecord,
  Icon,
  Label,
  Text,
  TextButton,
} from '@airtable/blocks/ui'
import styled from '@emotion/styled'

import { useAnnotation, useImage, useSettings } from '../hooks'
import { updateAndScaleImageBySize } from '../utils'
import { FabricStaticCanvas } from './FabricCanvas'
import { SideBarList } from './Layout'
import { ToolbarButton } from './toolbar'

type AnnotationProps = {
  record: Record
  imageFieldId: string
  storageFieldId: string
}

export const ImageContainer = styled(Button)`
  margin: 10px;
  padding: 10px;
  height: 150px;
  width: 200px;
  flex-direction: column;
  overflow: hidden;

  & span {
    display: block;
    width: 100%;
  }

  & img {
    max-width: 100%;
    max-height: 100%;
  }
`

const ColorLine = styled.div`
  position: absolute;
  border-radius: 9999px;
  top: 10%;
  left: 6%;
  width: 6px;
  height: 80%;
`

const _AnnotationCanvas: React.FC<AnnotationProps> = (props) => {
  const { record, imageFieldId, storageFieldId } = props
  const staticCanvasRef = useRef<fabric.StaticCanvas>(null)
  const annotation = useAnnotation(record, { imageFieldId, storageFieldId })
  const imageUrl = annotation.image?.thumbnails?.large?.url
  const [image] = useImage(imageUrl)

  useEffect(() => {
    const updateImage = (canvas: fabric.StaticCanvas) => {
      if (image) {
        canvas.backgroundImage = image
      }
      updateAndScaleImageBySize(canvas, image, {
        width: 180,
        height: 100,
      })
    }

    const StaticCanvas = staticCanvasRef.current

    if (StaticCanvas) {
      updateImage(StaticCanvas)

      if (annotation.jsonValue) {
        StaticCanvas?.loadFromJSON(annotation.jsonValue, () => {
          updateImage(StaticCanvas)
        })
      }
    }
  }, [annotation.jsonValue, image])

  const color = annotation.color && (
    <ColorLine style={{ backgroundColor: annotation.color.hex || undefined }} />
  )

  return (
    <>
      {color}
      <FabricStaticCanvas ref={staticCanvasRef} />
    </>
  )
}

const AnnotationCanvas = React.memo(_AnnotationCanvas, isDeepEqual)

type AnnotationListProps = {
  records: Record[] | null
  onAddNewClick?: ButtonProps['onClick']
  onClickRecord?: (record: Record) => void
}

export const _AnnotationList: React.FC<AnnotationListProps> = (props) => {
  const { records, onClickRecord, onAddNewClick } = props
  const { imageFieldId, storageFieldId } = useSettings()
  const filteredRecords = records?.filter((record) => !record.isDeleted) || null

  return (
    <Box flex="1" overflow="hidden" display="flex" flexDirection="column">
      <Box display="flex" alignItems="center" style={{ margin: '5px 0' }}>
        <Label
          flex="1"
          display="flex"
          alignItems="center"
          style={{ margin: 0 }}
        >
          <Icon name="italic" size={20} /> Annotations
        </Label>
        <ToolbarButton
          hideLabel
          label="Expand All Annotations"
          icon={
            <>
              {filteredRecords?.length}
              <Icon name="expand" marginLeft={1} />
            </>
          }
          margin={0}
          onClick={() =>
            filteredRecords &&
            expandRecord(filteredRecords[0], { records: filteredRecords })
          }
        />
        <ToolbarButton
          hideLabel
          label="New annotation"
          icon="plus"
          margin={0}
          shortcutId="newAnnotation"
          onClick={onAddNewClick}
        />
      </Box>
      <SideBarList>
        {filteredRecords?.length ? (
          <AutoSizer>
            {({ height, width }) => (
              <FixedSizeList
                style={{ outline: 'none' }}
                width={width}
                height={height}
                itemCount={filteredRecords.length}
                itemSize={170}
              >
                {({ index, style }) => {
                  const record = filteredRecords[index]
                  if (record.isDeleted) return <></>

                  return (
                    <div key={index} style={style}>
                      <ImageContainer
                        aria-label="Image"
                        key={record.id}
                        onClick={() => onClickRecord?.(record)}
                        style={{ overflow: 'hidden' }}
                        icon={
                          <Box borderRadius={2} overflow="hidden">
                            <AnnotationCanvas
                              key={filteredRecords[index].id}
                              record={filteredRecords[index]}
                              imageFieldId={imageFieldId as string}
                              storageFieldId={storageFieldId as string}
                            />
                          </Box>
                        }
                      >
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          {record?.name}
                          <ToolbarButton
                            hideLabel
                            label={`Expand ${record?.name}`}
                            icon="expand"
                            onClick={() => record && expandRecord(record)}
                          />
                        </Box>
                      </ImageContainer>
                    </div>
                  )
                }}
              </FixedSizeList>
            )}
          </AutoSizer>
        ) : (
          <Box margin="auto" textAlign="center">
            <Text>No Annotations</Text>
            <TextButton onClick={() => onAddNewClick?.()}>
              Create New
            </TextButton>
          </Box>
        )}
      </SideBarList>
    </Box>
  )
}

export const AnnotationList = React.memo(
  _AnnotationList,
  (prevProps, nextProps) => {
    //TODO: Use record ids instead of records
    // Only rerender when record ids update
    const prevRecordIds = prevProps.records?.map((record) => record.id)
    const nextRecordIds = nextProps.records?.map((record) => record.id)
    return isDeepEqual(prevRecordIds, nextRecordIds)
  }
)
