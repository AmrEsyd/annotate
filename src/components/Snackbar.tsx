import Notification from 'rc-notification'
import { NotificationInstance } from 'rc-notification/lib/Notification'

let snackbarInstance: NotificationInstance | null = null

Notification.newInstance(
  {
    maxCount: 2,
    style: {
      bottom: 5,
      left: 5,
      zIndex: 100000000,
    },
  },
  (notification) => {
    snackbarInstance = notification
  }
)

export const snackbar = (message: React.ReactNode, duration?: number) => {
  snackbarInstance?.notice({
    content: message,
    duration: duration || 1.5,
    style: {
      margin: 5,
      padding: '12px 18px',
      background: 'hsl(0,0%,20%)',
      color: '#f6f6f6',
      borderRadius: 4,
    },
  })
}
