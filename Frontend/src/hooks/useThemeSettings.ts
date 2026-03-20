import { useEffect } from 'react';

export const useThemeSettings = (isDark: boolean, isRounded: boolean) => {
  useEffect(() => {
    const root = document.documentElement;

    // Тема
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Скругление
    if (isRounded) {
      root.classList.add('roundedCustom'); // Проверьте, что в tailwind.config.js или CSS есть этот класс
    } else {
      root.classList.remove('roundedCustom');
    }
  }, [isDark, isRounded]);
};