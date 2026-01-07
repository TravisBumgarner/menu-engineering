import { useQuery } from '@tanstack/react-query'
import Logger from 'electron-log'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CHANNEL } from '../../../shared/messages.types'
import { QUERY_KEYS } from '../../consts'
import { useAppTranslation } from '../../hooks/useTranslation'
import ipcMessenger from '../../ipcMessenger'
import { activeRecipeIdSignal } from '../../signals'
import Table from './components/Table'

const BrowseRecipes = () => {
  const { t } = useAppTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [QUERY_KEYS.RECIPES],
    queryFn: async () => {
      const response = await ipcMessenger.invoke(CHANNEL.DB.GET_RECIPES)
      return response
    },
  })

  useEffect(() => {
    if (searchParams.has('activeRecipeId')) {
      activeRecipeIdSignal.value = searchParams.get('activeRecipeId') || ''
      navigate('/', { replace: true })
    }
  }, [searchParams, navigate])

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
