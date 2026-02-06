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
    version: '1.4.0',
    date: '2026-02-06T12:00:00',
    changes: [
      {
        category: 'Improved',
        description: {
          en: 'Redesigned UI with new color palette, typography, and spacing system.',
          es: 'Interfaz rediseñada con nueva paleta de colores, tipografía y sistema de espaciado.',
        },
      },
    ],
  },
  {
    version: '1.3.0',
    date: '2026-02-05T12:00:00',
    changes: [
      {
        category: 'New',
        description: {
          en: 'Added search for ingredients and recipes.',
          es: 'Se agregó búsqueda de ingredientes y recetas.',
        },
      },
      {
        category: 'New',
        description: {
          en: 'Units can now be changed on existing ingredients and recipes.',
          es: 'Ahora se pueden cambiar las unidades de ingredientes y recetas existentes.',
        },
      },
      {
        category: 'Improved',
        description: {
          en: 'Improved unit change and recipe modal styling and UX.',
          es: 'Se mejoró el estilo y la experiencia de los modales de cambio de unidad y recetas.',
        },
      },
      {
        category: 'Fixed',
        description: {
          en: 'Fixed unit picker displaying disabled units.',
          es: 'Se corrigió el selector de unidades que mostraba unidades deshabilitadas.',
        },
      },
      {
        category: 'Fixed',
        description: {
          en: 'Fixed "Used In" navigation not showing recipes on other pages.',
          es: 'Se corrigió la navegación de "Usado en" que no mostraba recetas en otras páginas.',
        },
      },
      {
        category: 'Improved',
        description: {
          en: 'Restoring from backup now automatically refreshes the app.',
          es: 'Restaurar desde una copia de seguridad ahora actualiza la aplicación automáticamente.',
        },
      },
    ],
  },
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
