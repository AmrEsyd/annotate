import { Box, TextButton } from '@airtable/blocks/ui'
import { css } from '@emotion/core'
import styled from '@emotion/styled'

const TOOLBAR_HEIGHT = 44

export const hideScrollbar = css`
  &::-webkit-scrollbar {
    display: none;
  }
`

export const lightScrollbar = css`
  &::-webkit-scrollbar {
    width: 12px;
    height: 12px;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  &::-webkit-scrollbar-button {
    display: none;
    height: 0;
    width: 0;
  }

  &::-webkit-scrollbar-thumb {
    background-color: hsla(0, 0%, 0%, 0.35);
    background-clip: padding-box;
    border: 3px solid rgba(0, 0, 0, 0);
    border-radius: 6px;
    min-height: 36px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: hsla(0, 0%, 0%, 0.4);
  }
`

export const Divider = styled(Box)`
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
`

export const EditorContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`

export const CanvasContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`

export const ToolbarContainer = styled.div`
  ${hideScrollbar}
  width: 100%;
  height: ${TOOLBAR_HEIGHT}px;
  display: flex;
  align-items: center;
  overflow: scroll;
  border-bottom: solid 2px rgba(0, 0, 0, 0.1);
`
export type menuVariants = 'white' | 'dark'

export const Menu = styled.div<{ type?: menuVariants }>`
  position: relative;
  margin: 4px;
  overflow: hidden;
  border-radius: 3px;
  box-sizing: border-box;
  pointer-events: all;
  ${({ type }) =>
    type === 'dark'
      ? css`
          background-color: hsl(0, 0%, 20%);
          color: #fff;
          fill: #fff;
        `
      : css`
          color: hsl(0, 0%, 30%);
          background-color: #fff;
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
        `}
`

type MenuItemProps = { type: menuVariants; isSelected?: boolean }

export const MenuItem = styled(TextButton)<MenuItemProps>`
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
  display: flex;
  align-items: center;
  transition: 0.085s all ease-in;
  justify-content: start;
  opacity: 1;
  margin: 0;
  border-radius: 0;
  opacity: 1 !important;

  & span {
    flex: 1;
  }

  ${({ type, isSelected }) =>
    type === 'dark'
      ? css`
          padding: 0.5rem;
          color: #fff;
          fill: #fff;

          &:hover,
          &:focus {
            background-color: hsla(0, 0%, 100%, 0.1);
          }
        `
      : css`
          color: ${isSelected ? '#2d7ff9' : 'hsl(0, 0%, 30%)'};
          background: white;

          &:hover {
            background: rgba(0, 0, 0, 0.05);
          }
        `}
`
