import { useEffect, useRef } from 'react'

export function useAdminLiveRefresh(refresh, { intervalMs = 10000, enabled = true } = {}) {
  const refreshRef = useRef(refresh)
  const inFlightRef = useRef(false)

  useEffect(() => {
    refreshRef.current = refresh
  }, [refresh])

  useEffect(() => {
    if (!enabled) return undefined

    const run = async () => {
      if (inFlightRef.current || document.visibilityState !== 'visible') return
      inFlightRef.current = true
      try {
        await refreshRef.current?.()
      } finally {
        inFlightRef.current = false
      }
    }

    const intervalId = window.setInterval(run, intervalMs)
    const handleFocus = () => {
      void run()
    }
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void run()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [enabled, intervalMs])
}
