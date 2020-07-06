import mapValues from 'lodash/mapValues'

import { useGlobalConfig } from '@airtable/blocks/ui'
import is from '@sindresorhus/is'

import { globalConfigKeys } from '../Settings'

export const useSettings = () => {
  const globalConfig = useGlobalConfig()
  return mapValues(globalConfigKeys, (key) => {
    const value = globalConfig.get(key)
    return is.string(value) ? value : null
  })
}
