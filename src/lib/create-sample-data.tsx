export function createSampleData(): { files: Record<string, string>; selected: string } {
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
