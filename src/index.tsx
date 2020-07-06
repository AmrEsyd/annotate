import './styles'

import React from 'react'

import { initializeBlock } from '@airtable/blocks/ui'

import { Main } from './Main'

initializeBlock(() => <Main />)
