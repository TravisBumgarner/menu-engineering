// i18n.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

export type TranslationKeys =
  // General
  | 'loading'
  | 'error'
  | 'welcome'
  | 'cancel'
  | 'save'
  | 'update'
  | 'add'
  | 'delete'
  | 'edit'
  | 'remove'
  | 'close'
  | 'confirm'
  | 'yes'
  | 'no'
  | 'ok'
  | 'actions'
  | 'notes'
  | 'status'
  | 'title'
  | 'name'
  | 'quantity'
  | 'units'
  | 'cost'
  | 'produces'
  | 'settings'
  | 'id'
  | 'created'
  | 'updated'
  | 'outOf'

  // Navigation
  | 'appTitle'
  | 'recipes'
  | 'ingredients'
  | 'recipe'
  | 'ingredient'

  // Recipe Management
  | 'recipeName'
  | 'ingredientName'
  | 'addNewRecipe'
  | 'addNewIngredient'
  | 'addRecipe'
  | 'addIngredient'
  | 'editRecipe'
  | 'editIngredient'
  | 'updateRecipe'
  | 'updateIngredient'
  | 'deleteRecipe'
  | 'removeFromRecipe'
  | 'addExisting'
  | 'addAnother'
  | 'saveAndAddAnother'
  | 'addSubRecipe'
  | 'subRecipe'
  | 'showInMenu'
  | 'selectAllRecipes'
  | 'recipeDetails'

  // Form Labels and Placeholders
  | 'ingredientNamePlaceholder'
  | 'optionalNotesPlaceholder'
  | 'quantityLabel'
  | 'costLabel'
  | 'producesLabel'
  | 'notesLabel'
  | 'titleLabel'
  | 'unitsLabel'
  | 'statusLabel'

  // Status Values
  | 'draft'
  | 'published'
  | 'archived'

  // Messages
  | 'noRecipesFound'
  | 'noIngredientsFound'
  | 'noDataAvailable'
  | 'recipeNotFound'
  | 'errorLoadingRecipe'
  | 'errorLoadingRecipes'
  | 'errorLoadingIngredients'
  | 'addFirstRecipe'
  | 'addFirstIngredient'
  | 'ingredientRemovedSuccess'
  | 'failedToRemoveIngredient'
  | 'errorRemovingIngredient'
  | 'failedToAddIngredient'
  | 'errorAddingIngredient'

  // Loading States
  | 'adding'
  | 'saving'
  | 'updating'
  | 'removing'

  // Tooltips and Labels
  | 'expandRow'
  | 'editRecipeDetails'
  | 'editIngredientDetails'
  | 'removeIngredientFromRecipe'
  | 'addIngredientTooltip'
  | 'addRecipeTooltip'
  | 'deleteTooltip'

  // Table Headers
  | 'ingredientDetailsTable'

  // Modal Titles
  | 'addNewRecipeModalTitle'
  | 'addNewIngredientModalTitle'
  | 'editRecipeModalTitle'
  | 'editIngredientModalTitle'
  | 'addSubRecipeModalTitle'

  // Units
  | 'liters'
  | 'milliliters'
  | 'gallons'
  | 'cups'
  | 'grams'
  | 'kilograms'
  | 'ounces'
  | 'pounds'
  | 'units'
  | 'weightConversions'
  | 'volumeConversions'
  | 'unitConversions'
  | 'conversionDisclaimer'

