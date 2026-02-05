import { Box, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { CHANNEL } from '../../../../shared/messages.types'
import { QUERY_KEYS } from '../../../consts'
import { useAppTranslation } from '../../../hooks/useTranslation'
import ipcMessenger from '../../../ipcMessenger'
import Link from '../../../sharedComponents/Link'
import { FONT_SIZES, SPACING } from '../../../styles/consts'

const Ingredient = ({ id }: { id: string }) => {
  const { t } = useAppTranslation()

  const { data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEYS.INGREDIENT, id],
    queryFn: async () => {
      if (!id) throw new Error(t('ingredientNotFound'))

      const response = await ipcMessenger.invoke(CHANNEL.DB.GET_INGREDIENT, {
        id,
      })
      return response
    },
  })

  if (!id) {
    return <div>{t('ingredientNotFound')}</div>
  }

  if (isLoading) {
    return <div>{t('loading')}</div>
  }

  if (isError) {
    return <div>{t('errorLoadingRecipe')}</div>
  }

  if (!data || !data.ingredient) {
    return <div>{t('ingredientNotFound')}</div>
  }

  return (
    <Box
      sx={{
        padding: SPACING.SMALL.PX,
      }}
    >
      <Typography sx={{ fontSize: FONT_SIZES.SMALL.PX }}>
        {t('usedIn')}
        {': '}
        {data.usedInRecipes.length === 0 && ` 0 ${t('recipes')}`}
        {data.usedInRecipes.map((recipe) => (
          <Link key={recipe.id} to={`/recipe/${recipe.id}`}>
            {recipe.title}
          </Link>
        ))}
      </Typography>
    </Box>
  )
}

export default Ingredient
