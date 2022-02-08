import { st, classes } from './error.st.css';
export interface ErrorProps {
    className?: string;
    onCloseError: () => void;
}

export const ErrorView: React.VFC<ErrorProps> = ({ className, onCloseError }) => (
    <div className={st(classes.root, className)}>
        <h1 className={classes.title}>We can not resolve your URL 😔</h1>
        <a className={classes.link} onClick={onCloseError}>
            Close
        </a>
    </div>
);
