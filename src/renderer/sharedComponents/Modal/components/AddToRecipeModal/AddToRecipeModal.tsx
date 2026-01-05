import { Tab, Tabs } from '@mui/material'
import { useState } from 'react'
import { RecipeDTO } from '../../../../../shared/recipe.types'
import { useAppTranslation } from '../../../../hooks/useTranslation'
import { activeModalSignal } from '../../../../signals'
import { formateDateFilename } from '../../../../utilities'
import AddIngredientForm from '../../../AddIngredientForm'
import AddRecipeForm from '../../../AddRecipeForm'
import { MODAL_ID } from '../../Modal.consts'
import DefaultModal from './../DefaultModal'
import Autocomplete from './components/Autocomplete'

const TABS = {
    AUTOCOMPLETE: 0,
    ADD_INGREDIENT: 1,
    ADD_RECIPE: 2,
}

export interface AddToRecipeModalProps {
    id: typeof MODAL_ID.ADD_TO_RECIPE_MODAL
    recipe: RecipeDTO
}

const AddToRecipeModal = ({ recipe }: AddToRecipeModalProps) => {
    const { t } = useAppTranslation()
    const [selectedTab, setSelectedTab] = useState(0)
    const [filename, setFilename] = useState(
        formateDateFilename() + `_${t('ingredients')}`,
    )

    const handleCancel = () => {
        activeModalSignal.value = null
    }

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue)
    }

    const handleSetTab = (tab: 'addIngredient' | 'addRecipe') => {
        if (tab === 'addIngredient') {
            setSelectedTab(TABS.ADD_INGREDIENT)
        } else if (tab === 'addRecipe') {
            setSelectedTab(TABS.ADD_RECIPE)
        }
    }


    return (
        <DefaultModal title={`${t('addToRecipe')}: ${recipe.title}`} sx={{ minHeight: '600px' }}>
            <Tabs value={selectedTab} onChange={handleTabChange}>
                <Tab value={TABS.AUTOCOMPLETE} label={t('addExisting')} />
                <Tab value={TABS.ADD_INGREDIENT} label={t('addIngredient')} />
                <Tab value={TABS.ADD_RECIPE} label={t('addSubRecipe')} />
            </Tabs>
            {selectedTab === TABS.AUTOCOMPLETE && (<Autocomplete
                recipe={recipe}
                setTab={handleSetTab}
            />)}
            {selectedTab === TABS.ADD_INGREDIENT && (
                <AddIngredientForm recipe={recipe} />
            )}
            {selectedTab === TABS.ADD_RECIPE && (
                <AddRecipeForm parentRecipe={recipe} />
            )}
        </DefaultModal >
    )
}

export default AddToRecipeModal
