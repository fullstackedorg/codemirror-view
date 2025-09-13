import { createCodeMirrorView } from "./codeMirrorView";
import { oneDark } from "@codemirror/theme-one-dark";

document.title = "FullStacked CodeMirror View";

const cmView = createCodeMirrorView({
    contents: `// Basic usage
console.log("Hello World!");

// Logging multiple values
let name = "John";
let age = 30;
console.log(\`My name is \${name} and I'm \${age} years old.\`);

// Logging objects
let person = {
name: "Jane",
age: 25,
};

console.log(person);`,
    language: "typescript",
    extensions: [oneDark],
});

document.body.append(cmView.element);
