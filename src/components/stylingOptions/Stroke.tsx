import { IObjectOptions } from 'fabric/fabric-impl'
import React from 'react'

import { Icon, Text } from '@airtable/blocks/ui'

import { Divider, MenuOption, PopoverButton } from '../../components'

export type StrokeProps = {
  styleValue: IObjectOptions | null
  onChange: (value: IObjectOptions) => void
}

export const Stroke: React.FC<StrokeProps> = ({ styleValue, onChange }) => {
  const handleStrokeWidthChange = (strokeWidth: number) => {
    onChange({ ...styleValue, strokeWidth })
  }

  const handleDashChange = (dashEnabled: boolean) => {
    onChange({
      ...styleValue,
      strokeDashArray: dashEnabled ? [8] : undefined,
    })
  }

  const scaleY = (number: number) => ({
    transform: `scaleY(${number}) scaleX(${number * 0.75})`,
  })

  const { strokeWidth, strokeDashArray } = styleValue || {}

  const strokeOptions: MenuOption[] = [
    {
      label: 'Small',
      isSelected: strokeWidth === 4,
      onClick: () => handleStrokeWidthChange(4),
      icon: <Icon name="minus" style={scaleY(1)} />,
    },
    {
      label: 'Medium',
      isSelected: strokeWidth === 8,
      onClick: () => handleStrokeWidthChange(8),
      icon: <Icon name="minus" style={scaleY(1.5)} />,
    },
    {
      label: 'Large',
      isSelected: strokeWidth === 12,
      onClick: () => handleStrokeWidthChange(12),
      icon: <Icon name="minus" style={scaleY(2)} />,
    },
  ]

  const lineOptions: MenuOption[] = [
    {
      label: 'Solid',
      isSelected: !strokeDashArray,
      onClick: () => handleDashChange(false),
      icon: <Icon name="minus" />,
    },
    {
      label: 'Dash',
      isSelected: !!strokeDashArray,
      onClick: () => handleDashChange(true),
      icon: <Icon name="minus" />,
    },
  ]

  return (
    <PopoverButton
      icon="minus"
      label="Line"
      styleType="white"
      eventType="click"
      options={[
        <Text size="small">Line size</Text>,
        ...strokeOptions,
        <Divider key="Divider" style={{ margin: '0.5rem' }} />,
        <Text size="small">Line type</Text>,
        ...lineOptions,
      ]}
    />
  )
}
