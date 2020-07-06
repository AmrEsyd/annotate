export * from './imageUtils'
export * from './canvas'

import is from '@sindresorhus/is'

export const isDefined = <T>(i: T | void | undefined | null): i is T => {
  return !is.nullOrUndefined(i)
}

export const safeJsonParse = (value: unknown) => {
  try {
    if (is.nonEmptyString(value)) {
      return JSON.parse(value)
    } else {
      return value
    }
  } catch {
    return value
  }
}
