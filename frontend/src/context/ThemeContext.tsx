import React, { createContext, useState, useContext } from 'react';
import { Appearance } from 'react-native';
import colors from '../theme/colors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';
import shadows from '../theme/shadows';
import animations from '../theme/animations';

interface ThemeContextType {
  isDark: boolean;
  colors: typeof colors.light;
  typography: typeof typography;
  spacing: typeof spacing;
  shadows: typeof shadows;
  animations: typeof animations;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: colors.light,
  typography,
  spacing,
  shadows,
  animations,
  toggleTheme: () => { },
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const colorScheme = Appearance.getColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === 'dark');

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        colors: themeColors,
        typography,
        spacing,
        shadows,
        animations,
        toggleTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

