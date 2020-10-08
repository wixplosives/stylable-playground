import React from 'react';
import { st, classes } from './header.st.css';
import stylableLogo from '../assets/stylable.svg';

export interface HeaderProps {
    className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className }) => {
    return (
        <header className={st(classes.root, className)}>
            <h1 className={classes.title}>
                <img className={classes.icon} src={stylableLogo} width={25} height={25} alt="stylable logo" />
                Stylable Playground
            </h1>
        </header>
    );
};
