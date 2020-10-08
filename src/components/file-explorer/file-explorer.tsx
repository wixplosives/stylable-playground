import React, { MouseEventHandler, useState } from 'react';
import { st, classes } from './file-explorer.st.css';

export interface FileExplorerProps {
    filePaths: string[];
    onSelect: MouseEventHandler<HTMLButtonElement>;
    onRemove: MouseEventHandler<HTMLButtonElement>;
    onAddFile: (filePath: string) => void;
    selected: string;
    className?: string;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
    filePaths: files,
    onSelect,
    onRemove,
    onAddFile,
    selected,
    className,
}) => {
    const [newFileName, setNewFileName] = useState('');

    const addNewFile = (
        evt:
            | React.MouseEvent<HTMLButtonElement>
            | React.KeyboardEvent<HTMLButtonElement | HTMLInputElement>
    ) => {
        const filePath =
            evt.currentTarget.localName === 'input'
                ? evt.currentTarget.value
                : (evt.currentTarget.previousElementSibling as HTMLInputElement).value;

        if (filePath) {
            onAddFile(filePath);
            setNewFileName('');
        }
    };

    return (
        <div className={st(classes.root, className)}>
            <h2 className={classes.title}>Files:</h2>
            <div className={classes.fileEntries}>
                {files.sort().map((file) => (
                    <div key={file} className={st(classes.fileEntry, { selected: file === selected })}>
                        <button onClick={onSelect} className={classes.label}>
                            {file.slice(1)}
                        </button>
                        <button onClick={onRemove} className={classes.remove}>
                            X
                        </button>
                    </div>
                ))}
            </div>
            <div className={classes.newFileEntry}>
                <input
                    type="text"
                    placeholder="Enter new file name..."
                    value={newFileName}
                    onChange={(evt) => {
                        setNewFileName(evt.target.value);
                    }}
                    onKeyPress={(evt) => {
                        if (evt.key === 'Enter') {
                            addNewFile(evt);
                        }
                    }}
                    className={classes.newFileInput}
                />
                <button
                    onClick={addNewFile}
                    onKeyPress={(evt) => {
                        if (evt.key === 'Enter') {
                            addNewFile(evt);
                        }
                    }}
                    className={classes.addNewFile}
                >
                    +
                </button>
            </div>
        </div>
    );
};
