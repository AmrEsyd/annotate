import { IObjectOptions, TextOptions } from 'fabric/fabric-impl'
import React from 'react'

import { Box } from '@airtable/blocks/ui'

import { Color } from './Color'
import { Stroke } from './Stroke'
import { Text } from './Text'

interface StylingOptionsProps {
  styleValue: IObjectOptions | null
  onChange: (value: IObjectOptions) => void
}

export const StylingOptions: React.FC<StylingOptionsProps> = (props) => {
  const { styleValue, onChange } = props
  const handleTextStyleChange = (textStyle: TextOptions) =>
    onChange({ ...styleValue, ...textStyle })

  return (
    <Box display="flex" justifyContent="space-evenly">
      <Stroke styleValue={styleValue} onChange={onChange} />
      <Color styleValue={styleValue} onChange={onChange} />
      <Text
        value={props.styleValue ? props.styleValue : undefined}
        onChange={handleTextStyleChange}
      />
    </Box>
  )
}
