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
import { MODAL_ID } from './Modal.consts'

export type ActiveModal =
  | ConfirmationModalProps
  | AddRecipeModalProps
  | AddIngredientModalProps

export type ModalId = (typeof MODAL_ID)[keyof typeof MODAL_ID]

const RenderModal: FC = () => {
  useSignals()

  if (!activeModalSignal.value?.id) return null

  switch (activeModalSignal.value.id) {
    case MODAL_ID.ADD_RECIPE_MODAL:
      return <AddRecipeModal {...activeModalSignal.value} />
    case MODAL_ID.CONFIRMATION_MODAL:
      return <ConfirmationModal {...activeModalSignal.value} />
    case MODAL_ID.ADD_INGREDIENT_MODAL:
      return <AddIngredientModal {...activeModalSignal.value} />
    default:
      return null
  }
}

export default RenderModal
