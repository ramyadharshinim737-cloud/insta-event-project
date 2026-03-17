const typography = {
  // Font sizes
  size: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
  },

  // Font weights
  weight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  // Letter spacing
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
  },

  // Predefined text styles
  styles: {
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 1.2,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 1.3,
      letterSpacing: -0.25,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 1.4,
    },
    body: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 1.5,
    },
    bodyLarge: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 1.5,
    },
    bodySmall: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 1.4,
    },
    captionSmall: {
      fontSize: 10,
      fontWeight: '400' as const,
      lineHeight: 1.4,
    },
    button: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 1.2,
      letterSpacing: 0.25,
    },
    label: {
      fontSize: 12,
      fontWeight: '500' as const,
      lineHeight: 1.2,
    },
  },
};

export default typography;
