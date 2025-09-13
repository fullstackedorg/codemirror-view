import prettier from "prettier";
import prettierPluginHTML from "prettier/plugins/html";
import prettierPluginCSS from "prettier/plugins/postcss";
import prettierPluginMD from "prettier/plugins/markdown";
import prettierPluginEstree from "prettier/plugins/estree";
import prettierPluginBabel from "prettier/plugins/babel";
import prettierPluginTypeScript from "prettier/plugins/typescript";
import prettierPluginLiquid from "./plugin-liquid";
import { defaultTabWidth as tabWidth } from "../codeMirrorView";
import { languageToFileExtension, SupportedLanguage } from "../languages";

const plugins = [
    prettierPluginHTML,
    prettierPluginCSS,
    prettierPluginMD,
    prettierPluginEstree,
    prettierPluginBabel,
    prettierPluginTypeScript,
    prettierPluginLiquid,
];

export function formatContents(language: SupportedLanguage, text: string) {
    let ext = languageToFileExtension(language);

    if(ext === "svg") {
        ext = "html";
    }

    return prettier.format(text, {
        filepath: `index.${ext}`,
        plugins,
        tabWidth,
    });
}
