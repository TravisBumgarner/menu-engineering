import { Box } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import Navigation from './components/Navigation'
import Router from './components/Router'
import './internationalization' // Initialize i18n
import RenderModal from './sharedComponents/Modal'
import AppThemeProvider from './styles/Theme'

const queryClient = new QueryClient()

function App() {
  return (
    <>
      <Navigation />
      <Router />
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
