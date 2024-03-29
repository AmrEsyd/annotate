import { BaseEmoji, NimblePicker } from 'emoji-mart'
//@ts-expect-error
import data from 'emoji-mart/data/apple.json'
import React, { useRef } from 'react'
import { FiSmile } from 'react-icons/fi'

import { useHotkeys } from '../hooks'
import { PopoverButton, PopoverButtonRef, shortcutsList } from './index'

export const EmojiPicker: React.FC<{
  onSelect: (emoji: string) => void
}> = ({ onSelect }) => {
  const popoverButtonRef = useRef<PopoverButtonRef>(null)

  useHotkeys(
    shortcutsList.emojiPicker.shortcuts,
    () => {
      popoverButtonRef.current?.togglePopover()
    },
    [popoverButtonRef.current?.togglePopover]
  )

  return (
    <PopoverButton
      ref={popoverButtonRef}
      label="Emoji"
      shortcutId="emojiPicker"
      icon={<FiSmile strokeWidth="3" />}
      styleType="white"
      eventType="click"
    >
      <NimblePicker
        autoFocus={true}
        color="hsl(0,0%,20%)"
        theme="light"
        sheetSize={16}
        showPreview={false}
        title=" "
        emoji=" "
        native={true}
        set="apple"
        style={{ width: 230, maxHeight: '80vh', overflow: 'auto' }}
        data={data}
        onSelect={(emoji: BaseEmoji) => {
          onSelect(emoji.native)
          popoverButtonRef.current?.togglePopover(false)
        }}
      />
    </PopoverButton>
  )
}
