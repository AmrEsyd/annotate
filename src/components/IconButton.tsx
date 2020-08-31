import React, { useState } from 'react'

import { Box, Button, Tooltip } from '@airtable/blocks/ui'
import styled from '@emotion/styled'

import { useHotkeys, useResize } from '../hooks'
import { Shortcut, shortcutsIds, shortcutsList } from './index'

const IconButtonStyled = styled(Button)`
  height: 24px;
  padding: 0.25rem 0.5rem;
  margin: 0.25rem 0;

  &:focus {
    box-shadow: unset !important;
  }
`

export type IconButtonProps = {
  label: string
  labelMinWidth?: number
  labelStyle?: React.CSSProperties
  hideLabel?: boolean
  isSelected?: boolean
  shortcutId?: shortcutsIds
} & React.ComponentProps<typeof Button>

export const IconButton: React.FC<IconButtonProps & { children?: never }> = (
  props
) => {
  const {
    hideLabel,
    labelMinWidth = 1000,
    labelStyle,
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
    shortcuts,
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
      placementX={Tooltip.placements.CENTER}
      placementY={Tooltip.placements.BOTTOM}
      content={() => tooltipContent}
    >
      <IconButtonStyled
        aria-label={label}
        variant={variant}
        onClick={(e) => !disabled && onClick?.(e)}
        style={disabled ? { ...disabledStyle, ...style } : style}
        {...buttonProps}
      >
        {shouldShowLabel && <span style={labelStyle}> {label}</span>}
      </IconButtonStyled>
    </Tooltip>
  )
}
