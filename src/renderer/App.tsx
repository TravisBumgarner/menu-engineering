import { Box } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import Navigation from './components/Navigation'
import Router from './components/Router'
import './internationalization' // Initialize i18n
import RenderModal from './sharedComponents/Modal'
import { SPACING } from './styles/consts'
import AppThemeProvider from './styles/Theme'

const queryClient = new QueryClient()

function App() {
  return (
    <>
      <Navigation />
      <Box
        sx={{
          padding: SPACING.SMALL.PX,
          height: '100%',
          paddingBottom: '20px', // Lazy way to ensure content is visible.
        }}
      >
        <Router />
      </Box>
      <RenderModal />
    </>
  )
}

const WrappedApp = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <MemoryRouter>
        <AppThemeProvider>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </AppThemeProvider>
      </MemoryRouter>
    </Box>
  )
}

export default WrappedApp
