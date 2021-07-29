import { useEffect, useState } from 'react';
import { classes } from '../components/app.st.css'

export function useColorTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  
  useEffect(() => {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      setTheme(e.matches ? "dark" : "light")
    });
  }, [])

  return {
    theme,
    themeClassName: classes[`${theme}Theme`]
  }
}