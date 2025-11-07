import { useQuery } from '@tanstack/react-query'
import { CHANNEL } from '../../../shared/messages.types'
import { QUERY_KEYS } from '../../consts'
import { useAppTranslation } from '../../hooks/useTranslation'
import ipcMessenger from '../../ipcMessenger'
import Table from './components/Table'

const BrowseRecipes = () => {
  const { t } = useAppTranslation()
  const { data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEYS.INGREDIENTS],
    queryFn: () => ipcMessenger.invoke(CHANNEL.DB.GET_INGREDIENTS),
  })

  if (isLoading) {
    return <div>{t('loading')}</div>
  }

  if (isError) {
    return <div>{t('errorLoadingIngredients')}</div>
  }

  if (!data) {
    return <div>{t('noDataAvailable')}</div>
  }

  return <Table ingredients={data.ingredients} />
}

export default BrowseRecipes
