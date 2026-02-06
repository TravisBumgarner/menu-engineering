import { Box } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import Navigation from './components/Navigation'
import RecentItemsSidebar from './components/RecentItemsSidebar'
import Router from './components/Router'
import useShowChangelog from './hooks/useShowChangelog'
import './internationalization' // Initialize i18n
import RenderModal from './sharedComponents/Modal'
import { SPACING } from './styles/consts'
import AppThemeProvider from './styles/Theme'

const queryClient = new QueryClient()

function App() {
  useShowChangelog()

  return (
    <>
      <Navigation />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            flex: 1,
            padding: SPACING.MD.PX,
            overflow: 'auto',
          }}
        >
          <Router />
        </Box>
        <RecentItemsSidebar />
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
