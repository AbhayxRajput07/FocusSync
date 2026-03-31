const fs = require('fs');
let text = fs.readFileSync('src/pages/Analytics.jsx', 'utf8');
const stringRegex = /<div className=\"w-full min-h-screen[^\"]*\">/i;
if (stringRegex.test(text)) {
  text = text.replace(stringRegex, '<div className=\"w-full\">');
  fs.writeFileSync('src/pages/Analytics.jsx', text);
  console.log('Fixed');
} else {
  console.log('Not found');
}
