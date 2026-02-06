import { Box, Button } from '@mui/material'
import { useAppTranslation } from '../../../hooks/useTranslation'
import { activeModalSignal } from '../../../signals'
import { SPACING } from '../../../styles/consts'
import ChangelogContent from '../../ChangelogContent'
import type { MODAL_ID } from '../Modal.consts'
import DefaultModal from './DefaultModal'

export interface ChangelogModalProps {
  id: typeof MODAL_ID.CHANGELOG_MODAL
  showLatestOnly?: boolean
}

const ChangelogModal = (props: ChangelogModalProps) => {
  const { t } = useAppTranslation()

  const handleClose = () => {
    activeModalSignal.value = null
  }

  return (
    <DefaultModal title={props.showLatestOnly ? t('whatsNew') : t('changelog')}>
      <ChangelogContent showLatestOnly={props.showLatestOnly} />
      <Box sx={{ mt: SPACING.LARGE.PX }}>
        <Button variant="contained" onClick={handleClose} fullWidth>
          {props.showLatestOnly ? t('gotIt') : t('close')}
        </Button>
      </Box>
    </DefaultModal>
  )
}

export default ChangelogModal
