
const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\braya\\OneDrive\\Escritorio\\SISPO\\SISPO-FRONT\\src\\components\\postulacion\\StepSeleccionCargo.vue', 'utf8');
const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/);
if (!templateMatch) {
    console.log("No template found or template tag is malformed");
    process.exit(1);
}
const template = templateMatch[1];

let stack = [];
// Match both normal tags and self-closing tags
const tagRegex = /<(\/?)([a-zA-Z0-9-]+)(?:\s+[^>]*)?(\/?)>/g;
let match;

const selfClosingTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr', 'q-icon', 'q-spinner-puff', 'q-badge', 'q-btn', 'BoliviaMap', 'q-spinner-dots', 'q-inner-loading']);

while ((match = tagRegex.exec(template)) !== null) {
    const isClosing = match[1] === '/';
    const tagName = match[2];
    const isSelfClosing = match[3] === '/';

    if (isSelfClosing) continue;
    if (selfClosingTags.has(tagName) && !isClosing) {
        // Many Quasar tags can be both self-closing or have content.
        // In this file, q-icon and BoliviaMap seem to be used as self-closing.
        // Let's check if the match ends with />
        if (match[0].endsWith('/>')) continue;
    }

    if (isClosing) {
        if (stack.length === 0) {
            console.log(`Extra closing tag </${tagName}> at line ${template.substring(0, match.index).split('\n').length}`);
        } else {
            const last = stack.pop();
            if (last.tag !== tagName) {
                console.log(`Mismatched closing tag </${tagName}> vs <${last.tag}> (from line ${last.line}) at line ${template.substring(0, match.index).split('\n').length}`);
            }
        }
    } else {
        stack.push({tag: tagName, line: template.substring(0, match.index).split('\n').length});
    }
}

stack.forEach(item => {
    console.log(`Unclosed tag <${item.tag}> from line ${item.line}`);
});
