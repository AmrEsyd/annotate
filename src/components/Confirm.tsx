import React from 'react'
import ReactDOM from 'react-dom'

import { ConfirmationDialog } from '@airtable/blocks/ui'

type confirmProps = { title: string } & Partial<ConfirmationDialog['props']>

export function confirmDialog(args: confirmProps) {
  const { onCancel, onConfirm, ...props } = args
  const containerElement = document.createElement('div')
  document.body.appendChild(containerElement)

  const close = () => {
    const unmounted = ReactDOM.unmountComponentAtNode(containerElement)
    if (containerElement.parentNode && unmounted) {
      containerElement.parentNode.removeChild(containerElement)
    }
  }

  setTimeout(() => {
    ReactDOM.render(
      <ConfirmationDialog
        onCancel={() => {
          close()
          onCancel?.()
        }}
        onConfirm={() => {
          close()
          onConfirm?.()
        }}
        {...props}
      />,
      containerElement
    )
  })
}
