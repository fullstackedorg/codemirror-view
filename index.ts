import { createCodeMirrorView } from "./codeMirrorView";

document.title = "FullStacked CodeMirror View"

const cmView = createCodeMirrorView({
    language: "typescript"
});

document.body.append(cmView.element)