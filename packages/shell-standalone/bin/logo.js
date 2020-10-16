const chalk = require('chalk');
const gradient = require('gradient-string');

function logo(version) {
    version = version ? 'v' + version : '';

    const title = Buffer.from('ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXyAgICAgICAgICAgICAgXyAgICAgICAgICAgICAgICBfIAogX19fICAgX18gXyAgXyBfXyAgICAgICAgICBfX3wgfCBfX18gXyAgICBfIHwgfF8gICBfXyAgICBfXyAgfCB8Ci8gX198IC8gXyAgfHwgIF8gXCAgX19fXyAgLyBfICB8LyBfIFwgXCAgLyAvfCBfX3wgLyBfIFwgLyBfIFx8IHwKXF9fIFx8IChffCB8fCB8IHwgfCBfX19fIHwgKF98IHwgIF9fL1wgXC8gLyB8IHxfIHwgKF8pIHwgKF8pIHwgfF8KfF9fXy8gXF9fX198fF98IHxffCAgICAgICBcX19fX3xcX19ffCBcX18vICAgXF9ffCBcX19fLyBcX19fLyBcX198', 'base64');

    return gradient.atlas.multiline(title) + ' ' + chalk.green(version) + '\n';
};

module.exports = logo
