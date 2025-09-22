import { Extension } from "@codemirror/state";

export type SupportedLanguage =
    | "javascript"
    | "js"
    | "jsx"
    | "cjs"
    | "mjs"
    | "typescript"
    | "ts"
    | "tsx"
    | "mts"
    | "cts"
    | "markdown"
    | "md"
    | "python"
    | "py"
    | "scss"
    | "sass"
    | "css"
    | "html"
    | "xml"
    | "svg"
    | "json"
    | "go"
    | "liquid";

export function languageToFileExtension(language: SupportedLanguage) {
    switch (language) {
        case "javascript":
            return "js";
        case "typescript":
            return "ts";
        case "markdown":
            return "md";
        default:
            return language;
    }
}

export async function languageHighlightExtension(
    lang: SupportedLanguage,
): Promise<Extension> {
    switch (lang) {
        case "javascript":
        case "typescript":
        case "js":
        case "jsx":
        case "cjs":
        case "mjs":
        case "ts":
        case "tsx":
        case "mts":
        case "cts":
            const { javascript } = await import("@codemirror/lang-javascript");
            return javascript({
                typescript: lang.startsWith("t"),
                jsx: lang.endsWith("x"),
            });
        case "css":
            const { css } = await import("@codemirror/lang-css");
            return css();
        case "scss":
        case "sass":
            const { sass } = await import("@codemirror/lang-sass");
            return sass({ indented: lang.startsWith("sa") });
        case "svg":
        case "html":
            const { html } = await import("@codemirror/lang-html");
            return html();
        case "liquid":
            const { liquid } = await import("@codemirror/lang-liquid");
            return liquid();
        case "go":
            const { go } = await import("@codemirror/lang-go");
            return go();
        case "markdown":
            const { markdown } = await import("@codemirror/lang-markdown");
            return markdown();
        case "python":
            const { python } = await import("@codemirror/lang-python");
            return python();
        case "json":
            const { json } = await import("@codemirror/lang-json");
            return json();
        default:
            return null;
    }
}
