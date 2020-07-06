import { Canvas } from 'fabric/fabric-impl'
import clamp from 'lodash/clamp'
import React, { useEffect, useState } from 'react'

import { Box, CollaboratorToken, Text, useBase } from '@airtable/blocks/ui'

const COLLABORATOR_TOKEN_HIGHT = 25
const COLLABORATOR_TOKEN_MAX_WIDTH = 80

export const CanvasHover: React.FC<{ canvas: Canvas | null }> = ({
  canvas,
}) => {
  const base = useBase()
  const [hoveredObject, setObjectNode] = useState<fabric.Object | null>(null)
  const modifiedByCollaborator = base.getCollaboratorByIdIfExists(
    hoveredObject?.modifiedBy || ''
  )

  useEffect(() => {
    if (!canvas) return

    const handleMouseOver = (event: fabric.IEvent) => {
      const node = event.target
      if (node) {
        setObjectNode(node)
      } else {
        setObjectNode(null)
      }
    }

    const handleMouseOut = () => {
      setObjectNode(null)
    }

    canvas.on({ 'mouse:over': handleMouseOver, 'mouse:out': handleMouseOut })

    return () => {
      canvas?.off('mouse:over', handleMouseOver)
      canvas?.off('mouse:out', handleMouseOut)
    }
  }, [canvas])

  if (!modifiedByCollaborator || !hoveredObject) return <></>

  const container = hoveredObject.canvas?.getElement()
  const containerBoundingRect = container?.getBoundingClientRect()
  const objectBoundingRect = hoveredObject.getBoundingRect()

  if (objectBoundingRect.width / 2 < COLLABORATOR_TOKEN_MAX_WIDTH) return <></>

  const x = clamp(
    objectBoundingRect.left + (containerBoundingRect?.x || 0),
    containerBoundingRect?.left || 0,
    (containerBoundingRect?.right || window.innerWidth) -
      COLLABORATOR_TOKEN_MAX_WIDTH
  )

  const y = clamp(
    objectBoundingRect.top +
      (containerBoundingRect?.y || 0) -
      COLLABORATOR_TOKEN_HIGHT,
    containerBoundingRect?.top || 0,
    (containerBoundingRect?.bottom || window.innerHeight) -
      COLLABORATOR_TOKEN_HIGHT
  )

  return hoveredObject ? (
    <Box
      position="absolute"
      top={`${y}px`}
      left={`${x}px`}
      zIndex={90}
      overflow="hidden"
      maxWidth={COLLABORATOR_TOKEN_MAX_WIDTH}
    >
      {modifiedByCollaborator && (
        <CollaboratorToken
          style={{ pointerEvents: 'none' }}
          key={modifiedByCollaborator.id}
          collaborator={modifiedByCollaborator}
          marginRight={1}
        />
      )}
      {hoveredObject.name && (
        <Text
          backgroundColor="dark"
          width="fit-content"
          padding={1}
          borderRadius={2}
          maxWidth={COLLABORATOR_TOKEN_MAX_WIDTH}
          size="small"
          textColor="white"
          overflow="hidden"
          style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {hoveredObject.name}
        </Text>
      )}
    </Box>
  ) : (
    <></>
  )
}
