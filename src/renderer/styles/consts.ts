export const PALETTE = {
  named: {
    white: 'hsl(0 0% 100%)',
    black: 'hsl(0 0% 0%)',
  },
  // Warm-tinted grays for a softer, more inviting feel
  grayscale: {
    50: 'hsl(240 5% 96%)',
    100: 'hsl(240 4% 93%)',
    200: 'hsl(240 4% 85%)',
    300: 'hsl(240 3% 74%)',
    400: 'hsl(240 2% 58%)',
    500: 'hsl(240 2% 46%)',
    600: 'hsl(240 3% 37%)',
    700: 'hsl(240 4% 26%)',
    800: 'hsl(240 5% 16%)',
    850: 'hsl(240 6% 12%)',
    900: 'hsl(240 7% 8%)',
  },
  // Slightly desaturated purple - more refined
  primary: {
    50: 'hsla(260, 60%, 97%, 1.00)',
    100: 'hsla(260, 55%, 93%, 1.00)',
    200: 'hsla(260, 50%, 83%, 1.00)',
    300: 'hsla(260, 48%, 68%, 1.00)',
    400: 'hsla(260, 50%, 58%, 1.00)',
    500: 'hsla(260, 52%, 50%, 1.00)',
    600: 'hsla(260, 55%, 42%, 1.00)',
    700: 'hsla(260, 58%, 34%, 1.00)',
    800: 'hsla(260, 60%, 24%, 1.00)',
    850: 'hsla(260, 62%, 18%, 1.00)',
    900: 'hsla(260, 65%, 12%, 1.00)',
  },
  secondary: {
    50: 'hsla(200, 50%, 97%, 1.00)',
    100: 'hsla(200, 45%, 91%, 1.00)',
    200: 'hsla(200, 42%, 80%, 1.00)',
    300: 'hsla(200, 40%, 66%, 1.00)',
    400: 'hsla(200, 42%, 54%, 1.00)',
    500: 'hsla(200, 44%, 44%, 1.00)',
    600: 'hsla(200, 46%, 36%, 1.00)',
    700: 'hsla(200, 48%, 28%, 1.00)',
    800: 'hsla(200, 50%, 20%, 1.00)',
    850: 'hsla(200, 52%, 15%, 1.00)',
    900: 'hsla(200, 55%, 10%, 1.00)',
  },
  error: {
    50: 'hsla(4, 60%, 97%, 1.00)',
    100: 'hsla(4, 55%, 91%, 1.00)',
    200: 'hsla(4, 50%, 82%, 1.00)',
    300: 'hsla(4, 48%, 68%, 1.00)',
    400: 'hsla(4, 50%, 58%, 1.00)',
    500: 'hsla(4, 52%, 48%, 1.00)',
    600: 'hsla(4, 55%, 40%, 1.00)',
    700: 'hsla(4, 58%, 32%, 1.00)',
    800: 'hsla(4, 60%, 24%, 1.00)',
    850: 'hsla(4, 62%, 18%, 1.00)',
    900: 'hsla(4, 65%, 14%, 1.00)',
  },
}

export const FONT_SIZES = {
  SMALL: {
    PX: '13px',
    INT: 13,
  },
  MEDIUM: {
    PX: '14px',
    INT: 14,
  },
  LARGE: {
    PX: '20px',
    INT: 20,
  },
  HUGE: {
    PX: '28px',
    INT: 28,
  },
  HUGE_PLUS: {
    PX: '36px',
    INT: 36,
  },
}

export const SPACING = {
  NONE: {
    PX: '0px',
    INT: 0,
  },
  XXXS: {
    PX: '4px',
    INT: 4,
  },
  XXS: {
    PX: '8px',
    INT: 8,
  },
  XS: {
    PX: '12px',
    INT: 12,
  },
  SM: {
    PX: '16px',
    INT: 16,
  },
  MD: {
    PX: '24px',
    INT: 24,
  },
  LG: {
    PX: '32px',
    INT: 32,
  },
  XL: {
    PX: '40px',
    INT: 40,
  },
  XXL: {
    PX: '48px',
    INT: 48,
  },
  XXXL: {
    PX: '64px',
    INT: 64,
  },
  // Legacy aliases for backward compatibility
  TINY: {
    PX: '4px',
    INT: 4,
  },
  SMALL: {
    PX: '12px',
    INT: 12,
  },
  MEDIUM: {
    PX: '24px',
    INT: 24,
  },
  LARGE: {
    PX: '32px',
    INT: 32,
  },
  HUGE: {
    PX: '48px',
    INT: 48,
  },
} as const

export const Z_INDICES = {
  MODAL: 500,
}

export const FORMATTING = {
  /** Number of decimal places for currency/cost display */
  COST_DECIMAL_PLACES: 4,
} as const
