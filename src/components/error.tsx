import { st, classes } from "./error.st.css";


export interface ErrorProps {
  className?: string;
}

export const Error: React.VFC<ErrorProps> = (
  {
    className,
  }
) => (
  <div className={st(classes.root, className)}>
    <h1 className={classes.title}>
      We can not resolve your URL 😔
    </h1>
    <a className={classes.link} href='/'>
      Start over
    </a>
  </div>
)