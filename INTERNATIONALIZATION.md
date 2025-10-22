# Internationalization Implementation Guide

## Overview

The Menu Engineering application now supports English and Spanish translations using React i18next. This guide shows how the implementation works and how to extend it.

## Key Files

### Translation Configuration

- `/src/renderer/internationalization.ts` - Main i18n setup with all translation keys and strings
- `/src/renderer/hooks/useTranslation.ts` - Custom hook for type-safe translations

### Components Updated

- `Navigation.tsx` - App title and navigation labels
- `AddIngredientModal.tsx` - Form labels, buttons, and messages
- `BrowseRecipes.tsx` - Loading states and error messages
- `Head.tsx` (BrowseRecipes) - Table headers

### Language Switcher

- `LanguageSwitcher.tsx` - Dropdown to switch between EN/ES

## Usage Examples

### Basic Translation

```typescript
import { useAppTranslation } from '../hooks/useTranslation'

const MyComponent = () => {
  const { t } = useAppTranslation()

  return (
    <Typography>{t('welcome')}</Typography>
  )
}
```

### Form Labels

```typescript
<TextField
  label={t('ingredientName')}
  placeholder={t('ingredientNamePlaceholder')}
/>
```

### Dynamic Messages

```typescript
<Typography>
  {recipe
    ? `${t('addNewIngredient')} to ${recipe.title}`
    : t('addNewIngredient')
  }
</Typography>
```

### Conditional Loading States

```typescript
{
  addIngredientMutation.isPending ? t('saving') : t('save')
}
```

## Available Translation Keys

The system includes comprehensive translations for:

- **General UI**: loading, error, welcome, cancel, save, update, etc.
- **Navigation**: appTitle, recipes, ingredients
- **Recipe Management**: addNewRecipe, editRecipe, updateRecipe, etc.
- **Form Labels**: ingredientName, quantity, units, cost, produces, notes
- **Status Values**: draft, published, archived
- **Messages**: Error messages, success messages, empty states
- **Tooltips**: editRecipeDetails, addIngredientTooltip, etc.

## Adding New Translations

1. Add the key to `TranslationKeys` type
2. Add English translation to `EnglishTranslations`
3. Add Spanish translation to `SpanishTranslations`
4. Use `t('yourKey')` in components

## Language Switching

Users can switch languages using the dropdown in the navigation bar. The selected language persists for the session.

## Testing

To test the translations:

1. Run the application: `npm run dev`
2. Use the language switcher in the top navigation
3. Navigate through different pages to see translated content
4. Test form submissions and error states in both languages

## Current Implementation Status

### ✅ Completed

- Core i18n infrastructure setup
- Navigation component translations
- Add Ingredient modal fully translated
- Browse Recipes page with loading/error states
- Language switcher component
- Table headers for recipes list

### 🔄 Remaining Work

- Complete all modal components (EditIngredient, AddRecipe, EditRecipe)
- Translate all table components and tooltips
- Add translations to remaining pages
- Status value translations throughout the app
- Alert/error message translations in all components

### 🎯 Next Steps

1. Continue translating remaining components systematically
2. Add unit tests for translation functionality
3. Consider adding more languages (French, German, etc.)
4. Implement language preference persistence in local storage
