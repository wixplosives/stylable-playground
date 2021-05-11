import type React from 'react';
import { st, classes } from './pane.st.css';

export function Pane({
    children,
    className,
    title,
}: {
    title: string;
    children: React.ReactChild;
    className: string;
}): React.ReactElement {
    return (
        <div className={st(classes.root, className)}>
            <h2 className={classes.title}>{title}:</h2>
            <div className={classes.container}>{children}</div>
        </div>
    );
}
