import { useEffect, useState } from "react"

import { useAlertContext } from "../hooks/useAlert"

type AlertProps = {
  id: number
  message: string
  messageType: "alert-info" | "alert-success" | "alert-warning" | "alert-error"
  onClose: (id: number) => void
}
function Alert({ id, message, messageType, onClose }: AlertProps) {
  const handleAnimationEnd = () => {
    if (!visible) {
      onClose(id)
    }
  }
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(false)
    }, 2000)
    return () => clearTimeout(timeout)
  }, [])

  const alertClassNames = `alert ${messageType} shadow-lg ${
    visible ? "animate-fade-in-down opacity-1" : "animate-fade-out-up opacity-0"
  }`

  return (
    <div className={alertClassNames} onAnimationEnd={handleAnimationEnd}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{message}</span>
    </div>
  )
}
const AlertList: React.FC = () => {
  const { alerts, removeAlert } = useAlertContext()
  alerts
  return (
    <div className="absolute top-0 mt-3 w-[80%] left-[50%] transform -translate-x-1/2">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          message={alert.message}
          messageType={alert.type}
          id={alert.id}
          onClose={(id) => removeAlert(id)}
        />
      ))}
    </div>
  )
}

export default AlertList
