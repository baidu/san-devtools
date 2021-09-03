/**
 * @file 剔除未用到的 icons-svg
 */
const SVG_ENTRY = '@ant-design/icons-svg/es/index.js';
// 如何获取到用到的 icons
const SVG_NAME = [
    // Home
    'BugOutlined',
    'ChromeOutlined',
    'CaretUpOutlined',
    'CaretDownOutlined',
    // 'compass'
    'CompassOutlined',
    // 'left'
    'LeftOutlined',
    // 'right'
    'RightOutlined',
    // double-left
    'DoubleLeftOutlined',
    'DoubleRightOutlined',
    // InfoCircleOutlined
    'InfoCircleOutlined',
    'InfoCircleFilled',
    'DeleteFilled',
    'DeleteOutlined'
];
const SVG_USED_STR = SVG_NAME.map(item => {
    return `export { default as ${item} } from './asn/${item}';`;
}).join('\n');
module.exports = function loader(source) {
    if (this.resourcePath.indexOf(SVG_ENTRY) > -1) {
        return SVG_USED_STR;
    }
    return source;
};
