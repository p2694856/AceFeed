import { useEffect } from 'react'

export function useViewTime(postId: string, onEnd: (duration: number) => void) {
  useEffect(() => {
    const el = document.getElementById(postId)
    if (!el) return

    const start = Date.now()
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        const duration = Date.now() - start
        onEnd(duration)
        observer.disconnect()
      }
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [postId, onEnd])
}