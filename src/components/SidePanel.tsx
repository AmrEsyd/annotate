import React from 'react'

import { IconName } from '@airtable/blocks/dist/types/src/ui/icon_config'
import { Box, Icon, Text } from '@airtable/blocks/ui'
import { css } from '@emotion/core'
import styled from '@emotion/styled'
import is from '@sindresorhus/is'

import { hideScrollbar, lightScrollbar } from './index'

const TOOLBAR_HEIGHT = 44

type PanelProps = {
  title: React.ReactNode
  icon?: IconName | React.ReactElement
  extra?: React.ReactNode
  showScrollbar?: boolean
} & React.ComponentProps<typeof Box>

export const Panel: React.FC<PanelProps> = (props) => {
  const {
    title,
    icon,
    showScrollbar,
    extra,
    children,
    ...containerProps
  } = props

  return (
    <PanelContainer>
      <PanelTitle>
        {is.string(icon) ? (
          <Icon name={icon} size={12} marginRight={1} />
        ) : (
          icon
        )}
        <Text marginRight="auto" fontWeight={400} fontSize="0.9em">
          {title}
        </Text>
        {extra}
      </PanelTitle>
      <ScrollContainer {...containerProps} showScrollbar={showScrollbar}>
        <InnerScrollContainer style={{ height: '100%' }}>
          {children}
        </InnerScrollContainer>
      </ScrollContainer>
    </PanelContainer>
  )
}

type SidePanelProps = {
  enableScrolling?: boolean
  side: 'left' | 'right'
} & React.ComponentProps<typeof Box>

export const SidePanel: React.FC<SidePanelProps> = (props) => {
  const { enableScrolling, side, children, ...containerProps } = props

  return (
    <SidePanelContainer side={side}>
      {enableScrolling ? (
        <ScrollContainer showScrollbar {...containerProps}>
          <InnerScrollContainer>{children}</InnerScrollContainer>
        </ScrollContainer>
      ) : (
        children
      )}
    </SidePanelContainer>
  )
}

type SidePanelContainerProps = {
  side: 'left' | 'right'
}

export const SidePanelContainer = styled.div<SidePanelContainerProps>`
  display: flex;
  flex-direction: column;
  flex: none;
  box-sizing: border-box;
  overflow: auto;
  position: relative;
  z-index: 5;
  width: 240px;
  background-color: #fff;
  height: calc(100vh - ${TOOLBAR_HEIGHT}px);

  ${({ side }) => {
    return side === 'right'
      ? css`
          right: 0;
          border-left: solid 2px rgba(77, 77, 77, 0.3);
        `
      : css`
          left: 0;
          border-right: solid 2px rgba(77, 77, 77, 0.3);
        `
  }}

  ${lightScrollbar}
  @media (max-width: 768px) {
    width: 200px;
    /* position: absolute; */
  }
`

export const PanelContainer = styled.div`
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
`

export const PanelTitle = styled.div`
  display: flex;
  color: hsl(0, 0%, 30%);
  align-items: center;
  padding: 0 0.5rem;
  margin: 0;
  height: 2rem;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`

type ScrollContainerProps = {
  showScrollbar?: boolean
}

export const ScrollContainer = styled(Box)<ScrollContainerProps>`
  box-sizing: border-box;
  overflow: auto;
  overflow-x: hidden;
  height: 100%;
  ${({ showScrollbar }) => (showScrollbar ? lightScrollbar : hideScrollbar)}
`

export const InnerScrollContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`
