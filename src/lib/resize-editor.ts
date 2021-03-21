export function resizeEditor(
    _: unknown,
    editor: { getContainerDomNode(): HTMLElement; layout(): void }
): void {
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
