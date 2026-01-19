import { Box, Button, Chip, Divider, List, ListItem, Stack, Typography } from '@mui/material'
import { CHANGELOG, type ChangeCategory } from '../../../../shared/changelog'
import { useAppTranslation } from '../../../hooks/useTranslation'
import { activeModalSignal } from '../../../signals'
import { SPACING } from '../../../styles/consts'
import { formatDisplayDate } from '../../../utilities'
import type { MODAL_ID } from '../Modal.consts'
import DefaultModal from './DefaultModal'

export interface ChangelogModalProps {
  id: typeof MODAL_ID.CHANGELOG_MODAL
  showLatestOnly?: boolean
}

const ChangelogModal = (props: ChangelogModalProps) => {
  const { t, currentLanguage } = useAppTranslation()
  const entries = props.showLatestOnly ? [CHANGELOG[0]] : CHANGELOG
  const lang = currentLanguage === 'es' ? 'es' : 'en'

  const getCategoryColor = (category: ChangeCategory): 'success' | 'info' | 'warning' => {
    switch (category) {
      case 'New':
        return 'success'
      case 'Improved':
        return 'info'
      case 'Fixed':
        return 'warning'
    }
  }

  const getCategoryLabel = (category: ChangeCategory): string => {
    switch (category) {
      case 'New':
        return t('changelogNew')
      case 'Improved':
        return t('changelogImproved')
      case 'Fixed':
        return t('changelogFixed')
    }
  }

  const handleClose = () => {
    activeModalSignal.value = null
  }

  return (
    <DefaultModal title={props.showLatestOnly ? t('whatsNew') : t('changelog')}>
      <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
        {props.showLatestOnly && (
          <Box sx={{ mb: SPACING.MEDIUM.PX }}>
            <Typography variant="body2" color="textSecondary">
              {t('welcomeToVersion')} {entries[0].version}!
            </Typography>
          </Box>
        )}

        <Stack spacing={SPACING.MEDIUM.PX}>
          {entries.map((entry, idx) => (
            <Box key={entry.version}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: SPACING.SMALL.PX }}>
                <Typography variant="h6">Version {entry.version}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {formatDisplayDate(entry.date)}
                </Typography>
              </Stack>

              <List dense disablePadding>
                {entry.changes.map((change, changeIdx) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: It's a changelog.
                  <ListItem key={changeIdx} disableGutters sx={{ alignItems: 'flex-start' }}>
                    <Stack direction="row" spacing={SPACING.SMALL.PX}>
                      <Chip
                        label={getCategoryLabel(change.category)}
                        color={getCategoryColor(change.category)}
                        size="small"
                        sx={{ minWidth: 80 }}
                      />
                      <Typography variant="body2">{change.description[lang]}</Typography>
                    </Stack>
                  </ListItem>
                ))}
              </List>

              {idx < entries.length - 1 && <Divider sx={{ mt: SPACING.MEDIUM.PX }} />}
            </Box>
          ))}
        </Stack>

        <Box sx={{ mt: SPACING.LARGE.PX }}>
          <Button variant="contained" onClick={handleClose} fullWidth>
            {props.showLatestOnly ? t('gotIt') : t('close')}
          </Button>
        </Box>
      </Box>
    </DefaultModal>
  )
}

export default ChangelogModal
