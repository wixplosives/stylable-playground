import Editor from '@monaco-editor/react';
import { useEffect } from 'react';
import { FileExplorer } from './file-explorer';
import { Header } from './header';
import { Pane } from './pane';
import { DiagnosticsList } from './diagnostics-list';
import { st, classes } from './app.st.css';

import { resizeEditor } from '../lib/resize-editor';
import { useForceUpdate } from '../lib/use-force-update';
import type { AppModel } from '../lib/app-model';
import { useColorTheme } from '../lib/use-color-theme';

export interface AppProps {
    className?: string;
    model: AppModel;
}

export const App: React.FC<AppProps> = ({ className, model }) => {
    const {
        files,
        selected,
        setSelected,
        addFile,
        removeFile,
        updateSelected,
        meta,
        formattedMeta: printedMeta,
        formattedOutput,
        diagnostics,
    } = model;
    const { theme, themeClassName } = useColorTheme()
    const forceUpdate = useForceUpdate();
    const editorTheme = theme === 'dark' ? 'vs-dark' : 'light'

    useEffect(() => {
        model.onChange = forceUpdate;
        return () => {
            model.onChange = undefined;
        };
    });

    return (
        <main className={st(classes.root, className, themeClassName)}>
            <Header className={classes.header} />
            <FileExplorer
                filePaths={Object.keys(files)}
                onSelect={setSelected}
                onRemove={removeFile}
                onAddFile={addFile}
                selected={selected}
                className={classes.fileExplorer}
            />
            <section className={classes.editors}>
                <Pane title="Source" className={classes.source}>
                    <Editor
                        value={files[selected]}
                        onChange={(value) => updateSelected(value)}
                        language={selected.endsWith('.st.css') ? 'css' : 'javascript'}
                        options={{ minimap: { enabled: false }, scrollBeyondLastLine: false }}
                        onMount={resizeEditor}
                        theme={editorTheme}
                    />
                </Pane>
                <Pane title="Target" className={classes.target}>
                    <Editor
                        value={formattedOutput}
                        theme={editorTheme}
                        language="css"
                        options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                        }}
                        onMount={resizeEditor}
                    />
                </Pane>
                <Pane title="Meta" className={classes.ast}>
                    <Editor
                        value={printedMeta}
                        theme={editorTheme}
                        language="json"
                        options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                        }}
                        onMount={resizeEditor}
                    />
                </Pane>
                <Pane title="Diagnostics" className={classes.diagnostics}>
                    <DiagnosticsList diagnostics={diagnostics} meta={meta} />
                </Pane>
            </section>
        </main>
    );
};
