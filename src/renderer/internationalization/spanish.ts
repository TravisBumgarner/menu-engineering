import { type TranslationKeys } from './types'

const SpanishTranslations: Record<TranslationKeys, string> = {
  // General
  save: 'Guardar',
  add: 'Agregar',
  edit: 'Editar',
  remove: 'Quitar',
  confirm: 'Confirmar',
  yes: 'Sí',
  no: 'No',
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
  recipeName: 'Nombre de Receta',
  ingredientName: 'Nombre de Ingrediente',
  addNewRecipe: 'Agregar Nueva Receta',
  addNewIngredient: 'Agregar Nuevo Ingrediente',
  addRecipe: 'Agregar Receta',
  addIngredient: 'Agregar Ingrediente',
  editRecipe: 'Editar Receta',
  editIngredient: 'Editar Ingrediente',
  editIngredients: 'Editar Ingredientes',
  updateRecipe: 'Actualizar Receta',
  addExisting: 'Agregar Existente',
  saveAndAddAnother: 'Guardar y Agregar otro',
  addSubRecipe: 'Agregar Sub-Receta',
  showInMenu: 'Mostrar en Menú',
  noDetails: 'Sin detalles',
  unitsHelpText: 'Nota - Las unidades solo se pueden establecer al crear',
  usedIn: 'Usado en',

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

  // Tooltips and Labels
  addRecipeTooltip: 'Agregar Receta',
  deleteTooltip: 'Eliminar',

  // Table Headers
  ingredientDetailsTable: 'detalles de ingredientes',

  // Modal Titles
  addNewRecipeModalTitle: 'Agregar Nueva Receta',
  addNewIngredientModalTitle: 'Agregar Nuevo Ingrediente',
  editRecipeModalTitle: 'Editar Receta',
  editIngredientModalTitle: 'Editar Ingrediente',
  addSubRecipeModalTitle: 'Agregar Nueva Sub-Receta',

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
  recipeAddedSuccessfully: '¡Receta agregada exitosamente!',
  failedToAddRecipe: 'Falló al agregar receta.',
  errorAddingRecipe: 'Error agregando receta.',
  subRecipeAddedSuccessfully: '¡Sub-receta agregada exitosamente!',
  failedToAddSubRecipe: 'Falló al agregar sub-receta.',
  errorAddingSubRecipe: 'Error agregando sub-receta.',
  recipeUpdatedSuccessfully: '¡Receta actualizada exitosamente!',
  failedToUpdateRecipe: 'Falló al actualizar receta.',
  errorUpdatingRecipe: 'Error actualizando receta.',
  ingredientUpdatedSuccessfully: '¡Ingrediente actualizado exitosamente!',
  failedToUpdateIngredient: 'Falló al actualizar ingrediente.',
  errorUpdatingIngredient: 'Error actualizando ingrediente.',
  ingredientAddedSuccessfully: '¡Ingrediente agregado exitosamente!',
  filters: 'Filtros',
  all: 'Todos',
}

export default SpanishTranslations
