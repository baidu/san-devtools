const chalk = require('chalk');
const gradient = require('gradient-string');

function logo(version) {
    version = version ? 'v' + version : '';
    // eslint-disable-next-line
    const title = Buffer.from('ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXyAgICAgICAgICAgICAgXyAgICAgICAgICAgICAgICBfIAogX19fICAgX18gXyAgXyBfXyAgICAgICAgICBfX3wgfCBfX18gXyAgICBfIHwgfF8gICBfXyAgICBfXyAgfCB8ICBfX18gCi8gX198IC8gXyAgfHwgIF8gXCAgX19fXyAgLyBfICB8LyBfIFwgXCAgLyAvfCBfX3wgLyBfIFwgLyBfIFx8IHwgLyBfX3wKXF9fIFx8IChffCB8fCB8IHwgfCBfX19fIHwgKF98IHwgIF9fL1wgXC8gLyB8IHxfIHwgKF8pIHwgKF8pIHwgfF9cX18gXAp8X19fLyBcX19fX3x8X3wgfF98ICAgICAgIFxfX19ffFxfX198IFxfXy8gICBcX198IFxfX18vIFxfX18vIFxfX3xfX18v', 'base64');

    return gradient.atlas.multiline(title) + ' ' + chalk.green(version) + '\n';
};

module.exports = logo;
