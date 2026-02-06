import { Box, Tab, Tabs } from '@mui/material'
import { useState } from 'react'
import { useAppTranslation } from '../../../../hooks/useTranslation'
import { SPACING } from '../../../../styles/consts'
import type { MODAL_ID } from '../../Modal.consts'
import DefaultModal from '../DefaultModal'
import TabChangelog from './components/TabChangelog'
import TabData from './components/TabData'
import TabInternationalization from './components/TabInternationalization'
import TabUnitPreferences from './components/TabUnitPreferences'

export interface SettingsModalProps {
  id: typeof MODAL_ID.SETTINGS_MODAL
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SettingsModal = (_props: SettingsModalProps) => {
  const { t } = useAppTranslation()
  const [activeTab, setActiveTab] = useState(0)

  return (
    <DefaultModal title={t('settings')} sx={{ height: '650px', width: '800px' }}>
      <Tabs
        value={activeTab}
        onChange={(_e, newValue) => setActiveTab(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: SPACING.MEDIUM.PX }}
      >
        <Tab label={t('unitPreferences')} />
        <Tab label={t('internationalization')} />
        <Tab label={t('data')} />
        <Tab label={t('changelog')} />
      </Tabs>

      {activeTab === 0 && <TabUnitPreferences />}
      {activeTab === 1 && <TabInternationalization />}
      {activeTab === 2 && <TabData />}
      {activeTab === 3 && <TabChangelog />}
    </DefaultModal>
  )
}

export default SettingsModal
