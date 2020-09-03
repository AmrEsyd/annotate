import React, { useEffect, useState } from 'react'

import { Box, Text } from '@airtable/blocks/ui'

import { Annotation } from '../Annotation'
import {
  AttachmentPanel,
  Divider,
  IconButton,
  LayersPanel,
} from '../components'
import { Attachment } from '../hooks'
import { Panel, SidePanel } from './SidePanel'

type LeftPanelProps = {
  attachments: Attachment[] | null
  onClickAttachment: (record: Attachment) => void
  activeAnnotation: Annotation | null
}

export const LeftPanel: React.FC<LeftPanelProps> = (props) => {
  const { attachments, onClickAttachment, activeAnnotation } = props
  const [showLayersPanel, setShowLayersPanel] = useState(!!activeAnnotation)

  useEffect(() => {
    if (!activeAnnotation) setShowLayersPanel(false)
  }, [activeAnnotation])

  return (
    <SidePanel side="left">
      {showLayersPanel ? (
        <>
          <Box display="flex" alignItems="center">
            <IconButton
              hideLabel
              marginX={2}
              icon="chevronLeft"
              label="back"
              onClick={() => setShowLayersPanel(false)}
            />
            <Text
              marginRight={2}
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {activeAnnotation?.name}
            </Text>
          </Box>
          <Divider marginX={2} />
          <Panel icon="shapes" title="Layers">
            <LayersPanel />
          </Panel>
        </>
      ) : (
        <Panel icon="attachment" title="Attachments">
          {attachments?.length ? (
            <AttachmentPanel
              attachments={attachments}
              onClickAttachment={(record) => {
                onClickAttachment(record)
                setShowLayersPanel(true)
              }}
            />
          ) : (
            <Box margin="auto" textAlign="center">
              <Text>No Annotations</Text>
            </Box>
          )}
        </Panel>
      )}
    </SidePanel>
  )
}
