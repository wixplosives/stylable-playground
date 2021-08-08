import { useEffect, useState } from 'react';
import { classes } from '../components/app.st.css';

const mediaDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

export function useColorTheme(): { theme: 'dark' | 'light'; themeClassName: string } {
    const [theme, setTheme] = useState<'dark' | 'light'>(
        mediaDarkScheme.matches ? 'dark' : 'light'
    );

    useEffect(() => {
        const callback = (e: MediaQueryListEvent) => {
            setTheme(e.matches ? 'dark' : 'light');
        };

        mediaDarkScheme.addEventListener('change', callback);

        return () => {
            mediaDarkScheme.removeEventListener('change', callback);
        };
    }, []);

    return {
        theme,
        themeClassName: classes[`${theme}Theme`],
    };
}
