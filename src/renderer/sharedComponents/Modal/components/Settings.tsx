import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { useAppTranslation } from '../../../hooks/useTranslation'
import i18n from '../../../internationalization'
import { SPACING } from '../../../styles/consts'
import { MODAL_ID } from '../Modal.consts'
import DefaultModal from './DefaultModal'

export interface SettingsModalProps {
  id: typeof MODAL_ID.SETTINGS_MODAL
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SettingsModal = ({ id }: SettingsModalProps) => {
  const { t, currentLanguage } = useAppTranslation()

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language)
  }

  return (
    <DefaultModal title={t('settings')}>
      <Box sx={{ minWidth: 300, pt: SPACING.SMALL.PX }}>
        <FormControl fullWidth>
          <InputLabel id="language-select-label">{t('language')}</InputLabel>
          <Select
            labelId="language-select-label"
            value={currentLanguage}
            label={t('language')}
            onChange={e => handleLanguageChange(e.target.value)}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="es">Español</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </DefaultModal>
  )
}

export default SettingsModal
