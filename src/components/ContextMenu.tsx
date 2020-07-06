import { fabric } from 'fabric-pure-browser'
import React, { useEffect, useState } from 'react'

import {
  FitInWindowMode,
  PopoverPlacements,
} from '@airtable/blocks/dist/types/src/ui/popover'
import {
  Box,
  CollaboratorToken,
  Icon,
  Popover,
  Text,
  useBase,
} from '@airtable/blocks/ui'

import { Menu, MenuOption, renderOptions } from '../components'
import { getTimeFromNow } from '../utils/time'

export const ContextMenu: React.FC<{
  canvasMenuOptions: MenuOption[]
  canvas: fabric.Canvas | null
}> = ({ canvas, canvasMenuOptions }) => {
  const base = useBase()
  const [
    contextMenuEvent,
    setContextMenuEvent,
  ] = useState<fabric.IEvent | null>(null)

  useEffect(() => {
    const hideMenu = (event: MouseEvent) => {
      const menu = document.getElementById('ContextMenu')
      if (
        !(event.target instanceof HTMLCanvasElement) &&
        !menu?.contains(event.target as any)
      ) {
        setContextMenuEvent(null)
      }
    }
    window.addEventListener('mousedown', hideMenu)
    return () => {
      window.removeEventListener('mousedown', hideMenu)
    }
  }, [])

  useEffect(() => {
    const renderContextMenu = (e: fabric.IEvent) => {
      if (e.button !== 3 /* 3 is a right click */) {
        setContextMenuEvent(null)
        return
      }
      setContextMenuEvent(e)
    }

    if (canvas) {
      canvas.on('mouse:down', renderContextMenu)
      return () => {
        canvas.off('mouse:down', renderContextMenu)
      }
    }
  }, [canvas])

  if (!contextMenuEvent) return <></>

  let menu: React.ReactElement
  const mouseEvent = contextMenuEvent.e as MouseEvent
  const object = contextMenuEvent.target

  const preventDefaultMenu = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    //prevent system context menu from showing when right clicking over the custom context menu
    event.stopPropagation()
    event.preventDefault()
  }

  if (!object) {
    const canvasOptions = renderOptions(canvasMenuOptions, 'dark')
    menu = (
      <Menu id="ContextMenu" type="dark" onContextMenu={preventDefaultMenu}>
        {canvasOptions}
      </Menu>
    )
  } else if (object) {
    const { createdBy, modifiedBy, createdTime, modifiedTime } = object

    const createdByCollaborator =
      createdBy && base.getCollaboratorByIdIfExists(createdBy)
    const modifiedByCollaborator =
      modifiedBy && base.getCollaboratorByIdIfExists(modifiedBy)

    const objectOptions = renderOptions(
      [
        {
          label: 'Bring To Front',
          icon: 'chevronUp',
          onClick: () => {
            object.bringToFront()
            setContextMenuEvent(null)
          },
        },
        {
          label: 'Send To Back',
          icon: 'chevronDown',
          onClick: () => {
            object.sendToBack()
            setContextMenuEvent(null)
          },
        },
        {
          label: 'Delete',
          icon: 'trash',
          onClick: () => {
            const canvas = object?.canvas
            if (object instanceof fabric.ActiveSelection) {
              object.forEachObject((o) => canvas?.fxRemove(o))
            } else {
              canvas?.fxRemove(object)
            }
            setContextMenuEvent(null)
          },
        },
      ],
      'dark'
    )

    menu = (
      <Menu id="ContextMenu" type="dark" onContextMenu={preventDefaultMenu}>
        {object.name && (
          <Text paddingX={2} paddingY={1} marginLeft={1} textColor="white">
            {object.name}
          </Text>
        )}
        {createdByCollaborator && (
          <Box paddingX={2} paddingY={1}>
            <Text textColor="white">
              <Icon name="personalAuto" key="icon" /> Created By
            </Text>
            <Box display="flex" alignItems="center">
              <CollaboratorToken collaborator={createdByCollaborator} />
              <Text size="small" textColor="white" marginLeft="auto">
                {getTimeFromNow(createdTime)}
              </Text>
            </Box>
          </Box>
        )}
        {modifiedByCollaborator && (
          <Box paddingX={2} paddingY={1}>
            <Text textColor="white">
              <Icon name="personalAuto" key="icon" /> Modified By
            </Text>
            <Box display="flex" alignItems="center">
              <CollaboratorToken collaborator={modifiedByCollaborator} />
              <Text size="small" textColor="white" marginLeft="auto">
                {getTimeFromNow(modifiedTime)}
              </Text>
            </Box>
          </Box>
        )}
        {objectOptions}
      </Menu>
    )
  }

  return (
    <Popover
      placementX={'right' as PopoverPlacements.LEFT}
      isOpen={!!contextMenuEvent}
      onClose={() => setContextMenuEvent(null)}
      fitInWindowMode={'flip' as FitInWindowMode}
      backgroundStyle={{ pointerEvents: 'none' }}
      renderContent={() => menu}
    >
      <div
        style={{
          position: 'absolute',
          left: mouseEvent.x,
          top: mouseEvent.y,
        }}
      />
    </Popover>
  )
}
