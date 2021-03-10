declare module '*.st.css' {
    const stylesheet: import('@stylable/runtime').RuntimeStylesheet;
    export = stylesheet;
}

declare module '*.png' {
    const urlToFile: string;
    export default urlToFile;
}

declare module '*.jpg' {
    const urlToFile: string;
    export default urlToFile;
}

declare module '*.jpeg' {
    const urlToFile: string;
    export default urlToFile;
}

declare module '*.gif' {
    const urlToFile: string;
    export default urlToFile;
}

declare module '*.svg' {
    const urlToFile: string;
    export default urlToFile;
}

// eslint-disable-next-line no-var
declare var MonacoEnvironment: import('monaco-editor').Environment;

