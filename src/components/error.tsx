import { st, classes } from "./error.st.css";


export interface ErrorProps {
  className?: string;
}

export const Error: React.VFC<ErrorProps> = (
  {
    className,
  }
) => {

  const resetHistoryState = () => {
    history.replaceState(undefined, window.name, '#')
    window.location.reload()
  }
  
  return (
    <div className={st(classes.root, className)}>
      <h1 className={classes.title}>
        We can not resolve your URL 😔
      </h1>
      <a className={classes.link} onClick={resetHistoryState}>
        Start over
      </a>
    </div>
  )
}