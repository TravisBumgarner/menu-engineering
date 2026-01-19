import { useSignals } from '@preact/signals-react/runtime'
import type { FC } from 'react'
import { activeModalSignal } from '../../signals'
import AddIngredientModal, { type AddIngredientModalProps } from './components/AddIngredientModal'
import AddRecipeModal, { type AddRecipeModalProps } from './components/AddRecipeModal'
import AddToRecipeModal, { type AddToRecipeModalProps } from './components/AddToRecipeModal/AddToRecipeModal'
import ChangelogModal, { type ChangelogModalProps } from './components/ChangelogModal'
import ConfirmationModal, { type ConfirmationModalProps } from './components/ConfirmationModal'
import EditIngredientModal, { type EditIngredientModalProps } from './components/EditIngredientModal'
import EditRecipeModal, { type EditRecipeModalProps } from './components/EditRecipeModal'
import ExportIngredients, { type ExportIngredientsProps } from './components/ExportIngredientsModal'
import ExportRecipes, { type ExportRecipesProps } from './components/ExportRecipesModal'
import SettingsModal, { type SettingsModalProps } from './components/SettingsModal/SettingsModal'
import { MODAL_ID } from './Modal.consts'

export type ActiveModal =
  | ConfirmationModalProps
  | AddRecipeModalProps
  | AddIngredientModalProps
  | EditRecipeModalProps
  | EditIngredientModalProps
  | SettingsModalProps
  | ExportIngredientsProps
  | ExportRecipesProps
  | AddToRecipeModalProps
  | ChangelogModalProps

export type ModalId = (typeof MODAL_ID)[keyof typeof MODAL_ID]

const RenderModal: FC = () => {
  useSignals()

  if (!activeModalSignal.value?.id) return null

  switch (activeModalSignal.value.id) {
    case MODAL_ID.ADD_RECIPE_MODAL:
      return <AddRecipeModal {...activeModalSignal.value} />
    case MODAL_ID.EDIT_RECIPE_MODAL:
      return <EditRecipeModal {...activeModalSignal.value} />
    case MODAL_ID.CONFIRMATION_MODAL:
      return <ConfirmationModal {...activeModalSignal.value} />
    case MODAL_ID.ADD_INGREDIENT_MODAL:
      return <AddIngredientModal {...activeModalSignal.value} />
    case MODAL_ID.EDIT_INGREDIENT_MODAL:
      return <EditIngredientModal {...activeModalSignal.value} />
    case MODAL_ID.SETTINGS_MODAL:
      return <SettingsModal {...activeModalSignal.value} />
    case MODAL_ID.EXPORT_INGREDIENTS:
      return <ExportIngredients {...activeModalSignal.value} />
    case MODAL_ID.EXPORT_RECIPES:
      return <ExportRecipes {...activeModalSignal.value} />
    case MODAL_ID.ADD_TO_RECIPE_MODAL:
      return <AddToRecipeModal {...activeModalSignal.value} />
    case MODAL_ID.CHANGELOG_MODAL:
      return <ChangelogModal {...activeModalSignal.value} />
    default:
      return null
  }
}

export default RenderModal
