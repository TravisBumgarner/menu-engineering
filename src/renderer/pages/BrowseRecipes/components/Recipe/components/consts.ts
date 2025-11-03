const SORTABLE_OPTIONS = {
  title: 'title',
  createdAt: 'createdAt',
} as const

export { SORTABLE_OPTIONS }

export const isSortable = (id: string): id is SortableOption =>
  Object.keys(SORTABLE_OPTIONS).includes(id as SortableOption)
type SortableOption = keyof typeof SORTABLE_OPTIONS

export const ICON_SIZE = 15

export const ADD_ROW_HEIGHT = '80px'
