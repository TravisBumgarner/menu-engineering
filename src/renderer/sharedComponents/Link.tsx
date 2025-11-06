import { Link as MUILink } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

const Link = ({ to, children }: { to: string; children: React.ReactNode }) => {
  return (
    <MUILink component={RouterLink} to={to}>
      {children}
    </MUILink>
  )
}

export default Link
