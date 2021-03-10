/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useEffect, useRef } from 'react';
import { editor } from 'monaco-editor';
import 'monaco-editor/esm/vs/language/css/monaco.contribution';
import 'monaco-editor/esm/vs/language/json/monaco.contribution';
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution';

globalThis.MonacoEnvironment = {
    getWorker(_, language) {
        if (language === 'typescript') {
            return new Worker(
                new URL('monaco-editor/esm/vs/language/typescript/ts.worker', import.meta.url)
            );
        } else if (language === 'json') {
            return new Worker(
                new URL('monaco-editor/esm/vs/language/json/json.worker', import.meta.url)
            );
        } else if (language === 'css') {
            return new Worker(
                new URL('monaco-editor/esm/vs/language/css/css.worker', import.meta.url)
            );
        } else {
            return new Worker(
                new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url)
            );
        }
    },
};

export interface EditorProps extends editor.IStandaloneEditorConstructionOptions {
    className?: string;
    style?: React.CSSProperties;
}

const defaultEditorStyle: React.CSSProperties = { width: '100%', height: '100%' };

export const Editor = React.memo<EditorProps>(function Editor(options) {
    const editorRef = useRef<editor.IStandaloneCodeEditor>();
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const layoutEditor = () => editorRef.current?.layout();
        window.addEventListener('resize', layoutEditor);
        editorRef.current = editor.create(rootRef.current!, options);

        return () => {
            window.removeEventListener('resize', layoutEditor);
            editorRef.current!.dispose();
            editorRef.current = undefined;
        };
    }, [options]);

    return <div className={options.className} style={options.style ?? defaultEditorStyle} ref={rootRef} />;
});
