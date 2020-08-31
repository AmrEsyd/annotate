import { fabric } from 'fabric-pure-browser'
import React, { useContext, useEffect, useRef, useState } from 'react'

import {
  FitInWindowMode,
  PopoverPlacements,
} from '@airtable/blocks/dist/types/src/ui/popover'
import {
  Box,
  Button,
  CollaboratorToken,
  Dialog,
  FormField,
  Icon,
  Input,
  Popover,
  Text,
  useBase,
} from '@airtable/blocks/ui'

import { Menu, MenuOption, renderOptions } from '../components'
import { EditorContext } from '../Editor'
import {
  deleteActiveObjects,
  getTimeFromNow,
  truncateCollaborator,
} from '../utils'
import { getLayerNameAndIcon } from './LayersPanel'

/** Max menu width */
const MENU_WIDTH = 140
/** Max collaborator name letters length */
const COLLABORATOR_LENGTH = 12

const RenameDialog: React.FC<{
  object: fabric.Object
  onClose: () => unknown
}> = ({ object, onClose }) => {
  const { name, icon } = getLayerNameAndIcon(object)
  const [value, setValue] = useState(name || '')

  const save = () => {
    if (value !== name) {
      object.set('name', value)
      object.canvas?.fire('state:modified', { target: object })
    }
    onClose()
  }

  return (
    <Dialog maxWidth="80vw" width="300px" onClose={onClose}>
      <Dialog.CloseButton />
      <FormField label={[icon, ' Name']}>
        <Input
          autoFocus
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </FormField>
      <Button onClick={save}>Save</Button>
    </Dialog>
  )
}

export type ContextMenuEvent = {
  position: { x: number; y: number }
  object?: fabric.Object
}

type ContextMenuProps = {
  menuEvent: ContextMenuEvent | null
  menuOptions: MenuOption[]
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  menuEvent,
  menuOptions,
}) => {
  const base = useBase()
  const menuRef = useRef<HTMLDivElement>(null)
  const { setContextMenu, canvas, canvasContainerRef } = useContext(
    EditorContext
  )
  const [renameObject, setRenameObject] = useState<fabric.Object | null>(null)

  useEffect(() => {
    const hideMenu = (event: MouseEvent) => {
      const menu = menuRef.current
      if (event.target instanceof HTMLCanvasElement) return

      if (
        menu &&
        !menu?.contains(event.target as any) &&
        event.button !== 3 /* 3 is a right click */
      ) {
        setContextMenu(null)
      }
    }

    window.addEventListener('mousedown', hideMenu)
    return () => {
      window.removeEventListener('mousedown', hideMenu)
    }
  }, [renameObject, canvasContainerRef, setContextMenu])

  useEffect(() => {
    const showMenu = (event: MouseEvent) => {
      if (canvasContainerRef.current === event.target) {
        event.stopPropagation()
        event.preventDefault()
        setContextMenu({ position: { x: event.clientX, y: event.clientY } })
      }
    }

    window.addEventListener('contextmenu', showMenu)
    return () => {
      window.removeEventListener('contextmenu', showMenu)
    }
  }, [renameObject, canvasContainerRef, setContextMenu])

  useEffect(() => {
    const renderContextMenu = (e: fabric.IEvent) => {
      if (e.button !== 3 /* 3 is a right click */) {
        setContextMenu(null)
        return
      }
      setContextMenu({ position: e.e as MouseEvent, object: e.target })
    }

    if (canvas) {
      canvas.on('mouse:down', renderContextMenu)
      return () => {
        canvas.off('mouse:down', renderContextMenu)
      }
    }
  }, [canvas, setContextMenu])

  if (renameObject) {
    return (
      <RenameDialog
        object={renameObject}
        onClose={() => setRenameObject(null)}
      />
    )
  } else if (!menuEvent) {
    return <></>
  }

  let menu: React.ReactElement
  const position = menuEvent.position
  const object = menuEvent.object

  const preventDefaultMenu = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    //prevent system context menu from showing when right clicking over the custom context menu
    event.stopPropagation()
    event.preventDefault()
  }

  if (!object) {
    //TODO: Default menu
    const options = renderOptions(menuOptions, 'dark')
    menu = (
      <Menu id="ContextMenu" type="dark" onContextMenu={preventDefaultMenu}>
        {options}
      </Menu>
    )
  } else if (object) {
    const { createdBy, modifiedBy, createdTime } = object

    const createdByCollaborator =
      createdBy && base.getCollaboratorByIdIfExists(createdBy)
    const modifiedByCollaborator =
      modifiedBy && base.getCollaboratorByIdIfExists(modifiedBy)

    const objectOptions = renderOptions(
      [
        {
          label: 'Rename',
          icon: 'edit',
          onClick: () => {
            setContextMenu(null)
            if (!(object instanceof fabric.ActiveSelection)) {
              setRenameObject(object)
            }
          },
        },
        {
          label: 'Bring To Front',
          icon: 'chevronUp',
          onClick: () => {
            object.bringToFront()
            setContextMenu(null)
          },
        },
        {
          label: 'Send To Back',
          icon: 'chevronDown',
          onClick: () => {
            object.sendToBack()
            setContextMenu(null)
          },
        },
        {
          label: 'Delete',
          icon: 'trash',
          onClick: () => {
            if (!canvas) return
            canvas.discardActiveObject()
            if (object instanceof fabric.ActiveSelection) {
              deleteActiveObjects(canvas)
            } else {
              canvas.remove(object)
            }

            setContextMenu(null)
          },
        },
      ],
      'dark'
    )

    menu = (
      <Menu
        id="ContextMenu"
        type="dark"
        style={{ maxWidth: MENU_WIDTH }}
        onContextMenu={preventDefaultMenu}
      >
        {modifiedByCollaborator && createdBy !== modifiedBy && (
          <Box paddingX={2} paddingY={1}>
            <Text textColor="white">Modified By</Text>
            <Box display="flex" alignItems="center" marginTop={1}>
              <Icon name="personalAuto" fillColor="white" marginRight={1} />
              <CollaboratorToken
                collaborator={truncateCollaborator(
                  modifiedByCollaborator,
                  COLLABORATOR_LENGTH
                )}
              />
            </Box>
          </Box>
        )}
        {createdByCollaborator && (
          <Box paddingX={2} paddingY={1}>
            <Text textColor="white">Created By</Text>
            <Box display="flex" alignItems="center" marginTop={1}>
              <Icon name="personal" fillColor="white" marginRight={1} />
              <CollaboratorToken
                collaborator={truncateCollaborator(
                  createdByCollaborator,
                  COLLABORATOR_LENGTH
                )}
              />
            </Box>
            <Box display="flex" alignItems="center" marginTop={1}>
              <Icon name="time" fillColor="white" marginRight={1} />
              <Text size="small" textColor="white">
                Created {getTimeFromNow(createdTime)}
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
      isOpen={!!menuEvent}
      onClose={() => setContextMenu(null)}
      fitInWindowMode={'flip' as FitInWindowMode}
      backgroundStyle={{ pointerEvents: 'none' }}
      renderContent={() => (
        <Box>
          <Box ref={menuRef}>{menu}</Box>
        </Box>
      )}
    >
      <div
        style={{
          position: 'absolute',
          left: position.x,
          top: position.y,
        }}
      />
    </Popover>
  )
}
