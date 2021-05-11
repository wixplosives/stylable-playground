import type { Diagnostic, StylableMeta } from '@stylable/core';

export function DiagnosticsList({
    diagnostics,
    meta,
}: {
    diagnostics: Omit<Diagnostic, 'node' | 'options'>[];
    meta: StylableMeta | undefined;
}): React.ReactElement {
    return (
        <ul>
            {diagnostics.map(({ type, message }, i) => (
                <li key={i}>{`${meta?.source ?? ''} - ${type} - ${message}`}</li>
            ))}
        </ul>
    );
}
