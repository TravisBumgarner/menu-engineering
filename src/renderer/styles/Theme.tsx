import { useMediaQuery } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import { createTheme, responsiveFontSizes, type ThemeOptions, ThemeProvider } from '@mui/material/styles'
import { useMemo } from 'react'
import { FONT_SIZES, PALETTE, SPACING } from './consts'

const RobotoFontPath = new URL('../../assets/Roboto-VariableFont_wdth,wght.ttf', import.meta.url).href

export const TAB_HEIGHT = '36px' // for some reason all are needed.

// Base theme options shared between light and dark
const getThemeOptions = (isDark: boolean): ThemeOptions => {
  const colors = {
    // Two-tone: background is tinted, surface (cards/tables) is clean
    background: isDark ? PALETTE.grayscale[900] : PALETTE.grayscale[50],
    surface: isDark ? PALETTE.grayscale[850] : PALETTE.named.white,
    text: {
      primary: isDark ? PALETTE.grayscale[100] : PALETTE.grayscale[800],
      secondary: isDark ? PALETTE.grayscale[400] : PALETTE.grayscale[500],
      tertiary: isDark ? PALETTE.grayscale[300] : PALETTE.grayscale[600],
    },
    border: {
      light: isDark ? PALETTE.grayscale[800] : PALETTE.grayscale[100],
      medium: isDark ? PALETTE.grayscale[700] : PALETTE.grayscale[200],
      dark: isDark ? PALETTE.grayscale[600] : PALETTE.grayscale[300],
    },
    hover: {
      light: isDark ? PALETTE.grayscale[800] : PALETTE.grayscale[50],
      medium: isDark ? PALETTE.grayscale[850] : PALETTE.grayscale[50],
    },
  }

  return {
    typography: {
      fontFamily: 'Roboto, sans-serif',
      h1: {
        fontSize: FONT_SIZES.HUGE.PX,
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontSize: FONT_SIZES.LARGE.PX,
        fontWeight: 600,
        letterSpacing: '-0.01em',
      },
      h3: {
        fontSize: FONT_SIZES.MEDIUM.PX,
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
        letterSpacing: '-0.01em',
      },
      body1: {
        fontSize: FONT_SIZES.MEDIUM.PX,
        lineHeight: 1.6,
      },
      body2: {
        fontSize: FONT_SIZES.SMALL.PX,
        lineHeight: 1.5,
      },
      caption: {
        fontSize: '11px',
        fontWeight: 500,
        letterSpacing: '0.03em',
        textTransform: 'uppercase' as const,
      },
    },
    palette: {
      mode: isDark ? 'dark' : 'light',
      background: {
        default: colors.background,
        paper: colors.surface,
      },
      text: {
        primary: colors.text.primary,
        secondary: colors.text.secondary,
      },
      primary: {
        main: PALETTE.primary[500],
        light: PALETTE.primary[300],
        dark: PALETTE.primary[700],
      },
      error: {
        main: PALETTE.error[500],
        light: PALETTE.error[isDark ? 800 : 100],
        dark: PALETTE.error[700],
        contrastText: isDark ? PALETTE.error[100] : PALETTE.error[900],
      },
      divider: colors.border.light,
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          @font-face {
            font-family: 'Roboto';
            font-style: normal;
            font-display: swap;
            font-weight: 100 900;
            src: url(${RobotoFontPath}) format('truetype');
          }
          body {
            background-color: ${colors.background};
            color: ${colors.text.primary};
          }
          ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: ${colors.border.medium};
            border-radius: 3px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: ${colors.border.dark};
          }
        `,
      },
      MuiTable: {
        styleOverrides: {
          root: {
            borderCollapse: 'separate',
            borderSpacing: 0,
            border: 'none',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: colors.surface,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: 'transparent',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderTop: 'none',
            borderBottom: `1px solid ${colors.border.light}`,
            padding: `${SPACING.XS.PX} ${SPACING.SM.PX}`,
            fontSize: '13px',
            color: colors.text.primary,
          },
          head: {
            backgroundColor: 'transparent',
            fontWeight: 600,
            fontSize: '11px',
            color: colors.text.secondary,
            borderBottom: `1px solid ${colors.border.medium}`,
            padding: `${SPACING.XXS.PX} ${SPACING.SM.PX}`,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          },
          body: {
            color: colors.text.primary,
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'background-color 0.15s ease',
            '&:last-child td': {
              borderBottom: 'none',
            },
            '&:hover': {
              backgroundColor: isDark ? PALETTE.grayscale[800] : PALETTE.grayscale[50],
            },
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderRadius: '8px',
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border.light}`,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '6px',
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '13px',
            padding: `6px ${SPACING.SM.PX}`,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          sizeSmall: {
            padding: `4px ${SPACING.XS.PX}`,
            fontSize: '12px',
          },
          outlined: {
            borderColor: colors.border.medium,
            color: colors.text.primary,
            '&:hover': {
              borderColor: PALETTE.primary[400],
              backgroundColor: isDark ? PALETTE.primary[900] : PALETTE.primary[50],
              color: PALETTE.primary[isDark ? 300 : 600],
            },
          },
          contained: {
            '&:disabled': {
              backgroundColor: colors.border.light,
              color: colors.text.secondary,
            },
          },
          containedPrimary: {
            backgroundColor: PALETTE.primary[500],
            color: PALETTE.named.white,
            '&:hover': {
              backgroundColor: PALETTE.primary[600],
            },
          },
          containedError: {
            backgroundColor: PALETTE.error[500],
            color: PALETTE.named.white,
            '&:hover': {
              backgroundColor: PALETTE.error[600],
            },
          },
          text: {
            color: colors.text.secondary,
            '&:hover': {
              backgroundColor: colors.hover.light,
              color: colors.text.primary,
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: colors.surface,
              borderRadius: '6px',
              fontSize: '13px',
              '& fieldset': {
                borderColor: colors.border.medium,
                borderWidth: '1px',
              },
              '&:hover fieldset': {
                borderColor: colors.border.dark,
              },
              '&.Mui-focused fieldset': {
                borderColor: PALETTE.primary[400],
                borderWidth: '1.5px',
              },
            },
            '& .MuiInputLabel-root': {
              color: colors.text.secondary,
              fontSize: '13px',
              '&.Mui-focused': {
                color: PALETTE.primary[500],
              },
            },
            '& .MuiInputBase-input': {
              color: colors.text.primary,
            },
          },
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: colors.surface,
            },
          },
          listbox: {
            backgroundColor: colors.surface,
            '& .MuiAutocomplete-option': {
              fontSize: '13px',
              color: colors.text.primary,
              '&:hover': {
                backgroundColor: colors.hover.light,
              },
              '&.Mui-focused': {
                backgroundColor: isDark ? PALETTE.primary[800] : PALETTE.primary[50],
              },
            },
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            color: colors.text.primary,
          },
          h1: {
            color: colors.text.primary,
          },
          h2: {
            color: colors.text.primary,
          },
          h3: {
            color: colors.text.primary,
          },
          body2: {
            color: colors.text.secondary,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: colors.text.secondary,
            borderRadius: '6px',
            transition: 'all 0.15s ease',
            '&:hover': {
              backgroundColor: colors.hover.light,
              color: colors.text.primary,
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? PALETTE.grayscale[700] : PALETTE.grayscale[800],
            color: PALETTE.named.white,
            fontSize: '11px',
            fontWeight: 500,
            borderRadius: '4px',
            padding: '4px 8px',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: colors.surface,
            color: colors.text.primary,
            borderRadius: '8px',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            fontSize: '11px',
            height: '24px',
          },
          sizeSmall: {
            height: '22px',
            fontSize: '11px',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: colors.surface,
            borderBottom: `1px solid ${colors.border.light}`,
            borderRadius: 0,
          },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          dense: {
            minHeight: '44px',
            paddingLeft: SPACING.SM.PX,
            paddingRight: SPACING.SM.PX,
          },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            color: PALETTE.primary[isDark ? 400 : 500],
            textDecoration: 'none',
            fontWeight: 500,
            '&:hover': {
              color: PALETTE.primary[isDark ? 300 : 600],
              textDecoration: 'underline',
            },
            '&:visited': {
              color: PALETTE.primary[isDark ? 500 : 600],
            },
            '&:active': {
              color: PALETTE.primary[isDark ? 200 : 700],
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: '4px',
            transition: 'all 0.15s ease',
            '&.Mui-selected': {
              backgroundColor: isDark ? PALETTE.primary[900] : PALETTE.primary[50],
              '&:hover': {
                backgroundColor: isDark ? PALETTE.primary[800] : PALETTE.primary[100],
              },
            },
          },
        },
      },
      MuiTablePagination: {
        styleOverrides: {
          root: {
            fontSize: '12px',
            color: colors.text.secondary,
            borderTop: `1px solid ${colors.border.light}`,
          },
          selectLabel: {
            fontSize: '12px',
          },
          displayedRows: {
            fontSize: '12px',
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: colors.border.light,
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: colors.border.dark,
            '&.Mui-checked': {
              color: PALETTE.primary[500],
            },
          },
        },
      },
    },
  }
}

// Create light and dark themes
const lightTheme = createTheme(getThemeOptions(false))
const darkTheme = createTheme(getThemeOptions(true))

// Apply responsive font sizes
const lightThemeWithResponsiveFonts = responsiveFontSizes(lightTheme)
const darkThemeWithResponsiveFonts = responsiveFontSizes(darkTheme)

const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const theme = useMemo(
    () => (prefersDarkMode ? darkThemeWithResponsiveFonts : lightThemeWithResponsiveFonts),
    [prefersDarkMode],
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}

// Export themes for external use
export { darkThemeWithResponsiveFonts as darkTheme, lightThemeWithResponsiveFonts as lightTheme }

export default AppThemeProvider
