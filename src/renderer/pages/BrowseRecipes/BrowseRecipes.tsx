import { useQuery } from '@tanstack/react-query'
import Logger from 'electron-log'
import { CHANNEL } from '../../../shared/messages.types'
import { QUERY_KEYS } from '../../consts'
import { useAppTranslation } from '../../hooks/useTranslation'
import ipcMessenger from '../../ipcMessenger'
import Table from './components/Table'

const BrowseRecipes = () => {
  const { t } = useAppTranslation()
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [QUERY_KEYS.RECIPES],
    queryFn: async () => {
      const response = await ipcMessenger.invoke(CHANNEL.DB.GET_RECIPES)
      return response
    },
  })

  if (isLoading) {
    return <div>{t('loading')}</div>
  }

  if (isError) {
    Logger.error('Error loading recipes', error)
    return <div>{t('errorLoadingRecipes')}</div>
  }

  if (!data) {
    return <div>{t('noDataAvailable')}</div>
  }

  return <Table recipes={data.recipes} />
}

export default BrowseRecipes
