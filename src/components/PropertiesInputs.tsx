import React, { useContext } from 'react'

import { SelectOption } from '@airtable/blocks/dist/types/src/ui/select_and_select_buttons_helpers'
import {
  ColorPalette,
  colors,
  colorUtils,
  FormField,
  Input,
  Select,
  SelectButtons,
  Switch,
} from '@airtable/blocks/ui'
import is from '@sindresorhus/is'

import { DEFAULT_COLOR } from '../hooks'
import { PropertiesContext, PropertiesOptions } from './PropertiesPanel'

type PropertyInputProps = {
  label: React.ReactNode
  property: keyof PropertiesOptions
  defaultValue?: string
  description?: React.ReactNode | string | null
}

export const PropertyInput: React.FC<PropertyInputProps> = (props) => {
  const { property, defaultValue, label, description } = props
  const { getValue, setValue } = useContext(PropertiesContext)
  const value = getValue(property)
  return (
    <FormField label={label} description={description}>
      <Input
        value={value || defaultValue}
        onChange={(event) => {
          const newValue = event.target.value
          setValue({ [property]: newValue })
        }}
      />
    </FormField>
  )
}

type PropertySelectProps = PropertyInputProps & {
  options: SelectOption[] | (number | string)[]
  buttons?: boolean
}

export const PropertySelect: React.FC<PropertySelectProps> = (props) => {
  const { property, label, description, buttons } = props
  const { getValue, setValue } = useContext(PropertiesContext)
  const value = getValue(property)
  const options = is.array(props.options, is.object)
    ? props.options
    : props.options.map((option) => ({
        label: option,
        value: option,
      }))

  const SelectComponent = buttons ? SelectButtons : Select

  return (
    <FormField label={label} description={description}>
      <SelectComponent
        options={options}
        value={value}
        onChange={(newValue: any) => {
          setValue({ [property]: newValue })
        }}
      />
    </FormField>
  )
}

type PropertySwitchProps<
  T extends keyof PropertiesOptions
> = PropertyInputProps & {
  property: T
  true?: PropertiesOptions[T]
  false?: PropertiesOptions[T]
}

export function PropertySwitch<T extends keyof PropertiesOptions>(
  props: PropertySwitchProps<T>
) {
  const { property, label, description } = props
  const { getValue, setValue } = useContext(PropertiesContext)
  let value: any = getValue(property)
  value = value === props.false ? false : value
  value = value === props.true ? true : value

  return (
    <FormField label={<></>} description={description}>
      <Switch
        value={value}
        label={label}
        onChange={(value) => {
          const newValue: any = value
            ? props.true ?? value
            : props.false ?? value
          setValue({ [property]: newValue })
        }}
      />
    </FormField>
  )
}

// prettier-ignore
export const allowedColors = [ 
  colors.BLUE_LIGHT_2, colors.GRAY_LIGHT_2, colors.GREEN_LIGHT_2, colors.ORANGE_LIGHT_2, colors.RED_LIGHT_2, colors.YELLOW_LIGHT_2,
  colors.BLUE_BRIGHT, colors.GRAY_BRIGHT, colors.GREEN_BRIGHT, colors.ORANGE_BRIGHT, colors.RED_BRIGHT, colors.YELLOW_BRIGHT,
  colors.BLUE_DARK_1, colors.GRAY_DARK_1, colors.GREEN_DARK_1, colors.ORANGE_DARK_1, colors.RED_DARK_1, colors.YELLOW_DARK_1,
]

type PropertyColorProps = PropertyInputProps

export const PropertyColor: React.FC<PropertyColorProps> = (props) => {
  const { property, label, description } = props
  const { getValue, setValue } = useContext(PropertiesContext)
  const value = getValue(property)

  const fillColor =
    value &&
    allowedColors.find((color) => value === colorUtils.getHexForColor(color))

  const isTransparent = !fillColor || value === 'transparent'

  return (
    <FormField label={label} description={description}>
      <SelectButtons
        marginBottom={2}
        value={isTransparent}
        options={[
          { label: 'Transparent', value: true },
          { label: 'Filled', value: false },
        ]}
        onChange={(setAsTransparent) => {
          if (setAsTransparent) {
            setValue({ [property]: 'transparent' })
          } else {
            setValue({ [property]: colorUtils.getHexForColor(DEFAULT_COLOR) })
          }
        }}
      />
      {!isTransparent && (
        <ColorPalette
          margin="auto"
          color={fillColor}
          onChange={(newColor) => {
            const newColorHex = colorUtils.getHexForColor(newColor)
            setValue({ [property]: newColorHex })
          }}
          allowedColors={allowedColors}
          width="160px"
        />
      )}
    </FormField>
  )
}
