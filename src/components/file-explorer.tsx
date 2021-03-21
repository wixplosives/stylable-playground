import React, { useRef, useState } from 'react';
import { st, classes } from './file-explorer.st.css';

export interface FileExplorerProps {
    filePaths: string[];
    onSelect: (filePath: string) => void;
    onRemove: (filePath: string) => void;
    onAddFile: (filePath: string) => void;
    selected: string;
    className?: string;
}

function bindKey(key: string, action: () => void) {
    return (evt: React.KeyboardEvent<HTMLInputElement>) => {
        if (evt.key === key) {
            action();
        }
    };
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
    filePaths: files,
    onSelect,
    onRemove,
    onAddFile,
    selected,
    className,
}) => {
    const newFileInput = useRef<HTMLInputElement>(null);

    const addNewFile = () => {
        if (newFileInput.current?.value) {
            onAddFile(newFileInput.current.value);
            newFileInput.current.value = '';
        }
    };

    const [markedForDeletion, updateMarkedForDeletion] = useState<string>(``);

    const onRemoveClick = (file: string) => {
        if (markedForDeletion === file) {
            updateMarkedForDeletion(``);
            onRemove(file);
        } else {
            updateMarkedForDeletion(file);
        }
    };

    return (
        <div className={st(classes.root, className)}>
            <h2 className={classes.title}>Files:</h2>
            <div className={classes.fileEntries}>
                {files.sort().map((file) => {
                    const promptDelete = markedForDeletion === file;
                    return (
                        <div
                            key={file}
                            className={st(classes.fileEntry, {
                                selected: file === selected,
                                markedForDeletion: promptDelete,
                            })}
                        >
                            <button onClick={() => onSelect(file)} className={classes.label}>
                                {file.slice(1)}
                            </button>
                            {promptDelete ? (
                                <button
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        updateMarkedForDeletion(``);
                                    }}
                                    className={classes.cancelRemove}
                                >
                                    {`❌`}
                                </button>
                            ) : null}
                            <button
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onRemoveClick(file);
                                }}
                                className={classes.remove}
                            >
                                {markedForDeletion !== file ? `🗑️` : `✔️`}
                            </button>
                        </div>
                    );
                })}
            </div>
            <div className={classes.newFileEntry}>
                <input
                    ref={newFileInput}
                    type="text"
                    placeholder="Enter new file name..."
                    onKeyPress={bindKey('Enter', addNewFile)}
                    className={classes.newFileInput}
                />
                <button onClick={addNewFile} className={classes.addNewFile}>
                    +
                </button>
            </div>
        </div>
    );
};
