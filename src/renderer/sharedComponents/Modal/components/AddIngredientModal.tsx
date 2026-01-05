import { RecipeDTO } from '../../../../shared/recipe.types'
import { useAppTranslation } from '../../../hooks/useTranslation'
import AddIngredientForm from '../../AddIngredientForm'
import { MODAL_ID } from '../Modal.consts'
import DefaultModal from './DefaultModal'

export interface AddIngredientModalProps {
  id: typeof MODAL_ID.ADD_INGREDIENT_MODAL
  recipe?: RecipeDTO
}


const AddIngredientModal = ({ recipe }: AddIngredientModalProps) => {
  const { t } = useAppTranslation()

  return (
    <DefaultModal
      title={
        recipe
          ? `${t('addNewIngredient')} to ${recipe.title}`
          : t('addNewIngredient')
      }
    >
      <AddIngredientForm recipe={recipe} />
    </DefaultModal>
  )
}

export default AddIngredientModal
