const fs = require('fs');
const img = fs.readFileSync('public/black-paper.png');
const b64 = img.toString('base64');
const content = `export const textureBase64 = "data:image/png;base64,${b64}";\n`;
fs.writeFileSync('src/components/TextureBase64.ts', content);
