import { st, classes } from './header.st.css';
import stylableLogo from '../assets/stylable.svg';
import { useEffect, useState } from 'react';

export interface HeaderProps {
    className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className }) => {
    const [isCopied, setIsCopied] = useState(false)

    const onShareClick = async () => {
        const url = window.location.href;

        if ('share' in navigator) {
            await navigator.share({
                url,
                title: 'Stylable Playground',
                text: 'A code playground for testing out Stylable'
            })
        } else if ('clipboard' in navigator) {
            await navigator.clipboard.writeText(url)
            setIsCopied(true)
        } else {
            prompt(url)
        }
    }

    useEffect(() => {
        if (isCopied) {
            setTimeout(() => {
                setIsCopied(false)
            }, 1500);
        }
    }, [isCopied])

    return (
        <header className={st(classes.root, className)}>
            <h1 className={classes.title}>
                <img
                    className={classes.icon}
                    src={stylableLogo}
                    width={25}
                    height={25}
                    alt="stylable logo"
                />
                Stylable Playground
            </h1>
            <div className={classes.buttonContainer}>
                <button
                    className={st(classes.button, { isCopied })}
                    onClick={onShareClick}
                >
                    {
                        isCopied ? 'Copied!' : 'Share'
                    }
                </button>
            </div>
        </header>
    );
};
