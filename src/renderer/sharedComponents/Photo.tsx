import { Box, Modal, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { CHANNEL } from '../../shared/messages.types'
import { QUERY_KEYS } from '../consts'
import ipcMessenger from '../ipcMessenger'

export const uint8ArrayToObjectUrl = (bytes: Uint8Array, mime = 'image/jpeg') => {
  const copy = new Uint8Array(bytes) // forces ArrayBuffer
  const blob = new Blob([copy], { type: mime })
  return URL.createObjectURL(blob)
}

type LocalPhoto = {
  data: File
  type: 'local'
}

type BackendPhoto = {
  src: string
  type: 'backend'
}

const THUMBNAIL_SIZE = '100px'

const imgStyle: React.CSSProperties = {
  display: 'block',
  maxWidth: THUMBNAIL_SIZE,
  maxHeight: THUMBNAIL_SIZE,
  objectFit: 'cover',
  borderRadius: '4px',
  cursor: 'pointer',
}

const Lightbox = ({ src, onClose }: { src: string; onClose: () => void }) => {
  return (
    <Modal open onClose={onClose} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <img
        src={src}
        alt="Final dish"
        style={{
          maxWidth: '80vw',
          maxHeight: '80vh',
          objectFit: 'contain',
          borderRadius: '8px',
          outline: 'none',
        }}
      />
    </Modal>
  )
}

const LocalPhoto = (props: { data: File }) => {
  const [open, setOpen] = useState(false)
  const url = URL.createObjectURL(props.data)

  return (
    <>
      <img src={url} alt="Final dish" style={imgStyle} onClick={() => setOpen(true)} />
      {open && <Lightbox src={url} onClose={() => setOpen(false)} />}
    </>
  )
}

const BackendPhoto = (props: { src: string }) => {
  const [open, setOpen] = useState(false)
  const { data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEYS.PHOTO, props.src],
    queryFn: async () => {
      const response = await ipcMessenger.invoke(CHANNEL.FILES.GET_PHOTO, { fileName: props.src })
      return response.data ? uint8ArrayToObjectUrl(response.data) : null
    },
  })

  if (isLoading) {
    return (
      <Box sx={{ width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">...</Typography>
      </Box>
    )
  }

  if (isError || !data) {
    return null
  }

  return (
    <>
      <img src={data} alt="Final dish" style={imgStyle} onClick={() => setOpen(true)} />
      {open && <Lightbox src={data} onClose={() => setOpen(false)} />}
    </>
  )
}

const Photo = (props: LocalPhoto | BackendPhoto) => {
  if (props.type === 'local') {
    return <LocalPhoto data={props.data} />
  } else if (props.type === 'backend') {
    return <BackendPhoto src={props.src} />
  }
  return null
}

export default Photo
