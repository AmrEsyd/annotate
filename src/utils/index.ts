export * from './imageUtils'
export * from './canvas'
export * from './time'

import truncate from 'lodash/truncate'

import { CollaboratorData } from '@airtable/blocks/dist/types/src/types/collaborator'
import is from '@sindresorhus/is'

export const isDefined = <T>(i: T | void | undefined | null): i is T => {
  return !is.nullOrUndefined(i)
}

export const truncateCollaborator = (
  collaborator: CollaboratorData,
  length: number
) => {
  return {
    ...collaborator,
    name: truncate(collaborator.name, { length, separator: ' ' }),
  }
}
