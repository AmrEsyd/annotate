import React, { useEffect, useState } from 'react'

import { Box, Popover, TextButton } from '@airtable/blocks/ui'
import is from '@sindresorhus/is'

import { Shortcut, ToolbarButton, ToolbarButtonProps } from './'
import { shortcutsIds, shortcutsList } from './keyboardShortcutsList'
import { Menu, MenuItem, menuVariants } from './Layout'

type PopoverButtonProps = ToolbarButtonProps & {
  styleType: menuVariants
  eventType: 'click' | 'hover'
  label?: React.ReactNode
  options?: MenuOption[]
  fitInWindowMode?: Popover['props']['fitInWindowMode']
  closeOnClick?: boolean
}

export type PopoverButtonRef = {
  togglePopover: (state?: boolean) => void
}

const _PopoverButton: React.ForwardRefRenderFunction<
  PopoverButtonRef,
  PopoverButtonProps
> = (props, ref) => {
  const {
    styleType,
    eventType,
    children,
    options,
    fitInWindowMode,
    closeOnClick,
    ...buttonProps
  } = props
  const [isOpen, setIsOpen] = useState(false)

  const clickProps = {
    onClick: () => setIsOpen(!isOpen),
  }

  const hoverProps = {
    onMouseEnter: () => setIsOpen(true),
    onMouseLeave: () => setIsOpen(false),
  }

  const closePopoverOnClick = () => {
    if (closeOnClick) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    const togglePopover = (state?: boolean) => {
      setIsOpen(is.boolean(state) ? state : !isOpen)
    }
    if (ref && is.function_(ref)) {
      ref({ togglePopover })
    } else if (ref) {
      ref.current = { togglePopover }
    }
  }, [isOpen, setIsOpen, ref])

  return (
    <Popover
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      fitInWindowMode={fitInWindowMode || ('flip' as any)}
      renderContent={() => (
        <Menu type={styleType}>
          {options
            ? renderOptions(options, styleType, closePopoverOnClick)
            : children}
        </Menu>
      )}
    >
      <ToolbarButton
        variant="secondary"
        {...buttonProps}
        {...(eventType === 'hover' ? hoverProps : clickProps)}
      />
    </Popover>
  )
}

export const PopoverButton = React.forwardRef(_PopoverButton)

// Menu Options

export type MenuOption =
  | ({
      label: React.ReactNode
      isSelected?: boolean
      shortcutId?: shortcutsIds
    } & React.ComponentProps<typeof TextButton>)
  | React.ReactElement

export const renderOptions = (
  options: MenuOption[],
  variant: menuVariants,
  closePopover?: () => void
) => {
  const optionElements = options?.map((option, index) => {
    if (React.isValidElement(option)) {
      return option
    } else if (is.plainObject(option)) {
      const { label, isSelected, onClick, shortcutId, ...buttonProps } = option

      const shortcuts = shortcutId && shortcutsList[shortcutId].shortcuts
      return (
        <MenuItem
          key={`${label}-${index}`}
          isSelected={isSelected}
          type={variant}
          onClick={(e) => {
            onClick?.(e)
            closePopover?.()
          }}
          {...buttonProps}
        >
          <Box display="flex" alignItems="center">
            <Box flex="1">{label}</Box>
            {shortcuts?.[0] && (
              <Shortcut
                variant={variant}
                keyCombinations={shortcuts[0]}
                marginLeft={1}
              />
            )}
          </Box>
        </MenuItem>
      )
    }
  })

  return (
    <Box display="flex" flexDirection="column">
      {optionElements}
    </Box>
  )
}
