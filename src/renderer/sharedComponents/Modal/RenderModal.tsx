import { type FC } from 'react'

import { useSignals } from '@preact/signals-react/runtime'
import { activeModalSignal } from '../../signals'
import AddIngredientModal, {
  type AddIngredientModalProps,
} from './components/AddIngredientModal'
import AddRecipeModal, {
  type AddRecipeModalProps,
} from './components/AddRecipeModal'
import ConfirmationModal, {
  type ConfirmationModalProps,
} from './components/ConfirmationModal'
import EditIngredientModal, {
  type EditIngredientModalProps,
} from './components/EditIngredientModal'
import EditRecipeModal, {
  type EditRecipeModalProps,
} from './components/EditRecipeModal'
import SettingsModal, { SettingsModalProps } from './components/Settings'
import { MODAL_ID } from './Modal.consts'

export type ActiveModal =
  | ConfirmationModalProps
  | AddRecipeModalProps
  | AddIngredientModalProps
  | EditRecipeModalProps
  | EditIngredientModalProps
  | SettingsModalProps

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
    default:
      return null
  }
}

export default RenderModal
