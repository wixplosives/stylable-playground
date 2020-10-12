import React, { useRef } from 'react';
import { st, classes } from './file-explorer.st.css';

export interface FileExplorerProps {
    filePaths: string[];
    onSelect: (filePath: string) => void; //MouseEventHandler<HTMLButtonElement>;
    onRemove: (filePath: string) => void; //MouseEventHandler<HTMLButtonElement>;
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

    return (
        <div className={st(classes.root, className)}>
            <h2 className={classes.title}>Files:</h2>
            <div className={classes.fileEntries}>
                {files.sort().map((file) => (
                    <div
                        key={file}
                        className={st(classes.fileEntry, { selected: file === selected })}
                    >
                        <button onClick={() => onSelect(file)} className={classes.label}>
                            {file.slice(1)}
                        </button>
                        <button onClick={() => onRemove(file)} className={classes.remove}>
                            X
                        </button>
                    </div>
                ))}
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
