import React from 'react'

import { Box } from '@airtable/blocks/ui'

import { SidebarContainer, SideBarScroll } from '../components'

export const SideBar: React.FC = ({ children }) => {
  return (
    <SidebarContainer>
      <SideBarScroll>
        <Box
          display="flex"
          flexDirection="column"
          height="100%"
          width="100%"
          padding="0.5rem"
        >
          {children}
        </Box>
      </SideBarScroll>
    </SidebarContainer>
  )
}
