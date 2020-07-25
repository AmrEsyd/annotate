import { Canvas } from 'fabric/fabric-impl'
import { throttle } from 'lodash'
import React, { useEffect, useRef, useState } from 'react'

import { CollaboratorData } from '@airtable/blocks/dist/types/src/types/collaborator'
import { Box, CollaboratorToken, Text, useBase } from '@airtable/blocks/ui'

const TEXT_MAX_WIDTH = 120

export const CanvasHover: React.FC<{ canvas: Canvas | null }> = ({
  canvas,
}) => {
  const base = useBase()
  const boxRef = useRef<HTMLElement>(null)

  const [cursorPosition, setCursorPosition] = useState<{
    x: number
    y: number
  } | null>(null)

  const [objectInfo, setObjectInfo] = useState<{
    name?: string
    modifiedBy?: CollaboratorData | null
  } | null>(null)

  useEffect(() => {
    if (!canvas) return

    const handleMouseOver = (event: fabric.IEvent) => {
      const object = event.target
      if (object) {
        setObjectInfo({
          name: object.name,
          modifiedBy: base.getCollaboratorByIdIfExists(
            object?.modifiedBy || ''
          ),
        })
      } else {
        setObjectInfo(null)
        setCursorPosition(null)
      }
    }

    const handleMouseMove = throttle((event: fabric.IEvent) => {
      const mouseEvent = event.e instanceof MouseEvent ? event.e : null
      const object = event.target
      if (mouseEvent && object) {
        const container = document
          .querySelector('#canvasContainer')
          ?.getBoundingClientRect()
        const box = boxRef.current
        const boxWidth = box?.clientWidth || 0
        const boxHeight = box?.clientHeight || 0

        if (!container) return

        const shouldFlipX =
          container.width - boxWidth - mouseEvent.clientX - 10 < 0

        const shouldFlipY = container.height - mouseEvent.clientY - 15 < 0

        setCursorPosition({
          x: shouldFlipX
            ? mouseEvent.clientX - boxWidth
            : mouseEvent.clientX + 10,
          y: shouldFlipY
            ? mouseEvent.clientY - boxHeight
            : mouseEvent.clientY + 10,
        })
      }
    }, 50)

    const handleMouseOut = () => {
      setObjectInfo(null)
      setCursorPosition(null)
    }

    canvas.on({
      'mouse:over': handleMouseOver,
      'mouse:move': handleMouseMove,
      'mouse:out': handleMouseOut,
    })

    return () => {
      canvas?.off('mouse:over', handleMouseOver)
      canvas?.off('mouse:move', handleMouseMove)
      canvas?.off('mouse:out', handleMouseOut)
    }
  }, [base, canvas])

  if (!objectInfo) return <></>

  return cursorPosition && objectInfo ? (
    <Box
      ref={boxRef}
      position="absolute"
      zIndex={90}
      overflow="hidden"
      style={{
        top: cursorPosition.y,
        left: cursorPosition.x,
      }}
    >
      {objectInfo.modifiedBy && (
        <CollaboratorToken
          style={{ pointerEvents: 'none' }}
          key={objectInfo.modifiedBy.id}
          collaborator={objectInfo.modifiedBy}
          marginRight={1}
        />
      )}
      {objectInfo.name && (
        <Text
          backgroundColor="dark"
          width="fit-content"
          padding={1}
          borderRadius={2}
          maxWidth={TEXT_MAX_WIDTH}
          size="small"
          textColor="white"
          overflow="hidden"
          style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {objectInfo.name}
        </Text>
      )}
    </Box>
  ) : (
    <></>
  )
}
