"use client"

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'

interface TimerContextType {
  isTimerActive: boolean
  setIsTimerActive: (active: boolean) => void
  registerFocusCallback: (callback: (focusPercentage: number) => void) => void
  triggerFocusUpdate: (focusPercentage: number) => void
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

export function TimerProvider({ children }: { children: ReactNode }) {
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [focusCallback, setFocusCallback] = useState<((focusPercentage: number) => void) | null>(null)

  const registerFocusCallback = useCallback((callback: (focusPercentage: number) => void) => {
    setFocusCallback(() => callback)
  }, [])

  const triggerFocusUpdate = useCallback((focusPercentage: number) => {
    if (focusCallback) {
      focusCallback(focusPercentage)
    }
  }, [focusCallback])

  return (
    <TimerContext.Provider value={{ isTimerActive, setIsTimerActive, registerFocusCallback, triggerFocusUpdate }}>
      {children}
    </TimerContext.Provider>
  )
}

export function useTimer() {
  const context = useContext(TimerContext)
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider')
  }
  return context
}
