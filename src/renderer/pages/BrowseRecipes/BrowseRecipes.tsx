import { Box, Button, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { CHANNEL } from '../../../shared/messages.types'
import { QUERY_KEYS } from '../../consts'
import { useAppTranslation } from '../../hooks/useTranslation'
import ipcMessenger from '../../ipcMessenger'
import { activeModalSignal } from '../../signals'
import { SPACING } from '../../styles/consts'
import Table from './components/Table'

const BrowseRecipes = () => {
  const { t } = useAppTranslation()
  const { data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEYS.RECIPES],
    queryFn: () => ipcMessenger.invoke(CHANNEL.DB.GET_RECIPES),
  })

  const handleAddRecipe = () => {
    activeModalSignal.value = {
      id: 'ADD_RECIPE_MODAL',
    }
  }

  if (isLoading) {
    return <div>{t('loading')}</div>
  }

  if (isError) {
    return <div>{t('errorLoadingRecipes')}</div>
  }

  if (!data) {
    return <div>{t('noDataAvailable')}</div>
  }

  return data.recipes.length ? (
    <Table recipes={data.recipes} />
  ) : (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: SPACING.SMALL.PX,
        height: '100%',
      }}
    >
      <Typography variant="h1">{t('welcome')}</Typography>
      <Typography>{t('noRecipesFound')}</Typography>
      <Box sx={{ display: 'flex', gap: SPACING.MEDIUM.PX }}>
        <Button variant="contained" onClick={handleAddRecipe}>
          {t('addRecipe')}
        </Button>
      </Box>
    </Box>
  )
}

export default BrowseRecipes
