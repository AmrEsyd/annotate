import { fabric } from 'fabric-pure-browser'
import { IObjectOptions } from 'fabric/fabric-impl'
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

import { session } from '@airtable/blocks'
import { Record } from '@airtable/blocks/models'
import { Box } from '@airtable/blocks/ui'
import is from '@sindresorhus/is/dist'

import {
  CanvasContainer,
  CanvasHover,
  confirmDialog,
  ContextMenu,
  ContextMenuEvent,
  EditorContainer,
  IconButton,
  LeftPanel,
  MenuOption,
  PropertiesPanel,
  shortcutsList,
  Toolbar,
} from './components'
import { DrawCanvas } from './DrawCanvas'
import {
  Attachment,
  defaultStyle,
  useAnnotation,
  useCursor,
  useDeepCompareEffect,
  useHotkeys,
  useRecordsAttachments,
  useStyle,
} from './hooks'
import { BlockContext } from './Main'
import { CanvasTool, Select } from './tools'
import { downloadCanvasAsImage } from './utils'

type EditorContextType = {
  activeTool: CanvasTool | null
  handleToolChange: (newTool: CanvasTool | null) => void
  canvas: fabric.Canvas | null
  setCanvas: (canvas: fabric.Canvas | null) => unknown
  canvasContainerRef: React.RefObject<HTMLDivElement>
  setContextMenu: (menuEvent: ContextMenuEvent | null) => unknown
}

const FEEDBACK_FORM_LINK = `https://airtable.com/shrXM6X6edPU8MhgH`

export const EditorContext = React.createContext<EditorContextType>({} as any)

