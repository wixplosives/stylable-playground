import type { IDirectoryContents } from '@file-services/types';
import { createCjsModuleSystem } from '@file-services/commonjs';
import { createMemoryFs } from '@file-services/memory';
import { noCollisionNamespace, Stylable } from '@stylable/core';
import React, { useState } from 'react';

import { st, classes } from './app.st.css';
import { Header } from './header';

import Editor, { ControlledEditor } from '@monaco-editor/react';
import { FileExplorer } from './file-explorer/file-explorer';

const file1 = '/index.st.css';
const file2 = '/base.st.css';
const file3 = '/other.st.css';
const data: IDirectoryContents = {
    [file1]: `:import {
    -st-from: './base.st.css';
    -st-default: Comp;
}
.root {
    -st-extends: Comp;
    color: value(green); 
}
.root::part {
    color: gold;
}
`,
    [file2]: `.root {}
.part {}
`,
    [file3]: ``,
};
const fs = createMemoryFs(data);
const moduleSystem = createCjsModuleSystem({ fs });

const stylable = new Stylable(
    '/',
    fs,
    moduleSystem.requireModule,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    noCollisionNamespace()
);

export interface AppProps {
    className?: string;
}

export const App: React.FC<AppProps> = ({ className }) => {
    function removeFile(filePath: string) {
        const fileList = Object.keys(files);
        if (fileList.length > 1) {
            if (currentFilePath === filePath) {
                if (fileList[0] === filePath) {
                    setCurrentFilePath(fileList[1]);
                } else {
                    setCurrentFilePath(fileList[0]);
                }
            }

            delete files[filePath];
            setFiles({ ...files });
        } else {
            alert('cannot delete last remaining file');
        }
    }

    function addFile(fileName: string) {
        const filePath = `/${fileName}`;

        if (!files[filePath]) {
            fs.writeFileSync(filePath, '');
            setFiles({ ...files, [filePath]: '' });
        }
    }

    const [files, setFiles] = useState<IDirectoryContents>(data);
    const [currentFilePath, setCurrentFilePath] = useState<string>(file1);

    const meta = stylable.process(currentFilePath);
    stylable.createTransformer().transform(meta);

    const diagnostics = meta.diagnostics.reports
        .concat(meta.transformDiagnostics?.reports || [])
        .map((r, i) => <li key={i}>{`${meta.source} - ${r.type} - ${r.message}`}</li>);

    return (
        <main className={st(classes.root, className)}>
            <Header className={classes.header} />

            <FileExplorer
                filePaths={Object.keys(files)}
                onSelect={(evt) => {
                    const filePath = `/${evt.currentTarget.textContent as string}`;

                    setCurrentFilePath(filePath);
                }}
                onRemove={(evt) => {
                    const filePath = `/${
                        (evt.currentTarget.previousElementSibling as HTMLButtonElement)
                            .textContent as string
                    }`;

                    removeFile(filePath);
                }}
                onAddFile={addFile}
                selected={currentFilePath}
                className={classes.fileExplorer}
            />
            <div className={classes.source}>
                <h2 className={classes.cardTitle}>Source:</h2>
                <ControlledEditor
                    value={files[currentFilePath] as string}
                    onChange={(_evt, val = '') => {
                        fs.writeFileSync(currentFilePath, val || '');
                        setFiles({ ...files, [currentFilePath]: val });
                    }}
                    language="css"
                    options={{ minimap: { enabled: false } }}
                />
            </div>
            <div className={classes.target}>
                <h2 className={classes.cardTitle}>Target:</h2>
                <Editor
                    value={meta.outputAst?.toString()}
                    language="css"
                    options={{ readOnly: true, minimap: { enabled: false } }}
                />
            </div>
            <div className={classes.ast}>
                <h2 className={classes.cardTitle}>Meta & AST:</h2>
                <Editor
                    value={JSON.stringify(meta, null, 2)}
                    language="json"
                    options={{ readOnly: true, minimap: { enabled: false } }}
                />
            </div>
            <div className={classes.diagnostics}>
                <h2 className={classes.cardTitle}>Diagnostics:</h2>
                <ul>{diagnostics}</ul>
            </div>
        </main>
    );
};
