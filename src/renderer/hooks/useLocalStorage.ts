import { useCallback, useEffect, useRef, useState } from 'react'
import { getFromLocalStorage, type LOCAL_STORAGE_KEYS, setToLocalStorage } from '../utilities'

/**
 * A React hook for managing localStorage state with automatic synchronization
 * @param key - The localStorage key
 * @param defaultValue - The default value if key doesn't exist
 * @returns A tuple of [value, setValue] similar to useState
 */
export const useLocalStorage = <T>(
  key: keyof typeof LOCAL_STORAGE_KEYS,
  defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void] => {
  const defaultValueRef = useRef(defaultValue)

  // Initialize state with value from localStorage or default
  const [storedValue, setStoredValue] = useState<T>(() => {
    return getFromLocalStorage(key, defaultValue)
  })

  // Stable setter that uses functional updater to avoid closing over storedValue
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const valueToStore = value instanceof Function ? value(prev) : value
          setToLocalStorage(key, valueToStore)
          return valueToStore
        })
        // Notify other hook instances in the same tab
        window.dispatchEvent(new CustomEvent('local-storage-update', { detail: { key } }))
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key],
  )

  useEffect(() => {
    // Cross-tab synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch (error) {
          console.warn(`Failed to parse storage change for key "${key}":`, error)
        }
      }
    }

    // Same-tab synchronization between hook instances
    const handleLocalUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail.key === key) {
        setStoredValue(getFromLocalStorage(key, defaultValueRef.current))
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('local-storage-update', handleLocalUpdate)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('local-storage-update', handleLocalUpdate)
    }
  }, [key])

  return [storedValue, setValue]
}
