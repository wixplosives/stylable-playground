import { createCjsModuleSystem } from '@file-services/commonjs';
import { createMemoryFs } from '@file-services/memory';
import {
    Diagnostic,
    noCollisionNamespace,
    Stylable,
    StylableExports,
    StylableMeta,
} from '@stylable/core';
import Editor from '@monaco-editor/react';
import React, { useCallback, useEffect, useState } from 'react';
import { JSONCrush, JSONUncrush } from '../json-crush';
import { FileExplorer } from './file-explorer/file-explorer';
import { Header } from './header';
import { st, classes } from './app.st.css';

const DEFAULT_EXT = '.st.css';

export interface AppProps {
    className?: string;
    model: AppModel;
}

interface URLState {
    files: Record<string, string>;
    selected: string;
}

export class AppModel {
    fs = createMemoryFs();
    moduleSystem = createCjsModuleSystem({ fs: this.fs });
    stylable = Stylable.create({
        projectRoot: '/',
        fileSystem: this.fs,
        requireModule: (id) => {
            this.moduleSystem.loadedModules.clear();
            return this.moduleSystem.requireModule(id);
        },
        resolveNamespace: noCollisionNamespace(),
    });
    files: Record<string, string> = {};
    selected = '';
    meta?: StylableMeta;
    jsExports?: StylableExports;
    diagnostics: Omit<Diagnostic, 'node' | 'options'>[] = [];
    onChange? = (): void => undefined;
    private _onChangeId?: number = undefined;
    constructor() {
        const searchParams = new URLSearchParams(document.location.hash.slice(1));
        const state = searchParams.get('state');
        const { files, selected } = state
            ? (JSON.parse(JSONUncrush(decodeURIComponent(state))) as URLState)
            : createSampleData();
        this.fs.populateDirectorySync('/', files);
        this.files = files;
        this.setSelected(selected || Object.keys(files)[0]);
    }
    private _onChange = (): void => {
        if (this._onChangeId === undefined) {
            this._onChangeId = requestAnimationFrame(() => {
                this._onChangeId = undefined;
                this.updateHash();
                this.onChange?.();
            });
        }
    };
    updateHash(): void {
        const searchParams = new URLSearchParams();
        searchParams.set(
            'state',
            JSONCrush(JSON.stringify({ files: this.files, selected: this.selected }))
        );
        document.location.hash = searchParams.toString();
    }
    addFile = (fileName: string): void => {
        const filePath = getFilePathFromUserInput(fileName, this.fs.extname(fileName));
        if (!this.files[filePath]) {
            this.fs.writeFileSync(filePath, '');
            this.files[filePath] = '';
            this.setSelected(filePath);
        }
    };
    removeFile = (filePath: string): void => {
        delete this.files[filePath];
        this.fs.removeSync(filePath);
        if (!this.files[this.selected]) {
            const names = Object.keys(this.files);
            if (names.length === 0) {
                const fileName = 'playground.st.css';
                this.addFile(fileName);
                this.setSelected('/' + fileName);
            } else {
                this.setSelected(names[0]);
            }
        } else {
            this._onChange();
        }
    };
    setSelected = (filePath: string): void => {
        this.selected = filePath;
        if (this.selected.endsWith('.st.css')) {
            try {
                const { exports, meta } = this.stylable.transform(
                    this.files[this.selected],
                    this.selected
                );
                this.meta = meta;
                this.jsExports = exports;
                this.diagnostics = this.meta.diagnostics.reports.concat(
                    this.meta.transformDiagnostics?.reports || []
                );
            } catch (e) {
                this.meta = undefined;
                this.jsExports = undefined;
                this.diagnostics = [{ type: 'error', message: String(e) }];
            }
        } else {
            this.meta = undefined;
            this.jsExports = undefined;
            this.diagnostics = [];
        }
        this._onChange();
    };
    updateSelected = (value = ''): void => {
        this.fs.writeFileSync(this.selected, value);
        this.files[this.selected] = value;
        this.setSelected(this.selected);
    };
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
        jsExports,
    } = model;
    const forceUpdate = useForceUpdate();

    useEffect(() => {
        model.onChange = forceUpdate;
        return () => {
            model.onChange = undefined;
        };
    });

    return (
        <main className={st(classes.root, className)}>
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
                <div className={classes.source}>
                    <h2 className={classes.editorTitle}>Source:</h2>
                    <div>
                        <Editor
                            value={files[selected]}
                            onChange={(_, value) => updateSelected(value)}
                            language={selected.endsWith('.st.css') ? 'css' : 'javascript'}
                            options={{ minimap: { enabled: false }, scrollBeyondLastLine: false }}
                            onMount={resizeEditor}
                        />
                    </div>
                </div>
                <div className={classes.target}>
                    <h2 className={classes.editorTitle}>Target:</h2>
                    <div>
                        <Editor
                            value={formatOutput(meta, jsExports)}
                            language="css"
                            options={{
                                readOnly: true,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                            }}
                            onMount={resizeEditor}
                        />
                    </div>
                </div>
                <div className={classes.ast}>
                    <h2 className={classes.editorTitle}>Meta & AST:</h2>
                    <div>
                        <Editor
                            value={JSON.stringify(cleanMeta(meta), null, 2)}
                            language="json"
                            options={{
                                readOnly: true,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                            }}
                            onMount={resizeEditor}
                        />
                    </div>
                </div>
                <div className={classes.diagnostics}>
                    <h2 className={classes.editorTitle}>Diagnostics:</h2>
                    <div>
                        <ul>
                            {model.diagnostics.map(({ type, message }, i) => (
                                <li key={i}>{`${
                                    model.meta?.source ?? ''
                                } - ${type} - ${message}`}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>
        </main>
    );
};

function formatOutput(meta?: StylableMeta, exports?: StylableExports) {
    const css = meta?.outputAst?.toString() ?? '';
    if (exports && Object.keys(exports).length) {
        return String(css) + `\n/*\nJavascript Exports:\n${JSON.stringify(exports, null, 4)}\n*/`;
    }
    return css;
}

function cleanMeta(meta?: StylableMeta) {
    const { ast, outputAst, rawAst, parent, ...cleanMeta } = meta || {};
    return cleanMeta;
}

function resizeEditor(_: unknown, editor: { getContainerDomNode(): HTMLElement; layout(): void }) {
    // work around monaco resize by setting the container overflow to hidden then calc content size and reset the overflow
    // this function relies in the structure of the editor container
    const resize = () => {
        try {
            const el = editor.getContainerDomNode().parentElement?.parentElement as HTMLElement;
            el.style.setProperty('overflow', 'hidden');
            editor.layout();
            el.style.setProperty('overflow', null);
        } catch {
            window.removeEventListener('resize', resize);
        }
    };
    window.addEventListener('resize', resize);
}

function createSampleData() {
    const file1 = '/index.st.css';
    const file2 = '/button.st.css';
    const file3 = '/project.st.css';
    const files: Record<string, string> = {
        [file1]: `:import {
    -st-from: './project.st.css';
    -st-named: active, danger;
}
:import {
    -st-from: './button.st.css';
    -st-default: Button;
}
.root {}

.okButton {
    -st-extends: Button;
    color: value(activ); 
}

.okButton::label {
    font-size: 1.5em;
}

.cancelButton {
    -st-extends: Button;
    color: value(danger); 
}
`,
        [file2]: `.root {}
.label {}
.icon {}
`,
        [file3]: `:vars {
    active: green;
    danger: red;
}`,
    };
    return { files, selected: file1 };
}

function getFilePathFromUserInput(fileName: string, ext: string) {
    if (!ext) {
        return `/${fileName}${DEFAULT_EXT}`;
    } else if (ext === '.') {
        return `/${fileName.slice(-1)}${DEFAULT_EXT}`;
    } else {
        return `/${fileName}`;
    }
}

function useForceUpdate(): () => void {
    const [, dispatch] = useState(Object.create(null));
    const memoizedDispatch = useCallback((): void => dispatch(Object.create(null)), [dispatch]);
    return memoizedDispatch;
}
