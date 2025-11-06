import { useQuery } from '@tanstack/react-query'
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
  const { data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEYS.RECIPES],
    queryFn: () => ipcMessenger.invoke(CHANNEL.DB.GET_RECIPES),
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
    return <div>{t('errorLoadingRecipes')}</div>
  }

  if (!data) {
    return <div>{t('noDataAvailable')}</div>
  }

  return <Table recipes={data.recipes} />
}

export default BrowseRecipes
