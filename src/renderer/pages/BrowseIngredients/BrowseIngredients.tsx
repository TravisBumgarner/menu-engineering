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
    queryKey: [QUERY_KEYS.INGREDIENTS],
    queryFn: () => ipcMessenger.invoke(CHANNEL.DB.GET_INGREDIENTS),
  })

  const handleAddIngredient = () => {
    activeModalSignal.value = {
      id: 'ADD_INGREDIENT_MODAL',
    }
  }

  if (isLoading) {
    return <div>{t('loading')}</div>
  }

  if (isError) {
    return <div>{t('errorLoadingIngredients')}</div>
  }

  if (!data) {
    return <div>{t('noDataAvailable')}</div>
  }

  return data.ingredients.length ? (
    <Table ingredients={data.ingredients} />
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
      <Typography>{t('noIngredientsFound')}</Typography>
      <Box sx={{ display: 'flex', gap: SPACING.MEDIUM.PX }}>
        <Button variant="contained" onClick={handleAddIngredient}>
          {t('addIngredient')}
        </Button>
      </Box>
    </Box>
  )
}

export default BrowseRecipes
