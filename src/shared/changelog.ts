export interface ChangelogEntry {
  version: string
  date: string
  changes: {
    category: 'New' | 'Improved' | 'Fixed'
    description: string
  }[]
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.2.1',
    date: '2026-01-19',
    changes: [
      {
        category: 'New',
        description: 'Added changelog to track updates.',
      },
    ],
  },
]

export const CURRENT_VERSION = CHANGELOG[0].version
