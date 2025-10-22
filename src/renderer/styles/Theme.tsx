import CssBaseline from '@mui/material/CssBaseline'
import {
  createTheme,
  type ThemeOptions,
  ThemeProvider,
} from '@mui/material/styles'
import { FONT_SIZES } from './consts'

export const TAB_HEIGHT = '36px' // for some reason all are needed.

// Base theme options shared between light and dark
const baseThemeOptions: ThemeOptions = {
  typography: {
    h1: {
      fontSize: FONT_SIZES.HUGE.PX,
      fontWeight: 900,
    },
    h2: {
      fontSize: FONT_SIZES.LARGE.PX,
      fontWeight: 900,
    },
    h3: {
      fontSize: FONT_SIZES.MEDIUM.PX,
      fontWeight: 900,
    },
    body1: {
      fontSize: FONT_SIZES.MEDIUM.PX,
    },
    body2: {
      fontSize: FONT_SIZES.SMALL.PX,
    },
  },
}

const baseTheme = createTheme(baseThemeOptions)

const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
  //   const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  //   const theme = useMemo(
  //     () => (prefersDarkMode ? darkTheme : lightTheme),
  //     [prefersDarkMode],
  //   )

  return (
    <ThemeProvider theme={baseTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}

export default AppThemeProvider
