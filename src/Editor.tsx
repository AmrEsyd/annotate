import { fabric } from 'fabric-pure-browser'
import { IObjectOptions } from 'fabric/fabric-impl'
import React, { useCallback, useContext, useEffect, useState } from 'react'

import { Record } from '@airtable/blocks/dist/types/src/models/models'
import { Box, expandRecord, TextButton } from '@airtable/blocks/ui'

import {
  AnnotationList,
  CanvasHover,
  ContextMenu,
  Divider,
  EditorContainer,
  MenuOption,
  NewAnnotationDialog,
  ShapesList,
  shortcutsList,
  SideBar,
  snackbar,
  Toolbar,
  ToolbarButton,
} from './components'
import { DrawCanvas } from './DrawCanvas'
import {
  defaultStyle,
  useActiveRecords,
  useAnnotation,
  useHotkeys,
  useLinkedRecords,
  useSettings,
  useStyle,
} from './hooks'
import { BlockContext } from './Main'
import { CanvasTool, Select } from './tools'
import { downloadCanvasAsImage } from './utils'

export const Editor: React.FC = () => {
  const [
    activeRecords,
    {
      reloadRecords,
      pickerButton,
      activeTable,
      goToNextRecord,
      goToPreviousRecord,
      isFirstRecord,
      isLastRecord,
    },
  ] = useActiveRecords()
  const { showKeyboardShortcuts } = useContext(BlockContext)
  const [isImagesDialogOpen, setIsImagesDialog] = useState(false)
  const { annotationsTableId, imageFieldId, storageFieldId } = useSettings()
  const isAnnotationTableActive = annotationsTableId === activeTable?.id
  const linkedRecords = useLinkedRecords(
    isAnnotationTableActive ? null : activeRecords,
    annotationsTableId
  )
  const [activeAnnotationRecord, setActiveAnnotation] = useState<Record | null>(
    null
  )
  const activeAnnotation = useAnnotation(activeAnnotationRecord, {
    imageFieldId,
    storageFieldId,
  })
  const [shouldExpandSidebar, setShouldExpandSidebar] = useState(true)
  const [activeTool, setActiveTool] = useState<CanvasTool | null>(null)
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
  const { activeStyle, updateUserStyles, setSelectedObjectStyle } = useStyle(
    activeTool,
    canvas
  )

  const annotationRecords = isAnnotationTableActive
    ? activeRecords
    : linkedRecords

  useEffect(() => {
    const firstRecord = annotationRecords?.[0]
    if (firstRecord && !firstRecord.isDeleted) {
      setActiveAnnotation(firstRecord)
      snackbar(firstRecord.name)
    } else {
      setActiveAnnotation(null)
    }
  }, [annotationRecords])

  const nextAnnotation = () => {
    const activeIndex =
      activeAnnotationRecord && annotationRecords
        ? annotationRecords.indexOf(activeAnnotationRecord)
        : -1
    const nextAnnotationRecord = annotationRecords?.[activeIndex + 1]
    if (nextAnnotationRecord) {
      setActiveAnnotation(nextAnnotationRecord)
      snackbar(nextAnnotationRecord.name)
    }
  }

  const previousAnnotation = () => {
    const index =
      activeAnnotationRecord &&
      annotationRecords?.indexOf(activeAnnotationRecord)
    const previousAnnotation = index && annotationRecords?.[index - 1]
    if (previousAnnotation) {
      setActiveAnnotation(previousAnnotation)
      snackbar(previousAnnotation.name)
    }
  }

  const canvasMenuOptions: MenuOption[] = [
    {
      label: 'Save',
      icon: 'download',
      shortcutId: 'save',
      onClick: () =>
        canvas && downloadCanvasAsImage(canvas, activeAnnotationRecord?.name),
    },
    {
      icon: 'laptop',
      label: 'Keyboard shortcuts',
      onClick: () => showKeyboardShortcuts?.(),
    },
    {
      label: 'Delete All',
      icon: 'trash',
      onClick: () => canvas?.remove(...canvas.getObjects()),
    },
  ]

  const handleToolChange = useCallback(
    (newTool: CanvasTool | null) => {
      if (!canvas) return
      const tool = newTool || new Select(canvas)
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
    shortcutsList.previousAnnotation.shortcuts.join(),
    previousAnnotation,
    [setActiveAnnotation, activeAnnotationRecord, annotationRecords]
  )

  useHotkeys(shortcutsList.nextAnnotation.shortcuts.join(), nextAnnotation, [
    setActiveAnnotation,
    activeAnnotationRecord,
    annotationRecords,
  ])

  useHotkeys(
    shortcutsList.save.shortcuts.join(),
    () => canvas && downloadCanvasAsImage(canvas, activeAnnotationRecord?.name),
    [canvas, downloadCanvasAsImage, activeAnnotationRecord]
  )

  useHotkeys(
    shortcutsList.newAnnotation.shortcuts.join(),
    () => setIsImagesDialog(true),
    [canvas]
  )

  const createNewAnnotation = (
    <TextButton onClick={() => setIsImagesDialog(true)}>
      Create a new annotation
    </TextButton>
  )

  let errorMessage: string | React.ReactNode = ''

  if (!activeRecords || activeRecords.length === 0) {
    errorMessage = 'Select a record to view the annotation'
  } else if (!annotationRecords || annotationRecords?.length === 0) {
    if (activeRecords.length === 1) {
      if (!activeRecords || activeRecords[0]?.isDeleted) {
        errorMessage = 'Someone deleted the selected record'
      } else {
        errorMessage = (
          <>
            There are no annotations linked to the record{' '}
            <b>{activeRecords[0]?.name}</b>. {createNewAnnotation}.
          </>
        )
      }
    } else {
      errorMessage = (
        <>
          There are no annotations linked to the selected records.{' '}
          {createNewAnnotation}.
        </>
      )
    }
  } else if (activeAnnotation.isDeleted) {
    errorMessage = 'Someone deleted the Annotation record.'
  }

  const ToolbarButtons = [
    <ToolbarButton
      hideLabel
      label={shouldExpandSidebar ? 'Collapse sidebar' : 'Expand sidebar'}
      key="SidebarButton"
      shortcutId="sidebar"
      icon={shouldExpandSidebar ? 'collapseSidebar' : 'expandSidebar'}
      onClick={() => {
        setShouldExpandSidebar(!shouldExpandSidebar)
        setTimeout(() => window.dispatchEvent(new Event('resize')))
      }}
    />,
    <ToolbarButton
      key="PreviousRecord"
      label="Previous record"
      icon="chevronLeft"
      shortcutId="previousRecord"
      onClick={(e) => {
        if (e?.shiftKey) {
          previousAnnotation()
        } else {
          goToPreviousRecord()
        }
      }}
      disabled={isFirstRecord}
    />,
    <ToolbarButton
      style={{ flexDirection: 'row-reverse' }}
      key="NextRecord"
      label="Next Record"
      icon="chevronRight"
      shortcutId="nextRecord"
      onClick={(e) => {
        if (e?.shiftKey) {
          nextAnnotation()
        } else {
          goToNextRecord()
        }
      }}
      disabled={isLastRecord}
    />,
    pickerButton,
    activeRecords && (
      <ToolbarButton
        key="ExpandRecord"
        label="Expand record"
        shortcutId="expandRecord"
        icon="expand"
        onClick={() =>
          expandRecord(activeRecords[0], { records: activeRecords })
        }
      />
    ),
  ]

  return (
    <Box display="flex">
      {isImagesDialogOpen && !isAnnotationTableActive && (
        <NewAnnotationDialog
          records={activeRecords}
          onSelect={(newAnnotationRecord) => {
            if (newAnnotationRecord) {
              reloadRecords()
              setActiveAnnotation(newAnnotationRecord)
            }
            setIsImagesDialog(false)
          }}
        />
      )}
      <EditorContainer>
        <Toolbar
          canvas={canvas}
          handleToolChange={handleToolChange}
          styleValue={activeStyle}
          handleStyleValueChange={updateUserStyles}
          updatePermission={activeAnnotation.updatePermission}
          currentTool={activeTool}
          canvasMenuOptions={canvasMenuOptions}
          ToolbarButtons={ToolbarButtons}
        />
        <Box
          display="flex"
          flex="1"
          overflow="hidden"
          justifyContent="center"
          alignItems="stretch"
          width="100%"
          height="100%"
        >
          {shouldExpandSidebar && (
            <SideBar>
              <ShapesList canvas={canvas} />
              <Divider />
              <AnnotationList
                records={annotationRecords}
                onClickRecord={setActiveAnnotation}
                onAddNewClick={() => setIsImagesDialog(true)}
              />
            </SideBar>
          )}
          <Box
            display="flex"
            flex="1"
            justifyContent="center"
            alignItems="center"
            overflow="hidden"
            id="canvasContainer"
          >
            <ContextMenu
              canvas={canvas}
              canvasMenuOptions={canvasMenuOptions}
            />
            <CanvasHover canvas={canvas} />
            {activeAnnotationRecord && !activeAnnotation.isDeleted ? (
              <DrawCanvas
                canvas={canvas}
                setCanvas={setCanvas}
                onSelection={setSelectedObjectStyle}
                activeTool={activeTool}
                handleToolChange={handleToolChange}
                key={activeAnnotation.image?.id}
                drawLayerJson={activeAnnotation.jsonValue}
                imageUrl={
                  activeAnnotation.image?.thumbnails?.full?.url ||
                  activeAnnotation.image?.url ||
                  ''
                }
                onDraw={activeAnnotation.updateJsonStorage}
              />
            ) : (
              <Box flex="1" textAlign="center">
                {errorMessage}
              </Box>
            )}
          </Box>
        </Box>
      </EditorContainer>
    </Box>
  )
}
