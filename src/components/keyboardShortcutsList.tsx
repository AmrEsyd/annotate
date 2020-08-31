import groupBy from 'lodash/groupBy'
import React from 'react'

import { BoxProps } from '@airtable/blocks/dist/types/src/ui/box'
import { Box, Dialog, Heading, Text } from '@airtable/blocks/ui'
import { css } from '@emotion/core'
import styled from '@emotion/styled'

import { Divider } from './Layout'

export type shortcutsIds =
  | 'select'
  | 'move'
  | 'download'
  | 'newAnnotation'
  | 'deleteShape'
  | 'keyboardShortcuts'
  | 'sidebar'
  | 'previousRecord'
  | 'nextRecord'
  | 'expandRecord'
  | 'lookupRecord'
  | 'emojiPicker'
  | 'Circle'
  | 'Pencil'
  | 'Rectangle'
  | 'Line'
  | 'Arrow'
  | 'Text'
  | 'previousAnnotation'
  | 'nextAnnotation'
  | 'nextPreviousAnnotation'

const groups = ['General', 'Shapes & Tools'] as const

type shortcutsListType = {
  [name in shortcutsIds]: {
    label: string
    group: typeof groups[number]
    shortcuts: string[]
  }
}

export const shortcutsList: shortcutsListType = {
  select: { label: 'Select', shortcuts: ['v'], group: 'Shapes & Tools' },
  move: {
    label: 'Move',
    shortcuts: ['m'],
    group: 'Shapes & Tools',
  },
  download: {
    label: 'Download as an image',
    shortcuts: ['command+s', 'control+s'],
    group: 'General',
  },
  newAnnotation: {
    label: 'New annotation',
    shortcuts: ['shift+enter'],
    group: 'General',
  },
  deleteShape: {
    label: 'delete selected shape',
    shortcuts: ['command+backspace', 'shift+backspace', 'backspace'],
    group: 'General',
  },
  previousRecord: {
    label: 'Previous record',
    shortcuts: ['command+shift+,'],
    group: 'General',
  },
  nextRecord: {
    label: 'Next record',
    shortcuts: ['command+shift+.'],
    group: 'General',
  },
  previousAnnotation: {
    label: 'Previous annotation',
    shortcuts: ['command+left'],
    group: 'General',
  },
  nextAnnotation: {
    label: 'Next annotation',
    shortcuts: ['command+right'],
    group: 'General',
  },
  nextPreviousAnnotation: {
    label: 'To use the toolbar record arrows for annotations',
    shortcuts: ['shift+click'],
    group: 'General',
  },
  expandRecord: {
    label: 'Expand record',
    shortcuts: ['space'],
    group: 'General',
  },
  lookupRecord: {
    label: 'Search for record',
    shortcuts: ['command+f'],
    group: 'General',
  },
  keyboardShortcuts: {
    label: 'keyboard shortcuts',
    shortcuts: ['command+?', 'control+?', 'command+/', 'control+/'],
    group: 'General',
  },
  sidebar: {
    label: 'Sidebar',
    shortcuts: ['command+shift+k', 'control+shift+k'],
    group: 'General',
  },
  emojiPicker: {
    label: 'Emoji picker',
    shortcuts: ['e'],
    group: 'Shapes & Tools',
  },
  Circle: {
    label: 'Circle',
    shortcuts: ['o'],
    group: 'Shapes & Tools',
  },
  Arrow: {
    label: 'Arrow',
    shortcuts: ['shift+l'],
    group: 'Shapes & Tools',
  },
  Pencil: {
    label: 'Pencil',
    shortcuts: ['p'],
    group: 'Shapes & Tools',
  },
  Rectangle: {
    label: 'Rectangle',
    shortcuts: ['r'],
    group: 'Shapes & Tools',
  },
  Line: {
    label: 'Line',
    shortcuts: ['l'],
    group: 'Shapes & Tools',
  },
  Text: {
    label: 'Line',
    shortcuts: ['t'],
    group: 'Shapes & Tools',
  },
}

export const toolsKeys = {
  e: 'Emoji',
  r: 'Rectangle',
  p: 'Pencil',
  l: 'Line',
  o: 'Circle',
  'shift+l': 'Arrow',
} as const

type ShortcutKeyVariants = 'dark' | 'white'

export const ShortcutKey = styled.kbd<{ variant?: ShortcutKeyVariants }>`
  display: inline-block;
  border-radius: 3px;
  font-size: 10px;
  margin-left: 2px;
  min-width: 12px;
  padding: 1px 3px;
  box-sizing: border-box;
  text-transform: uppercase;
  text-align: center;
  user-select: none;
  white-space: nowrap;
  font: inherit;
  font-size: 10px;
  ${({ variant }) => {
    return variant === 'dark'
      ? css`
          background-color: hsla(0, 0%, 100%, 0.25);
          color: #fff;
          fill: #fff;
          font-weight: 500;
          line-height: 1.25;
        `
      : css`
          background-color: hsla(0, 0%, 100%, 0.25);
          border-color: rgba(0, 0, 0, 0.1);
          color: #333333;
          border-style: solid;
          border-width: 1px;
          border-bottom-width: 2px;
        `
  }}
`

const keyIconList = {
  command: '⌘',
  left: '←',
  right: '→',
} as any

export const Shortcut: React.FC<
  { keyCombinations: string; variant?: ShortcutKeyVariants } & BoxProps
> = ({ keyCombinations, variant, ...BoxProps }) => {
  return (
    <Box display="inline-block" {...BoxProps}>
      {keyCombinations.split('+').map((key) => (
        <ShortcutKey variant={variant} key={key}>
          {keyIconList[key] || key}
        </ShortcutKey>
      ))}
    </Box>
  )
}

type KeyboardShortcutsListProps = { onClose: () => unknown }
export const KeyboardShortcutsList: React.FC<KeyboardShortcutsListProps> = ({
  onClose,
}) => {
  return (
    <Dialog onClose={onClose} width="80vw" maxHeight="80vh" maxWidth="500px">
      <Dialog.CloseButton />
      <Box display="flex">
        <Heading marginRight={2}>Keyboard shortcuts</Heading>
        <Shortcut
          keyCombinations={shortcutsList.keyboardShortcuts.shortcuts[0]}
        />
      </Box>
      {Object.entries(groupBy(shortcutsList, 'group')).map(
        ([groupName, groupShortcuts]) => (
          <>
            <Divider />
            <Box marginY={3}>
              <Heading size="small" marginBottom={1}>
                {groupName}
              </Heading>
              {groupShortcuts.map(({ label, shortcuts }) => {
                return (
                  <Box
                    display="flex"
                    alignItems="center"
                    key={shortcuts[0]}
                    marginBottom={1}
                  >
                    <Box
                      display="flex"
                      width="25%"
                      alignItems="center"
                      justifyContent="flex-end"
                    >
                      <Shortcut keyCombinations={shortcuts[0]} />
                    </Box>
                    <Text flex="1" marginLeft={2}>
                      {label}
                    </Text>
                  </Box>
                )
              })}
            </Box>
          </>
        )
      )}
    </Dialog>
  )
}
