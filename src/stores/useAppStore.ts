import { useState, useEffect } from 'react'

type CompanyData = {
  name: string
  sector: string
  taxRegime: string
  location: string
}

type AppState = {
  isAuthenticated: boolean
  companyData: CompanyData | null
}

let memoryState: AppState = {
  isAuthenticated: false,
  companyData: null,
}

const listeners = new Set<(state: AppState) => void>()

export const setAppState = (partial: Partial<AppState>) => {
  memoryState = { ...memoryState, ...partial }
  listeners.forEach((listener) => listener(memoryState))
}

export default function useAppStore() {
  const [state, setState] = useState<AppState>(memoryState)

  useEffect(() => {
    listeners.add(setState)
    return () => {
      listeners.delete(setState)
    }
  }, [])

  return {
    ...state,
    setAppState,
  }
}
