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
    version: '1.2.2',
    date: '2026-01-23T12:00:00',
    changes: [
      {
        category: 'Fixed',
        description: {
          en: 'Fixed issue with app not loading on macOS',
          es: 'Se corrigió un problema con la carga de la aplicación en macOS.',
        },
      },
    ],
  },
  {
    version: '1.2.1',
    date: '2026-01-19T12:00:00',
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
