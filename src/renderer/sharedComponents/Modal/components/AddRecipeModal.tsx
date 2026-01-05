import {
  RecipeDTO
} from '../../../../shared/recipe.types'
import { useAppTranslation } from '../../../hooks/useTranslation'
import AddRecipeForm from '../../AddRecipeForm'
import { MODAL_ID } from '../Modal.consts'
import DefaultModal from './DefaultModal'

export interface AddRecipeModalProps {
  id: typeof MODAL_ID.ADD_RECIPE_MODAL
  parentRecipe?: RecipeDTO
}

const AddRecipeModal = ({ parentRecipe }: AddRecipeModalProps) => {
  const { t } = useAppTranslation()

  return (
    <DefaultModal
      title={`${t('addNewRecipe')} ${parentRecipe ? `to ${parentRecipe.title}` : ''}`}
    >
      <AddRecipeForm parentRecipe={parentRecipe} />
    </DefaultModal>
  )
}

export default AddRecipeModal
