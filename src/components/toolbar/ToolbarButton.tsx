import React, { useState } from 'react'

import { Box, Button, Tooltip } from '@airtable/blocks/ui'
import styled from '@emotion/styled'

import { Shortcut, shortcutsIds, shortcutsList } from '../'
import { useHotkeys, useResize } from '../../hooks'

const ToolbarButtonStyled = styled(Button)`
  height: 24px;
  padding: 0.25rem 0.5rem;
  margin-right: 0.5rem;
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
`

export type ToolbarButtonProps = {
  label: string
  labelMinWidth?: number
  hideLabel?: boolean
  isSelected?: boolean
  shortcutId?: shortcutsIds
} & React.ComponentProps<typeof Button>

export const ToolbarButton: React.FC<
  ToolbarButtonProps & { children?: never }
> = (props) => {
  const {
    hideLabel,
    labelMinWidth = 780,
    label,
    isSelected,
    shortcutId,
    onClick,
    disabled,
    style,
    ...buttonProps
  } = props
  const [shouldShowLabel, setShouldShowLabel] = useState<boolean>()

  const variant = isSelected ? 'default' : 'secondary'

  useResize(() => {
    if (!hideLabel && window.innerWidth > labelMinWidth) {
      setShouldShowLabel(true)
    } else {
      setShouldShowLabel(false)
    }
  })

  const shortcuts = shortcutId && shortcutsList[shortcutId].shortcuts
  useHotkeys(
    shortcuts?.join(),
    (e) => {
      e.preventDefault()
      if (onClick) {
        onClick()
      }
    },
    [onClick]
  )

  const tooltipContent = (
    <Box display="flex" alignItems="center">
      <Box flex="1">{label}</Box>
      {shortcuts?.[0] && (
        <Shortcut
          variant="dark"
          keyCombinations={shortcuts[0]}
          marginLeft={1}
        />
      )}
    </Box>
  )

  const disabledStyle: React.CSSProperties = {
    opacity: 0.5,
    cursor: 'not-allowed',
  }

  return (
    <Tooltip
      style={{ padding: '5px' }}
      placementX={'center' as any}
      placementY={'bottom' as any}
      content={() => tooltipContent}
    >
      <ToolbarButtonStyled
        aria-label={label}
        variant={variant}
        onClick={(e) => !disabled && onClick?.(e)}
        style={disabled ? { ...disabledStyle, ...style } : style}
        {...buttonProps}
      >
        {shouldShowLabel && label}
      </ToolbarButtonStyled>
    </Tooltip>
  )
}
