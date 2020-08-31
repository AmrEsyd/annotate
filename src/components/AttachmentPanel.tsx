import React, { useEffect, useRef } from 'react'
import isDeepEqual from 'react-fast-compare'

import { Box, Button, expandRecord, Loader, Text } from '@airtable/blocks/ui'
import styled from '@emotion/styled'

import { Attachment, useAnnotation, useImage } from '../hooks'
import { updateAndScaleImage } from '../utils'
import { FabricStaticCanvas, IconButton } from './index'

type AttachmentProps = {
  attachment: Attachment
}

export const ImageContainer = styled(Button)`
  margin: 2.5%;
  padding: 0.2rem;
  height: 150px;
  width: 95%;
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

const _AttachmentCanvas: React.FC<AttachmentProps> = (props) => {
  const { attachment: record } = props
  const staticCanvasRef = useRef<fabric.StaticCanvas>(null)
  const annotation = useAnnotation(record)
  const [image] = useImage(annotation?.imageUrl)

  useEffect(() => {
    const updateImage = (canvas: fabric.StaticCanvas) => {
      if (image) {
        canvas.backgroundImage = image
      }
      updateAndScaleImage({
        canvas,
        image,
        dimensions: {
          width: 180,
          height: 100,
        },
      })
    }

    const StaticCanvas = staticCanvasRef.current

    if (StaticCanvas) {
      updateImage(StaticCanvas)

      if (annotation?.store) {
        StaticCanvas?.loadFromJSON(annotation.store, () => {
          updateImage(StaticCanvas)
        })
      }
    }
  }, [annotation?.store, image])

  return image ? (
    <Box backgroundColor="white">
      <FabricStaticCanvas ref={staticCanvasRef} />
    </Box>
  ) : (
    <Loader />
  )
}

const AttachmentCanvas = React.memo(_AttachmentCanvas, isDeepEqual)

type AttachmentPreviewProps = {
  attachment: Attachment
  onClickAttachment: (attachment: Attachment) => void
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachment,
  onClickAttachment,
}) => {
  return (
    <ImageContainer
      aria-label="Image"
      key={attachment.id}
      onClick={() => onClickAttachment?.(attachment)}
      style={{ overflow: 'hidden' }}
      icon={
        <Box
          flex="1"
          borderRadius={2}
          overflow="hidden"
          display="flex"
          alignItems="center"
        >
          <AttachmentCanvas key={attachment.id} attachment={attachment} />
        </Box>
      }
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Text
          minWidth={0}
          size="small"
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {attachment?.filename}
        </Text>
        <Box>
          <IconButton
            hideLabel
            label="Expand"
            icon="expand"
            onClick={() => attachment && expandRecord(attachment.record)}
          />
        </Box>
      </Box>
    </ImageContainer>
  )
}

type AttachmentPanelProps = {
  attachments: Attachment[]
  onClickAttachment: (attachment: Attachment) => void
}

export const _AttachmentPanel: React.FC<AttachmentPanelProps> = (props) => {
  const { attachments, onClickAttachment } = props

  return (
    <Box display="flex" flexDirection="column" width="100%">
      {attachments.map((attachment) => (
        <AttachmentPreview
          key={attachment.id}
          attachment={attachment}
          onClickAttachment={onClickAttachment}
        />
      ))}
    </Box>
  )
}

export const AttachmentPanel = React.memo(_AttachmentPanel, isDeepEqual)
