import { TranslationKeys } from './types'
const EnglishTranslations: Record<TranslationKeys, string> = {
  // General
  save: 'Save',
  add: 'Add',

  edit: 'Edit',
  remove: 'Remove',
  update: 'Update',
  yes: 'Yes',
  no: 'No',
  loading: 'Loading...',
  cancel: 'Cancel',
  status: 'Status',
  title: 'Title',
  quantity: 'Quantity',
  units: 'Units',
  cost: 'Cost',
  produces: 'Produces',
  settings: 'Settings',
  created: 'Created',
  outOf: 'of',
  unitCost: 'Unit Cost',
  totalCost: 'Total Cost',

  // Navigation
  recipes: 'Recipes',
  ingredients: 'Ingredients',
  recipe: 'Recipe',
  ingredient: 'Ingredient',

  // Recipe Management
  noDataAvailable: 'No Data Available',
  recipeName: 'Recipe Name',
  ingredientName: 'Ingredient Name',
  addNewRecipe: 'Add New Recipe',
  addNewIngredient: 'Add New Ingredient',
  addRecipe: 'Add Recipe',
  addIngredient: 'Add Ingredient',
  editRecipe: 'Edit Recipe',
  editIngredient: 'Edit Ingredient',
  editIngredients: 'Edit Ingredients',
  addExisting: 'Add Existing',
  saveAndAddAnother: 'Save & Add another',
  addSubRecipe: 'Add Sub-Recipe',
  showInMenu: 'Show in Menu',
  noDetails: 'No Details',
  unitsHelpText: 'Note - Units can only be set on creation',
  usedIn: 'Used In',

  // Form Labels and Placeholders
  ingredientNamePlaceholder: 'e.g. Flour, Salt, Olive Oil',

  // Status Values
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',

  // Messages
  recipeNotFound: 'Recipe not found.',
  ingredientNotFound: 'Ingredient not found.',
  errorLoadingRecipe: 'Error loading recipe.',
  errorLoadingRecipes: 'Error loading recipes.',
  errorLoadingIngredients: 'Error loading ingredients.',
  failedToAddIngredient: 'Failed to add ingredient.',
  errorAddingIngredient: 'Error adding ingredient.',

  // Loading States
  adding: 'Adding...',
  saving: 'Saving...',
  updating: 'Updating...',

  // Units
  units_singular: 'Unit',
  units_plural: 'Units',
  liters_singular: 'Liter',
  liters_plural: 'Liters',
  milliliters_singular: 'Milliliter',
  milliliters_plural: 'Milliliters',
  gallons_singular: 'Gallon',
  gallons_plural: 'Gallons',
  cups_singular: 'Cup',
  cups_plural: 'Cups',
  grams_singular: 'Gram',
  grams_plural: 'Grams',
  kilograms_singular: 'Kilogram',
  kilograms_plural: 'Kilograms',
  ounces_singular: 'Ounce',
  ounces_plural: 'Ounces',
  pounds_singular: 'Pound',
  pounds_plural: 'Pounds',
  pieces_singular: 'Piece',
  pieces_plural: 'Pieces',
  weightConversions: 'Weight Conversion Table',
  volumeConversions: 'Volume Conversion Table',
  unitConversions: 'Unit Conversion Tables',
  conversionDisclaimer:
    'Conversions are approximate and based on US standard measurements',

  // Missing translations
  language: 'Language',
  english: 'English',
  spanish: 'Spanish',
  failedToAddRecipe: 'Failed to add recipe.',
  errorAddingRecipe: 'Error adding recipe.',
  failedToAddSubRecipe: 'Failed to add sub-recipe.',
  errorAddingSubRecipe: 'Error adding sub-recipe.',
  failedToUpdateRecipe: 'Failed to update recipe.',
  errorUpdatingRecipe: 'Error updating recipe.',
  failedToUpdateIngredient: 'Failed to update ingredient.',
  errorUpdatingIngredient: 'Error updating ingredient.',
  all: 'All',
}

export default EnglishTranslations