export const Editor: React.FC = () => {
  const { showKeyboardShortcuts } = useContext(BlockContext)
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
  const [activeTool, setActiveTool] = useState<CanvasTool | null>(null)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false)
  const [activeRecords, setActiveRecords] = useState<Record[] | null>(null)
  const [contextMenuEvent, setContextMenu] = useState<ContextMenuEvent | null>(
    null
  )
  const cursor = useCursor()

  const [
    activeAnnotationAttachment,
    setActiveAnnotation,
  ] = useState<Attachment | null>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)

  const {
    activeLayer,
    activeStyle,
    updateUserStyles,
    setSelectedLayer,
  } = useStyle(activeTool, canvas)

  const activeAnnotation = useAnnotation(activeAnnotationAttachment)

  const activeTable = activeRecords?.[0]?.parentTable
  const attachments = useRecordsAttachments(activeTable, activeRecords)

  useDeepCompareEffect(() => {
    if (is.nonEmptyArray(cursor.selectedRecords))
      setActiveRecords(cursor.selectedRecords)
  }, [cursor.selectedRecords])

  useEffect(() => {
    const firstAttachment = attachments?.[0]
    if (firstAttachment) {
      setActiveAnnotation(firstAttachment)
    } else {
      setActiveAnnotation(null)
    }
  }, [attachments])

  const canvasMenuOptions: MenuOption[] = [
    {
      label: 'Download image',
      icon: 'download',
      shortcutId: 'download',
      onClick: () =>
        canvas &&
        downloadCanvasAsImage(canvas, activeAnnotationAttachment?.filename),
    },
    {
      icon: 'laptop',
      label: 'Keyboard shortcuts',
      onClick: () => showKeyboardShortcuts?.(),
    },
    {
      icon: 'form',
      label: 'feedback',
      onClick() {
        const userEmail = session.currentUser?.email
        window.open(
          userEmail
            ? `${FEEDBACK_FORM_LINK}?prefill_Email=${userEmail}`
            : FEEDBACK_FORM_LINK
        )
      },
    },
    {
      label: 'Delete all layers',
      icon: 'trash',
      onClick: () =>
        confirmDialog({
          title: `Are you sure you want to delete all layers on ${activeAnnotation?.name}?`,
          isConfirmActionDangerous: true,
          onConfirm() {
            canvas?.remove(...canvas.getObjects())
          },
        }),
    },
  ]

  const handleToolChange = useCallback(
    (tool: CanvasTool | null) => {
      if (!canvas) return
      tool ||= new Select(canvas)
      const props: IObjectOptions = {
        ...defaultStyle,
        ...activeStyle,
      }

      if (activeTool?.name !== tool.name) {
        setActiveTool(tool)
        tool.configureCanvas?.(props)
      }
    },
    [activeTool?.name, canvas, activeStyle]
  )

  useHotkeys(
    shortcutsList.download.shortcuts,
    () =>
      canvas &&
      downloadCanvasAsImage(canvas, activeAnnotationAttachment?.filename),
    [canvas, downloadCanvasAsImage, activeAnnotationAttachment]
  )

  useEffect(() => {
    const permission = activeAnnotation?.storeUpdatePermission
    if (permission && !permission.hasPermission) {
      confirmDialog({
        title: 'Your changes will NOT be saved to the base',
        body: permission.reasonDisplayString,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAnnotation?.storeUpdatePermission?.hasPermission])

  let errorMessage: string | React.ReactNode = ''

  if (!activeRecords || activeRecords.length === 0) {
    errorMessage = 'Select a record to view the attachments annotations'
  } else if (!attachments || attachments?.length === 0) {
    if (activeRecords.length === 1) {
      if (!activeRecords || activeRecords[0]?.isDeleted) {
        errorMessage = 'Someone deleted the selected record'
      } else {
        errorMessage = 'Select a record to view the attachments annotations'
      }
    } else {
      errorMessage = 'No attachments in selected records.'
    }
  }

  const ToolbarButtons = [
    <IconButton
      hideLabel
      label={showSidebar ? 'Collapse sidebar' : 'Expand sidebar'}
      key="SidebarButton"
      shortcutId="sidebar"
      icon={showSidebar ? 'collapseSidebar' : 'expandSidebar'}
      onClick={() => {
        setShowSidebar(!showSidebar)
        setTimeout(() => window.dispatchEvent(new Event('resize')))
      }}
    />,
  ]

  const ToolbarButtonsRight = [
    <IconButton
      hideLabel
      label={showPropertiesPanel ? 'Collapse properties' : 'Expand properties'}
      key="PropertiesButton"
      shortcutId="sidebar"
      icon={showPropertiesPanel ? 'collapseSidebar' : 'expandSidebar'}
      onClick={() => {
        setShowPropertiesPanel(!showPropertiesPanel)
        setTimeout(() => window.dispatchEvent(new Event('resize')))
      }}
    />,
  ]

  return (
    <EditorContext.Provider
      value={{
        canvas,
        setCanvas,
        activeTool,
        handleToolChange,
        canvasContainerRef,
        setContextMenu,
      }}
    >
      <Box display="flex">
        <EditorContainer>
          <Toolbar
            updatePermission={activeAnnotation?.storeUpdatePermission}
            ToolbarButtons={ToolbarButtons}
            ToolbarButtonsRight={ToolbarButtonsRight}
          />
          <Box
            display="flex"
            flex="1"
            overflow="hidden"
            justifyContent="center"
            alignItems="stretch"
            width="100%"
            height="100%"
            backgroundColor="hsla(0, 0%, 0%, 0.05)"
          >
            {showSidebar && (
              <LeftPanel
                attachments={attachments}
                activeAnnotation={activeAnnotation}
                onClickAttachment={setActiveAnnotation}
              />
            )}
            <CanvasContainer
              onContextMenu={(e) => {
                e.preventDefault()
                setContextMenu({ position: { x: e.clientX, y: e.clientY } })
              }}
              ref={canvasContainerRef}
            >
              <ContextMenu
                menuEvent={contextMenuEvent}
                menuOptions={canvasMenuOptions}
              />
              <CanvasHover />
              {activeAnnotation && !errorMessage ? (
                <DrawCanvas
                  onSelection={setSelectedLayer}
                  key={activeAnnotation.record?.id}
                  store={activeAnnotation.store}
                  imageUrl={activeAnnotation.imageUrl}
                  updateStore={(newStore) =>
                    activeAnnotation.updateStore(newStore)
                  }
                />
              ) : (
                <Box flex="1" textAlign="center">
                  {errorMessage}
                </Box>
              )}
            </CanvasContainer>
            {showPropertiesPanel && (
              <PropertiesPanel
                activeLayer={activeLayer}
                styleValue={activeStyle}
                onChange={updateUserStyles}
              />
            )}
          </Box>
        </EditorContainer>
      </Box>
    </EditorContext.Provider>
  )
}