const EnglishTranslations: Record<TranslationKeys, string> = {
  // General
  loading: 'Loading...',
  error: 'Error',
  welcome: 'Welcome!',
  cancel: 'Cancel',
  save: 'Save',
  update: 'Update',
  add: 'Add',
  delete: 'Delete',
  edit: 'Edit',
  remove: 'Remove',
  close: 'Close',
  confirm: 'Confirm',
  yes: 'Yes',
  no: 'No',
  ok: 'OK',
  actions: 'Actions',
  notes: 'Notes',
  status: 'Status',
  title: 'Title',
  name: 'Name',
  quantity: 'Quantity',
  units: 'Units',
  cost: 'Cost',
  produces: 'Produces',
  settings: 'Settings',
  id: 'ID',
  created: 'Created',
  updated: 'Updated',
  outOf: 'of',

  // Navigation
  appTitle: 'Menu Engineering',
  recipes: 'Recipes',
  ingredients: 'Ingredients',
  recipe: 'Recipe',
  ingredient: 'Ingredient',

  // Recipe Management
  recipeName: 'Recipe Name',
  ingredientName: 'Ingredient Name',
  addNewRecipe: 'Add New Recipe',
  addNewIngredient: 'Add New Ingredient',
  addRecipe: 'Add Recipe',
  addIngredient: 'Add Ingredient',
  editRecipe: 'Edit Recipe',
  editIngredient: 'Edit Ingredient',
  updateRecipe: 'Update Recipe',
  updateIngredient: 'Update Ingredient',
  deleteRecipe: 'Delete Recipe',
  removeFromRecipe: 'Remove from Recipe',
  addExisting: 'Add Existing',
  addAnother: 'Add Another',
  saveAndAddAnother: 'Save & Add another',
  addSubRecipe: 'Add Sub-Recipe',
  subRecipe: 'Sub-Recipe',
  showInMenu: 'Show in Menu',
  selectAllRecipes: 'Select All Recipes',
  recipeDetails: 'Recipe Details',

  // Form Labels and Placeholders
  ingredientNamePlaceholder: 'e.g. Flour, Salt, Olive Oil',
  optionalNotesPlaceholder: 'Optional notes about this ingredient',
  quantityLabel: 'Quantity',
  costLabel: 'Cost',
  producesLabel: 'Produces',
  notesLabel: 'Notes',
  titleLabel: 'Title',
  unitsLabel: 'Units',
  statusLabel: 'Status',

  // Status Values
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',

  // Messages
  noRecipesFound: 'No recipes found. Click below to add your first recipe.',
  noIngredientsFound: 'No ingredients found.',
  noDataAvailable: 'No data available.',
  recipeNotFound: 'Recipe not found.',
  errorLoadingRecipe: 'Error loading recipe.',
  errorLoadingRecipes: 'Error loading recipes.',
  errorLoadingIngredients: 'Error loading ingredients.',
  addFirstRecipe: 'Add your first recipe',
  addFirstIngredient: 'Add your first ingredient',
  ingredientRemovedSuccess: 'Ingredient removed from recipe successfully!',
  failedToRemoveIngredient: 'Failed to remove ingredient from recipe.',
  errorRemovingIngredient: 'Error removing ingredient from recipe.',
  failedToAddIngredient: 'Failed to add ingredient.',
  errorAddingIngredient: 'Error adding ingredient.',

  // Loading States
  adding: 'Adding...',
  saving: 'Saving...',
  updating: 'Updating...',
  removing: 'Removing...',

  // Tooltips and Labels
  expandRow: 'expand row',
  editRecipeDetails: 'Edit Recipe Details',
  editIngredientDetails: 'Edit Ingredient Details',
  removeIngredientFromRecipe: 'Remove from Recipe',
  addIngredientTooltip: 'Add Ingredient',
  addRecipeTooltip: 'Add Recipe',
  deleteTooltip: 'Delete',

  // Table Headers
  ingredientDetailsTable: 'ingredient details',

  // Modal Titles
  addNewRecipeModalTitle: 'Add New Recipe',
  addNewIngredientModalTitle: 'Add New Ingredient',
  editRecipeModalTitle: 'Edit Recipe',
  editIngredientModalTitle: 'Edit Ingredient',
  addSubRecipeModalTitle: 'Add New Sub-Recipe',

  // Units
  liters: 'Liters',
  milliliters: 'Milliliters',
  gallons: 'Gallons',
  cups: 'Cups',
  grams: 'Grams',
  kilograms: 'Kilograms',
  ounces: 'Ounces',
  pounds: 'Pounds',
  weightConversions: 'Weight Conversion Table',
  volumeConversions: 'Volume Conversion Table',
  unitConversions: 'Unit Conversion Tables',
  conversionDisclaimer:
    'Conversions are approximate and based on US standard measurements',
}

