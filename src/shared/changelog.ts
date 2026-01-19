export type ChangeCategory = 'New' | 'Improved' | 'Fixed'

export interface ChangelogEntry {
  version: string
  date: string
  changes: {
    category: ChangeCategory
    description: {
      en: string
      es: string
    }
  }[]
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.2.1',
    date: '2026-01-19',
    changes: [
      {
        category: 'New',
        description: {
          en: 'Added changelog to track updates.',
          es: 'Se agregó registro de cambios para seguir las actualizaciones.',
        },
      },
    ],
  },
]

export const CURRENT_VERSION = CHANGELOG[0].version
