import { EditorView, basicSetup } from "codemirror";
import { keymap } from "@codemirror/view";
import { Compartment, EditorSelection, Extension } from "@codemirror/state";
import { indentWithTab } from "@codemirror/commands";
import { indentUnit } from "@codemirror/language";
import { oneDark } from "@codemirror/theme-one-dark";
import { coloredBrackets } from "./brackets";
import { languageHighlightExtension, SupportedLanguage } from "./languages";

const defaultTabWidth = 4;

type CmViewOpts = {
    contents: string;
    extensions: Extension[];
    language: SupportedLanguage;
    tabWidth: number;
};

export function createCodeMirrorView(opts?: Partial<CmViewOpts>) {
    const element = document.createElement("div");
    element.classList.add("cm-container");

    const lintersCompartment = new Compartment();
    const loadedLinters = new Set<Extension>();

    const compartment = new Compartment();
    const loadedExtensions = new Set<Extension>();

    if (opts?.extensions) {
        for (const ext of opts.extensions) {
            loadedExtensions.add(ext);
        }
    }

    const tabWidth = opts?.tabWidth || defaultTabWidth;

    const editorView = new EditorView({
        parent: element,
        doc: opts?.contents || "",
        extensions: [
            oneDark,
            coloredBrackets,
            basicSetup,
            keymap.of([indentWithTab]),
            indentUnit.of(new Array(tabWidth + 1).join(" ")),
            compartment.of([...loadedExtensions]),
            lintersCompartment.of([...loadedLinters]),
        ],
    });

    const reloadExtensions = () => {
        const effects = compartment.reconfigure([...loadedExtensions]);
        editorView.dispatch({ effects });
    };

    const extensions = {
        add(extension: Extension) {
            if (!extension) return;
            loadedExtensions.add(extension);
            reloadExtensions();
        },
        remove(extension: Extension) {
            if (!extension) return;
            loadedExtensions.delete(extension);
            reloadExtensions();
        },
        removeAll() {
            loadedExtensions.clear();
            reloadExtensions();
        },
    };

    const reloadLinters = () => {
        const effects = lintersCompartment.reconfigure([...loadedLinters]);
        editorView.dispatch({ effects });
    };

    const linters = {
        add(extensions: Extension[]) {
            for (const extension of extensions) {
                if (!extension) continue;
                loadedLinters.add(extension);
            }
            reloadLinters();
        },
        reload: () => {
            for (const linter of loadedLinters) {
                // source: https://discuss.codemirror.net/t/can-we-manually-force-linting-even-if-the-document-hasnt-changed/3570/16
                const viewPlugin = linter?.[1];
                if (!viewPlugin) continue;
                const plugin = editorView.plugin(viewPlugin) as any;
                if (plugin) {
                    plugin.set = true;
                    plugin.force();
                }
            }
        },
        removeAll() {
            loadedLinters.clear();
            reloadLinters();
        },
    };

    let languageExtension: Extension = null;
    const setLanguage = async (lang: SupportedLanguage) => {
        if (languageExtension) {
            extensions.remove(languageExtension);
        }

        languageExtension = await languageHighlightExtension(lang);
        extensions.add(languageExtension);
    };

    if (opts?.language) {
        setLanguage(opts.language);
    }

    const lockEditing = EditorView.editable.of(false);

    return {
        element,
        editorView,
        editing: {
            lock() {
                extensions.add(lockEditing);
            },
            unlock() {
                extensions.remove(lockEditing);
            },
        },
        replaceContents(newContents: string) {
            const currentContents = editorView.state.doc.toString();
            if (newContents === currentContents) return;

            let selection = editorView.state.selection;

            let range = selection.ranges?.at(0);
            if (range?.from > newContents.length) {
                selection = selection.replaceRange(
                    EditorSelection.range(newContents.length, range.to),
                    0,
                );
                range = selection.ranges?.at(0);
            }
            if (range?.to > newContents.length) {
                selection = selection.replaceRange(
                    EditorSelection.range(range.from, newContents.length),
                    0,
                );
            }

            editorView.dispatch({
                changes: {
                    from: 0,
                    to: currentContents.length,
                    insert: newContents,
                },
                selection,
            });
        },
        extensions,
        linters,
        remove() {
            element.remove();
            editorView.destroy();
        },
        get value() {
            return editorView.state.doc.toString();
        },
        setLanguage,
    };
}
