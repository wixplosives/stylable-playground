import { createCjsModuleSystem } from '@file-services/commonjs';
import { createMemoryFs } from '@file-services/memory';
import * as StylableCore from '@stylable/core';
import {
    Diagnostic,
    noCollisionNamespace,
    Stylable,
    StylableExports,
    StylableMeta,
} from '@stylable/core';
import { JSONCrush, JSONUncrush } from '../json-crush';
import { createSampleData } from './create-sample-data';

interface URLState {
    files: Record<string, string>;
    selected: string;
}

export class AppModel {
    fs = createMemoryFs();
    error?: Error;
    moduleSystem = createCjsModuleSystem({ fs: this.fs });
    stylable = Stylable.create({
        projectRoot: '/',
        fileSystem: this.fs,
        requireModule: (id) => {
            this.moduleSystem.loadedModules.clear();
            this.moduleSystem.loadedModules.set('@stylable/core', {
                filename: '@stylable/core',
                id: '@stylable/core',
                exports: StylableCore,
            });
            return this.moduleSystem.requireModule(id);
        },
        resolveNamespace: noCollisionNamespace(),
    });
    files: Record<string, string> = {};
    selected = '';
    meta?: StylableMeta;
    formattedMeta = '{}';
    formattedOutput = '';
    jsExports?: StylableExports;
    diagnostics: Omit<Diagnostic, 'node' | 'options'>[] = [];
    onChange? = (): void => undefined;
    private _onChangeId?: number = undefined;
    constructor() {
        const searchParams = new URLSearchParams(document.location.hash.slice(1));
        const stateParam = searchParams.get('state');
        let state;

        if (stateParam) {
            try {
                state = JSON.parse(JSONUncrush(decodeURIComponent(stateParam))) as URLState;
            } catch (error) {
                this.error = error as Error;
            }
        }

        if (!state) {
            state = createSampleData();
        }

        const { files, selected } = state;
        this.fs.populateDirectorySync('/', files);
        this.files = files;
        this.setSelected(selected || Object.keys(files)[0]);
    }

    private internalOnChange = (): void => {
        if (this._onChangeId === undefined) {
            this._onChangeId = requestAnimationFrame(() => {
                this._onChangeId = undefined;
                this.updateHash();
                this.onChange?.();
            });
        }
    };
    private setResults(meta: StylableMeta, exports: StylableExports) {
        const { diagnostics, transformDiagnostics } = meta;
        this.meta = meta;
        this.formattedMeta = formatMeta(meta);
        this.formattedOutput = formatOutput(meta, exports);
        this.jsExports = exports;
        this.diagnostics = diagnostics.reports.concat(transformDiagnostics?.reports || []);
    }
    private resetResults(e?: Error) {
        this.meta = undefined;
        this.formattedMeta = '{}';
        this.formattedOutput = '';
        this.jsExports = undefined;
        this.diagnostics = e ? [{ type: 'error', message: e.message || String(e) }] : [];
    }
    updateHash(): void {
        const searchParams = new URLSearchParams();
        searchParams.set(
            'state',
            JSONCrush(JSON.stringify({ files: this.files, selected: this.selected }))
        );
        history.replaceState(undefined, window.name, '#' + searchParams.toString());
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
            this.internalOnChange();
        }
    };
    setSelected = (filePath: string): void => {
        this.selected = filePath;
        if (this.selected.endsWith('.st.css')) {
            try {
                const { meta, exports } = this.stylable.transform(
                    this.files[this.selected],
                    this.selected
                );
                this.setResults(meta, exports);
            } catch (e) {
                this.resetResults(e as Error);
            }
        } else {
            this.resetResults();
        }
        this.internalOnChange();
    };
    updateSelected = (value = ''): void => {
        this.fs.writeFileSync(this.selected, value);
        this.files[this.selected] = value;
        this.setSelected(this.selected);
    };
}
function formatOutput(meta?: StylableMeta, exports?: StylableExports) {
    const css = meta?.outputAst?.toString() ?? '';
    if (exports && Object.keys(exports).length) {
        return String(css) + `\n/*\nJavascript Exports:\n${JSON.stringify(exports, null, 4)}\n*/`;
    }
    return css;
}
function formatMeta(meta: StylableMeta): string {
    const { ast, outputAst, rawAst, parent, ...cleanMeta } = meta;
    return JSON.stringify(cleanMeta, null, 2);
}
function getFilePathFromUserInput(fileName: string, ext: string, defaultExt = '.st.css') {
    if (!ext) {
        return `/${fileName}${defaultExt}`;
    } else if (ext === '.') {
        return `/${fileName.slice(-1)}${defaultExt}`;
    } else {
        return `/${fileName}`;
    }
}
