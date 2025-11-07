import {
  Box,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { CHANNEL } from '../../../../shared/messages.types'
import { useAppTranslation } from '../../../hooks/useTranslation'
import ipcMessenger from '../../../ipcMessenger'
import { SPACING } from '../../../styles/consts'
import { MODAL_ID } from '../Modal.consts'
import DefaultModal from './DefaultModal'

export interface SettingsModalProps {
  id: typeof MODAL_ID.SETTINGS_MODAL
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SettingsModal = ({ id }: SettingsModalProps) => {
  const { t, currentLanguage, changeLanguage } = useAppTranslation()
  const [backupDirectory, setBackupDirectory] = useState<string>('')

  useEffect(() => {
    const getBackupDirectory = async () => {
      try {
        const result = await ipcMessenger.invoke(
          CHANNEL.APP.GET_BACKUP_DIRECTORY,
          undefined,
        )
        setBackupDirectory(result.backupDirectory)
      } catch (error) {
        console.error('Error getting backup directory:', error)
      }
    }

    getBackupDirectory()
  }, [])

  return (
    <DefaultModal title={t('settings')}>
      <Box sx={{ minWidth: 300, pt: SPACING.SMALL.PX }}>
        <FormControl fullWidth>
          <InputLabel id="language-select-label">{t('language')}</InputLabel>
          <Select
            labelId="language-select-label"
            value={currentLanguage}
            label={t('language')}
            onChange={e => changeLanguage(e.target.value)}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="es">Español</MenuItem>
          </Select>
        </FormControl>

        <Divider sx={{ my: SPACING.MEDIUM.PX }} />

        <Box sx={{ mt: SPACING.MEDIUM.PX }}>
          <Typography variant="subtitle2" gutterBottom>
            Database Backups
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Backup location: {backupDirectory || 'Loading...'}
          </Typography>
        </Box>
      </Box>
    </DefaultModal>
  )
}

export default SettingsModal