const SpanishTranslations: Record<TranslationKeys, string> = {
  // General
  loading: 'Cargando...',
  error: 'Error',
  welcome: '¡Bienvenido!',
  cancel: 'Cancelar',
  save: 'Guardar',
  update: 'Actualizar',
  add: 'Agregar',
  delete: 'Eliminar',
  edit: 'Editar',
  remove: 'Quitar',
  close: 'Cerrar',
  confirm: 'Confirmar',
  yes: 'Sí',
  no: 'No',
  ok: 'OK',
  actions: 'Acciones',
  notes: 'Notas',
  status: 'Estado',
  title: 'Título',
  name: 'Nombre',
  quantity: 'Cantidad',
  units: 'Unidades',
  cost: 'Costo',
  produces: 'Produce',
  settings: 'Configuraciones',
  id: 'ID',
  created: 'Creado',
  updated: 'Actualizado',
  outOf: 'de',

  // Navigation
  appTitle: 'Ingeniería de Menú',
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
  updateRecipe: 'Actualizar Receta',
  updateIngredient: 'Actualizar Ingrediente',
  deleteRecipe: 'Eliminar Receta',
  removeFromRecipe: 'Quitar de Receta',
  addExisting: 'Agregar Existente',
  addAnother: 'Agregar Otro',
  saveAndAddAnother: 'Guardar y Agregar otro',
  addSubRecipe: 'Agregar Sub-Receta',
  subRecipe: 'Sub-Receta',
  showInMenu: 'Mostrar en Menú',
  selectAllRecipes: 'Seleccionar Todas las Recetas',
  recipeDetails: 'Detalles de Receta',

  // Form Labels and Placeholders
  ingredientNamePlaceholder: 'ej. Harina, Sal, Aceite de Oliva',
  optionalNotesPlaceholder: 'Notas opcionales sobre este ingrediente',
  quantityLabel: 'Cantidad',
  costLabel: 'Costo',
  producesLabel: 'Produce',
  notesLabel: 'Notas',
  titleLabel: 'Título',
  unitsLabel: 'Unidades',
  statusLabel: 'Estado',

  // Status Values
  draft: 'Borrador',
  published: 'Publicado',
  archived: 'Archivado',

  // Messages
  noRecipesFound:
    'No se encontraron recetas. Haz clic abajo para agregar tu primera receta.',
  noIngredientsFound: 'No se encontraron ingredientes.',
  noDataAvailable: 'No hay datos disponibles.',
  recipeNotFound: 'Receta no encontrada.',
  errorLoadingRecipe: 'Error cargando receta.',
  errorLoadingRecipes: 'Error cargando recetas.',
  errorLoadingIngredients: 'Error cargando ingredientes.',
  addFirstRecipe: 'Agrega tu primera receta',
  addFirstIngredient: 'Agrega tu primer ingrediente',
  ingredientRemovedSuccess: '¡Ingrediente quitado de la receta exitosamente!',
  failedToRemoveIngredient: 'Falló al quitar ingrediente de la receta.',
  errorRemovingIngredient: 'Error quitando ingrediente de la receta.',
  failedToAddIngredient: 'Falló al agregar ingrediente.',
  errorAddingIngredient: 'Error agregando ingrediente.',

  // Loading States
  adding: 'Agregando...',
  saving: 'Guardando...',
  updating: 'Actualizando...',
  removing: 'Quitando...',

  // Tooltips and Labels
  expandRow: 'expandir fila',
  editRecipeDetails: 'Editar Detalles de Receta',
  editIngredientDetails: 'Editar Detalles de Ingrediente',
  removeIngredientFromRecipe: 'Quitar de Receta',
  addIngredientTooltip: 'Agregar Ingrediente',
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
  liters: 'Litros',
  milliliters: 'Mililitros',
  gallons: 'Galones',
  cups: 'Tazas',
  grams: 'Gramos',
  kilograms: 'Kilogramos',
  ounces: 'Onzas',
  pounds: 'Libras',
  weightConversions: 'Tabla de Conversión de Peso',
  volumeConversions: 'Tabla de Conversión de Volumen',
  unitConversions: 'Conversión de Unidades',
  conversionDisclaimer:
    'Las conversiones son aproximadas y se basan en medidas estándar de EE.UU.',
}

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: EnglishTranslations,
    },
    es: {
      translation: SpanishTranslations,
    },
  },
  lng: 'en', // default language
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
