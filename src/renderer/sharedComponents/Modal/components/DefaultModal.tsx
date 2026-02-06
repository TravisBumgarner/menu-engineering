import { Typography } from '@mui/material'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import MUIModal from '@mui/material/Modal'
import type { SxProps } from '@mui/material/styles'
import { type FC, useCallback } from 'react'
import Icon from '../../../sharedComponents/Icon'
import { activeModalSignal } from '../../../signals'
import { SPACING, Z_INDICES } from '../../../styles/consts'

interface ActiveModal {
  children: React.ReactNode | React.ReactNode[]
  closeCallback?: () => void
  sx?: SxProps
  title: string
}

const Modal: FC<ActiveModal> = ({ children, closeCallback, sx, title }) => {
  const handleClose = useCallback(
    (_event: unknown, reason?: string) => {
      if (closeCallback) closeCallback()

      if (reason === 'backdropClick') return
      activeModalSignal.value = null
    },
    [closeCallback],
  )

  return (
    <MUIModal
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: Z_INDICES.MODAL,
        padding: SPACING.LG.PX,
        overflowY: 'auto',
        maxHeight: '100vh',
      }}
      open={activeModalSignal.value !== null}
      onClose={handleClose}
      disableRestoreFocus={true}
      disableEscapeKeyDown={true}
    >
      <Box
        sx={{
          width: '560px',
          maxWidth: '90%',
          maxHeight: '85vh',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.paper',
          color: 'text.primary',
          padding: SPACING.MD.PX,
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.08)',

          ...sx,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: SPACING.SM.PX,
            marginBottom: SPACING.SM.PX,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <IconButton component="button" onClick={handleClose} size="small">
            <Icon name="close" size={18} />
          </IconButton>
        </Box>
        {children}
      </Box>
    </MUIModal>
  )
}

export default Modal
