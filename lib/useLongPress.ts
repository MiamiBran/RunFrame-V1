"use client"

import { useCallback, useRef } from "react"

interface UseLongPressOptions {
  threshold?: number
  onStart?: () => void
  onFinish?: () => void
  onCancel?: () => void
}

export function useLongPress(onLongPress: () => void, options: UseLongPressOptions = {}) {
  const { threshold = 600, onStart, onFinish, onCancel } = options
  const isLongPressActive = useRef(false)
  const isPressed = useRef(false)
  const timerId = useRef<NodeJS.Timeout>()

  const start = useCallback(() => {
    if (!isPressed.current) {
      isPressed.current = true
      onStart?.()

      timerId.current = setTimeout(() => {
        if (isPressed.current) {
          isLongPressActive.current = true
          onLongPress()
          onFinish?.()
        }
      }, threshold)
    }
  }, [onLongPress, threshold, onStart, onFinish])

  const clear = useCallback(
    (shouldTriggerOnCancel = true) => {
      if (timerId.current) {
        clearTimeout(timerId.current)
      }

      if (shouldTriggerOnCancel && isPressed.current && !isLongPressActive.current) {
        onCancel?.()
      }

      isLongPressActive.current = false
      isPressed.current = false
    },
    [onCancel],
  )

  return {
    onPointerDown: start,
    onPointerUp: () => clear(true),
    onPointerLeave: () => clear(false),
    onTouchStart: start,
    onTouchEnd: () => clear(true),
  }
}
