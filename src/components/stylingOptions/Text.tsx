import { TextOptions } from 'fabric/fabric-impl'
import React from 'react'

import { SelectOption } from '@airtable/blocks/dist/types/src/ui/select_and_select_buttons_helpers'
import {
  Box,
  Button,
  FormField,
  Icon,
  Select,
  SelectButtons,
} from '@airtable/blocks/ui'
import is from '@sindresorhus/is'

import { PopoverButton } from '../../components'

interface FontSizeSettingProps {
  value?: TextOptions
  onChange: (fontStyle: TextOptions) => void
}

const TextSizes = [12, 18, 24, 36, 48, 64, 72, 96, 144, 288]

export function Text({ value, onChange }: FontSizeSettingProps) {
  const sizeOptions: SelectOption[] = TextSizes.map((size) => ({
    label: size,
    value: size,
  }))

  return (
    <PopoverButton
      icon="text"
      label="Text Style"
      styleType="white"
      eventType="click"
    >
      <FormField label="Font Size" margin={1}>
        <Select
          width="fit-content"
          value={Number(value?.fontSize)}
          options={sizeOptions}
          onChange={(newValue) => {
            if (is.number(newValue)) onChange({ ...value, fontSize: newValue })
          }}
        />
      </FormField>
      <FormField label="Font Style" margin={1}>
        <Box display="flex">
          <Button
            variant={value?.underline ? 'default' : 'secondary'}
            onClick={() => onChange({ ...value, underline: !value?.underline })}
          >
            <Icon size={12} name="underline" />
          </Button>
          <Button
            variant={value?.linethrough ? 'default' : 'secondary'}
            onClick={() =>
              onChange({ ...value, linethrough: !value?.linethrough })
            }
          >
            <Icon size={12} name="strikethrough" />
          </Button>
          <Button
            variant={value?.fontStyle === 'italic' ? 'default' : 'secondary'}
            onClick={() =>
              onChange({
                ...value,
                fontStyle: value?.fontStyle === 'italic' ? 'normal' : 'italic',
              })
            }
          >
            <Icon size={12} name="italic" />
          </Button>
          <Button
            variant={value?.fontWeight === 'bold' ? 'default' : 'secondary'}
            onClick={() =>
              onChange({
                ...value,
                fontWeight: value?.fontWeight === 'bold' ? 'normal' : 'bold',
              })
            }
          >
            <Icon size={12} name="bold" />
          </Button>
        </Box>
      </FormField>
    </PopoverButton>
  )
}
