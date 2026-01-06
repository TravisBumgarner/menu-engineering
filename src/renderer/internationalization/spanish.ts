import { type TranslationKeys } from './types'

const SpanishTranslations: Record<TranslationKeys, string> = {
  RECIPE_EXISTS: 'La receta ya existe.',
  INGREDIENT_EXISTS: 'El ingrediente ya existe.',
  SOMETHING_WENT_WRONG: 'Algo salió mal. Por favor, inténtalo de nuevo.',

  // General
  save: 'Guardar',
  add: 'Agregar',
  edit: 'Editar',
  export: 'Exportar',
  remove: 'Quitar',
  update: 'Actualizar',
  cancel: 'Cancelar',
  yes: 'Sí',
  no: 'No',
  loading: 'Cargando...',
  filename: 'Nombre de archivo',
  status: 'Estado',
  title: 'Título',
  quantity: 'Cantidad',
  units: 'Unidades',
  cost: 'Costo',
  produces: 'Produce',
  settings: 'Configuraciones',
  created: 'Creado',
  outOf: 'de',
  unitCost: 'Costo Unitario',
  totalCost: 'Costo Total',

  // Navigation
  recipes: 'Recetas',
  ingredients: 'Ingredientes',
  recipe: 'Receta',
  ingredient: 'Ingrediente',

  // Recipe Management
  noDataAvailable: 'No hay datos disponibles',
  recipeName: 'Nombre de Receta',
  ingredientName: 'Nombre de Ingrediente',
  addNewRecipe: 'Agregar Nueva Receta',
  addNewIngredient: 'Agregar Nuevo Ingrediente',
  addRecipe: 'Agregar Receta',
  addIngredient: 'Agregar Ingrediente',
  editRecipe: 'Editar Receta',
  editIngredient: 'Editar Ingrediente',
  editIngredients: 'Editar Ingredientes',
  addExisting: 'Agregar Existente',
  saveAndAddAnother: 'Guardar y Agregar otro',
  addSubRecipe: 'Agregar Sub-Receta',
  showInMenu: 'En Menú',
  filterToMenuItems: 'Solo platos del menú',
  noDetails: 'Sin detalles',
  unitsHelpText: 'Nota - Las unidades solo se pueden establecer al crear',
  usedIn: 'Usado en',
  addToRecipe: 'Agregar a Receta',
  recipeUses: 'Receta utiliza',
  close: 'Cerrar',

  // Form Labels and Placeholders
  ingredientNamePlaceholder: 'ej. Harina, Sal, Aceite de Oliva',

  // Status Values
  draft: 'Borrador',
  published: 'Publicado',
  archived: 'Archivado',

  // Messages
  recipeNotFound: 'Receta no encontrada.',
  ingredientNotFound: 'Ingrediente no encontrado.',
  errorLoadingRecipe: 'Error cargando receta.',
  errorLoadingRecipes: 'Error cargando recetas.',
  errorLoadingIngredients: 'Error cargando ingredientes.',
  failedToAddIngredient: 'Falló al agregar ingrediente.',
  errorAddingIngredient: 'Error agregando ingrediente.',

  // Loading States
  adding: 'Agregando...',
  saving: 'Guardando...',
  updating: 'Actualizando...',

  // Units
  units_singular: 'Unidad',
  units_plural: 'Unidades',
  liters_singular: 'Litro',
  liters_plural: 'Litros',
  milliliters_singular: 'Mililitro',
  milliliters_plural: 'Mililitros',
  gallons_singular: 'Galón',
  gallons_plural: 'Galones',
  cups_singular: 'Taza',
  cups_plural: 'Tazas',
  grams_singular: 'Gramo',
  grams_plural: 'Gramos',
  kilograms_singular: 'Kilogramo',
  kilograms_plural: 'Kilogramos',
  ounces_singular: 'Onza',
  ounces_plural: 'Onzas',
  pounds_singular: 'Libra',
  pounds_plural: 'Libras',
  pieces_singular: 'Pieza',
  pieces_plural: 'Piezas',
  weightConversions: 'Tabla de Conversión de Peso',
  volumeConversions: 'Tabla de Conversión de Volumen',
  unitConversions: 'Conversión de Unidades',
  conversionDisclaimer:
    'Las conversiones son aproximadas y se basan en medidas estándar de EE.UU.',

  // Missing translations
  language: 'Idioma',
  english: 'Inglés',
  spanish: 'Español',
  errorAddingRecipe: 'Error agregando receta.',
  errorAddingSubRecipe: 'Error agregando sub-receta.',
  failedToUpdateRecipe: 'Falló al actualizar receta.',
  errorUpdatingRecipe: 'Error actualizando receta.',
  failedToUpdateIngredient: 'Falló al actualizar ingrediente.',
  errorUpdatingIngredient: 'Error actualizando ingrediente.',
  all: 'Todos',

  // Data Management
  dataManagement: 'Gestión de Datos',
  databaseBackups: 'Copias de Seguridad de Base de Datos',
  backupLocation: 'Ubicación de copia de seguridad',
  exportAllData: 'Exportar Todos los Datos (JSON)',
  restoreFromBackup: 'Restaurar desde Copia de Seguridad',
  exporting: 'Exportando...',
  restoring: 'Restaurando...',
  dataExportedSuccessfully: '¡Datos exportados exitosamente!',
  dataRestoredSuccessfully:
    '¡Datos restaurados exitosamente! Por favor reinicia la aplicación.',
  failedToExportData: 'Falló al exportar datos',
  failedToRestoreData: 'Falló al restaurar datos',
  errorExportingData: 'Error exportando datos',
  errorRestoringData: 'Error restaurando datos',
  invalidBackupFile: 'Formato de archivo de copia de seguridad inválido',
  exportDataDescription:
    'Exporta todos tus datos como JSON o restaura desde un archivo de copia de seguridad.',
  restoreConfirmation:
    'Escribe "CONFIRMAR" para restaurar datos (esto eliminará todos los datos actuales)',
  confirmationPlaceholder: 'Escribe CONFIRMAR aquí',
  confirmationRequired: 'Debes escribir CONFIRMAR para continuar',
  nukeDatabase: 'Eliminar Todos los Datos',
  nukeDatabaseConfirmation:
    'Escribe "ELIMINAR" para borrar permanentemente TODOS los datos (esto no se puede deshacer)',
  nukeDatabaseSuccessfully: '¡Todos los datos eliminados exitosamente!',
  failedToNukeDatabase: 'Falló al eliminar base de datos',
  errorNukingDatabase: 'Error eliminando base de datos',
  nukeDatabaseDescription:
    'Eliminar permanentemente todas las recetas, ingredientes y relaciones.',
  nuking: 'Eliminando...',
}

export default SpanishTranslations
