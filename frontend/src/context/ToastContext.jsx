import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import '../styles/Toast.css'

const ToastContext = createContext(null)

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const remove = useCallback((id) => {
    const t = timers.current.get(id)
    if (t) clearTimeout(t)
    timers.current.delete(id)
    setToasts((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const showToast = useCallback(
    (message, variant = 'info', durationMs = 5200) => {
      const id = ++toastId
      setToasts((prev) => [...prev, { id, message, variant }])
      if (durationMs > 0) {
        timers.current.set(
          id,
          setTimeout(() => remove(id), durationMs)
        )
      }
      return id
    },
    [remove]
  )

  const value = useMemo(
    () => ({
      showToast,
      toastSuccess: (msg, d) => showToast(msg, 'success', d),
      toastError: (msg, d) => showToast(msg, 'error', d),
      toastInfo: (msg, d) => showToast(msg, 'info', d),
    }),
    [showToast]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" aria-live="polite" aria-relevant="additions">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`toast toast--${t.variant}`}
          >
            <span className="toast__msg">{t.message}</span>
            <button
              type="button"
              className="toast__dismiss"
              aria-label="Dismiss notification"
              onClick={() => remove(t.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return ctx
}
