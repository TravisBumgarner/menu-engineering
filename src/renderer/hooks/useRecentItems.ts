import { useCallback, useMemo } from 'react'
import { LOCAL_STORAGE_KEYS } from '../utilities'
import { useLocalStorage } from './useLocalStorage'

const MAX_UNPINNED_ITEMS = 10

export type RecentItemType = 'recipe' | 'ingredient'

type RecentItem = {
  id: string
  title: string
  type: RecentItemType
  pinned: boolean
  lastViewed: number
}

export const useRecentItems = () => {
  const [items, setItems] = useLocalStorage<RecentItem[]>(LOCAL_STORAGE_KEYS.RECENT_ITEMS, [])

  const addRecentItem = useCallback(
    (id: string, title: string, type: RecentItemType) => {
      setItems((prev) => {
        const existing = prev.find((item) => item.id === id)
        const updated: RecentItem = {
          id,
          title,
          type,
          pinned: existing?.pinned ?? false,
          lastViewed: Date.now(),
        }

        const rest = prev.filter((item) => item.id !== id)
        const all = [updated, ...rest]

        // Evict oldest unpinned items beyond the max
        const pinned = all.filter((item) => item.pinned)
        const unpinned = all.filter((item) => !item.pinned)
        return [...pinned, ...unpinned.slice(0, MAX_UNPINNED_ITEMS)]
      })
    },
    [setItems],
  )

  const togglePin = useCallback(
    (id: string) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, pinned: !item.pinned } : item)),
      )
    },
    [setItems],
  )

  const removeItem = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((item) => item.id !== id))
    },
    [setItems],
  )

  const clearAll = useCallback(() => {
    setItems((prev) => prev.filter((item) => item.pinned))
  }, [setItems])

  const pinnedItems = useMemo(
    () =>
      items
        .filter((item) => item.pinned)
        .sort((a, b) => b.lastViewed - a.lastViewed),
    [items],
  )

  const recentItems = useMemo(
    () =>
      items
        .filter((item) => !item.pinned)
        .sort((a, b) => b.lastViewed - a.lastViewed),
    [items],
  )

  return { pinnedItems, recentItems, addRecentItem, togglePin, removeItem, clearAll }
}
