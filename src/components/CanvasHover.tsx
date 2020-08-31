import throttle from 'lodash/throttle'
import truncate from 'lodash/truncate'
import React, { useContext, useEffect, useRef, useState } from 'react'

import { CollaboratorData } from '@airtable/blocks/dist/types/src/types/collaborator'
import {
  Box,
  CollaboratorToken,
  Icon,
  Text,
  useBase,
} from '@airtable/blocks/ui'

import { EditorContext } from '../Editor'
import { getTimeFromNow, truncateCollaborator } from '../utils'

/** Max tooltip width */
const TOOLTIP_WIDTH = 150
/** Max shape name letters length */
const SHAPE_NAME_LENGTH = 48
/** Max collaborator name letters length */
const COLLABORATOR_LENGTH = 12

export const CanvasHover: React.FC = () => {
  const base = useBase()
  const boxRef = useRef<HTMLElement>(null)
  const { canvas, canvasContainerRef } = useContext(EditorContext)

  const [cursorPosition, setCursorPosition] = useState<{
    x: number
    y: number
  } | null>(null)

  const [objectInfo, setObjectInfo] = useState<{
    name?: string
    createdBy?: CollaboratorData | null
    modifiedBy?: CollaboratorData | null
    modifiedTime?: number | null
    createdTime?: number | null
  } | null>(null)

  useEffect(() => {
    if (!canvas) return

    const handleMouseOver = (event: fabric.IEvent) => {
      const object = event.target
      if (object && object.type !== 'activeSelection') {
        const modifiedByCollaborator = base.getCollaboratorByIdIfExists(
          object?.modifiedBy!
        )
        const createdByCollaborator = base.getCollaboratorByIdIfExists(
          object?.createdBy!
        )

        setObjectInfo({
          name: truncate(object.name, { length: SHAPE_NAME_LENGTH }),
          modifiedTime: object.modifiedTime,
          createdTime: object.createdTime,
          createdBy:
            createdByCollaborator &&
            truncateCollaborator(createdByCollaborator, COLLABORATOR_LENGTH),
          modifiedBy:
            modifiedByCollaborator &&
            truncateCollaborator(modifiedByCollaborator, COLLABORATOR_LENGTH),
        })
      } else if (objectInfo) {
        setObjectInfo(null)
        setCursorPosition(null)
      }
    }

    const handleMouseMove = throttle((event: fabric.IEvent) => {
      const mouseEvent = event.e instanceof MouseEvent ? event.e : null
      const object = event.target

      if (mouseEvent && object && objectInfo) {
        const container = canvasContainerRef.current?.getBoundingClientRect()
        const box = boxRef.current

        const boxWidth = (box?.clientWidth || 0) + 10
        const boxHeight = (box?.clientHeight || 0) + 10

        if (!container) return

        const shouldFlipX =
          container.left + container.width - boxWidth - mouseEvent.clientX < 0
        const shouldFlipY =
          container.top + container.height - boxHeight - mouseEvent.clientY < 0

        setCursorPosition({
          x: shouldFlipX
            ? mouseEvent.clientX - boxWidth
            : mouseEvent.clientX + 10,
          y: shouldFlipY
            ? mouseEvent.clientY - boxHeight
            : mouseEvent.clientY + 10,
        })
      } else {
        handleMouseOver(event)
      }
    }, 50)

    const handleMouseOut = () => {
      setObjectInfo(null)
      setCursorPosition(null)
    }

    canvas.on({
      'mouse:over': handleMouseOver,
      'mouse:move': handleMouseMove,
      'mouse:wheel': handleMouseMove,
      'mouse:out': handleMouseOut,
    })

    return () => {
      canvas?.off('mouse:over', handleMouseOver)
      canvas?.off('mouse:move', handleMouseMove)
      canvas?.off('mouse:wheel', handleMouseMove)
      canvas?.off('mouse:out', handleMouseOut)
    }
  }, [base, canvas, objectInfo, canvasContainerRef])

  if (!objectInfo) return <></>

  const { name, modifiedBy, createdBy, modifiedTime, createdTime } = objectInfo

  return cursorPosition && objectInfo ? (
    <Box
      ref={boxRef}
      backgroundColor="dark"
      padding={1}
      borderRadius={3}
      maxWidth={TOOLTIP_WIDTH}
      position="absolute"
      zIndex={90}
      overflow="hidden"
      style={{
        top: cursorPosition.y,
        left: cursorPosition.x,
      }}
    >
      {name && (
        <Box display="flex" alignItems="center">
          <Icon name="text" fillColor="white" marginRight={1} />
          <Text width="fit-content" textColor="white" marginBottom={1}>
            {name}
          </Text>
        </Box>
      )}
      {modifiedTime && (
        <Box display="flex" alignItems="center" marginTop={1}>
          <Icon name="time" fillColor="white" marginRight={1} />
          <Text size="small" textColor="white">
            {modifiedTime !== createdTime ? 'Edited' : 'Created'}{' '}
            {getTimeFromNow(modifiedTime)}
          </Text>
        </Box>
      )}
      {modifiedBy && modifiedBy.id !== createdBy?.id && (
        <Box display="flex" alignItems="center" marginTop={1}>
          <Icon name="personalAuto" fillColor="white" marginRight={1} />
          <CollaboratorToken collaborator={modifiedBy} />
        </Box>
      )}
      {createdBy && (
        <Box display="flex" alignItems="center" marginTop={1}>
          <Icon name="personal" fillColor="white" marginRight={1} />
          <CollaboratorToken collaborator={createdBy} />
        </Box>
      )}
    </Box>
  ) : (
    <></>
  )
}
