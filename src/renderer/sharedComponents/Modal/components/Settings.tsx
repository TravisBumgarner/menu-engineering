import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import log from 'electron-log/renderer'
import { useEffect, useState } from 'react'
import { CHANNEL } from '../../../../shared/messages.types'
import type { IngredientDTO, RecipeDTO, RelationDTO } from '../../../../shared/recipe.types'
import { useAppTranslation } from '../../../hooks/useTranslation'
import ipcMessenger from '../../../ipcMessenger'
import { SPACING } from '../../../styles/consts'
import type { MODAL_ID } from '../Modal.consts'
import DefaultModal from './DefaultModal'

export interface SettingsModalProps {
  id: typeof MODAL_ID.SETTINGS_MODAL
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SettingsModal = ({ id }: SettingsModalProps) => {
  const { t, currentLanguage, changeLanguage } = useAppTranslation()
  const [backupDirectory, setBackupDirectory] = useState<string>('')
  const [isExporting, setIsExporting] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmationText, setConfirmationText] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showNukeDialog, setShowNukeDialog] = useState(false)
  const [nukeConfirmationText, setNukeConfirmationText] = useState('')
  const [isNuking, setIsNuking] = useState(false)

  useEffect(() => {
    const getBackupDirectory = async () => {
      try {
        const result = await ipcMessenger.invoke(CHANNEL.APP.GET_BACKUP_DIRECTORY, undefined)
        setBackupDirectory(result.backupDirectory)
      } catch (error) {
        log.error('Error getting backup directory:', error)
      }
    }

    getBackupDirectory()
  }, [])

  const handleExportData = async () => {
    setIsExporting(true)
    setMessage(null)
    try {
      const result = await ipcMessenger.invoke(CHANNEL.APP.EXPORT_ALL_DATA, undefined)

      if (result.success && result.data) {
        // Create and download zip file
        const zipData = result.data

        // Convert base64 to binary data
        const binaryString = atob(zipData)
        const zipBytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          zipBytes[i] = binaryString.charCodeAt(i)
        }

        const dataBlob = new Blob([zipBytes], { type: 'application/zip' })

        const link = document.createElement('a')
        const url = URL.createObjectURL(dataBlob)
        link.setAttribute('href', url)

        const timestamp = new Date().toISOString().split('T')[0]
        link.setAttribute('download', `menu-engineering-backup-${timestamp}.zip`)
        link.style.visibility = 'hidden'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        setMessage({ type: 'success', text: t('dataExportedSuccessfully') })
      } else {
        setMessage({
          type: 'error',
          text: result.error || t('failedToExportData'),
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: t('errorExportingData') + ': ' + (error as Error).message,
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleRestoreData = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.zip,.json'

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      // Show confirmation dialog
      setSelectedFile(file)
      setShowConfirmDialog(true)
    }

    input.click()
  }

  const handleConfirmRestore = async () => {
    if (!selectedFile) return

    if (confirmationText !== 'CONFIRM' && confirmationText !== 'CONFIRMAR') {
      setMessage({
        type: 'error',
        text: t('confirmationRequired'),
      })
      return
    }

    setIsRestoring(true)
    setMessage(null)
    setShowConfirmDialog(false)
    setConfirmationText('')

    try {
      let data:
        | string
        | {
            ingredients: IngredientDTO[]
            recipes: RecipeDTO[]
            relations: (RelationDTO & {
              parentId: string
              childId: string
              type: 'ingredient' | 'sub-recipe'
            })[]
          }

      if (selectedFile.name.endsWith('.zip')) {
        // New ZIP format - convert to base64 for backend
        const arrayBuffer = await selectedFile.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        const binaryString = Array.from(uint8Array, (byte) => String.fromCharCode(byte)).join('')
        data = btoa(binaryString)
      } else {
        // Old JSON format - parse and pass as object
        const text = await selectedFile.text()
        const jsonData = JSON.parse(text)

        // Validate the data structure (basic check)
        if (!jsonData.ingredients || !jsonData.recipes || !jsonData.relations) {
          throw new Error(t('invalidBackupFile'))
        }

        data = jsonData
      }

      const result = await ipcMessenger.invoke(CHANNEL.APP.RESTORE_ALL_DATA, {
        data,
      })

      if (result.success) {
        setMessage({
          type: 'success',
          text: t('dataRestoredSuccessfully'),
        })
      } else {
        setMessage({
          type: 'error',
          text: result.error || t('failedToRestoreData'),
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: t('errorRestoringData') + ': ' + (error as Error).message,
      })
    } finally {
      setIsRestoring(false)
      setSelectedFile(null)
    }
  }

  const handleCancelRestore = () => {
    setShowConfirmDialog(false)
    setConfirmationText('')
    setSelectedFile(null)
  }

  const handleNukeDatabase = () => {
    setShowNukeDialog(true)
  }

  const handleConfirmNuke = async () => {
    if (nukeConfirmationText !== 'NUKE' && nukeConfirmationText !== 'ELIMINAR') {
      setMessage({
        type: 'error',
        text: t('confirmationRequired'),
      })
      return
    }

    setIsNuking(true)
    setMessage(null)
    setShowNukeDialog(false)
    setNukeConfirmationText('')

    try {
      const result = await ipcMessenger.invoke(CHANNEL.APP.NUKE_DATABASE, undefined)

      if (result.success) {
        window.location.reload()
      } else {
        setMessage({
          type: 'error',
          text: result.error || t('failedToNukeDatabase'),
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `${t('errorNukingDatabase')}: ${(error as Error).message}`,
      })
    } finally {
      setIsNuking(false)
    }
  }

  const handleCancelNuke = () => {
    setShowNukeDialog(false)
    setNukeConfirmationText('')
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
            onChange={(e) => changeLanguage(e.target.value)}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="es">Español</MenuItem>
          </Select>
        </FormControl>

        <Divider sx={{ my: SPACING.MEDIUM.PX }} />

        <Box sx={{ mt: SPACING.MEDIUM.PX }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('databaseBackups')}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: SPACING.SMALL.PX }}>
            {t('backupLocation')}: {backupDirectory || t('loading')}
          </Typography>
        </Box>

        <Divider sx={{ my: SPACING.MEDIUM.PX }} />

        <Box sx={{ mt: SPACING.MEDIUM.PX }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('dataManagement')}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: SPACING.MEDIUM.PX }}>
            {t('exportDataDescription')}
          </Typography>

          {message && (
            <Alert severity={message.type} sx={{ mb: SPACING.MEDIUM.PX }}>
              {message.text}
            </Alert>
          )}

          <Stack spacing={SPACING.SMALL.PX}>
            <Button
              variant="outlined"
              onClick={handleExportData}
              disabled={isExporting || isRestoring || isNuking}
              fullWidth
            >
              {isExporting ? t('exporting') : t('exportAllData')}
            </Button>

            <Button
              variant="outlined"
              color="warning"
              onClick={handleRestoreData}
              disabled={isExporting || isRestoring || isNuking}
              fullWidth
            >
              {isRestoring ? t('restoring') : t('restoreFromBackup')}
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ my: SPACING.MEDIUM.PX }} />

        <Box sx={{ mt: SPACING.MEDIUM.PX }}>
          <Typography variant="subtitle2" gutterBottom color="error">
            {t('nukeDatabase')}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: SPACING.MEDIUM.PX }}>
            {t('nukeDatabaseDescription')}
          </Typography>

          <Button
            variant="outlined"
            color="error"
            onClick={handleNukeDatabase}
            disabled={isExporting || isRestoring || isNuking}
            fullWidth
          >
            {isNuking ? t('nuking') : t('nukeDatabase')}
          </Button>
        </Box>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={handleCancelRestore}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">{t('restoreFromBackup')}</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">{t('restoreConfirmation')}</DialogContentText>
          <TextField
            margin="dense"
            fullWidth
            variant="outlined"
            placeholder={t('confirmationPlaceholder')}
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelRestore}>{t('cancel')}</Button>
          <Button
            onClick={handleConfirmRestore}
            color="warning"
            variant="contained"
            disabled={!['CONFIRM', 'CONFIRMAR'].includes(confirmationText)} // lazy lol.
          >
            {t('restoreFromBackup')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Nuke Database Confirmation Dialog */}
      <Dialog
        open={showNukeDialog}
        onClose={handleCancelNuke}
        aria-labelledby="nuke-dialog-title"
        aria-describedby="nuke-dialog-description"
      >
        <DialogTitle id="nuke-dialog-title" color="error">
          {t('nukeDatabase')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="nuke-dialog-description">{t('nukeDatabaseConfirmation')}</DialogContentText>
          <TextField
            margin="dense"
            fullWidth
            variant="outlined"
            placeholder={currentLanguage === 'es' ? 'Escribe ELIMINAR aquí' : 'Type NUKE here'}
            value={nukeConfirmationText}
            onChange={(e) => setNukeConfirmationText(e.target.value)}
            sx={{ mt: 2 }}
            color="error"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelNuke}>{t('cancel')}</Button>
          <Button
            onClick={handleConfirmNuke}
            color="error"
            variant="contained"
            disabled={!['NUKE', 'ELIMINAR'].includes(nukeConfirmationText)} // lazy lol.
          >
            {t('nukeDatabase')}
          </Button>
        </DialogActions>
      </Dialog>
    </DefaultModal>
  )
}

export default SettingsModal
