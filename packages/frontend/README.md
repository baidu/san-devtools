<h1 align="center">San DevTools</h1>

<div align="center">
San DevTools 用于调试 [San.js](https://github.com/baidu/san) 页面的工具

</div>

## 🎉 特性

-   提供本地 Server 命令，可支持远程调试。
-   内置 Chrome DevTools，满足手机页面远程调控需求。
-   提供Chrome extensions。
-   支持 San Native 版本调试（开发中）。

## 📦 安装

> San DevTools 的 Node.js 版本要求 >= 8.16.0。

```bash
# use npm
npm install -g san-devtools
# or use yarn
yarn global add san-devtools
```

安装之后，你可以通过下面命令查看帮助：

```bash
sand -h
# or
san-devtools -h
```
## 使用

1. 启动本地Server

```bash
# 启动本地server，自带WebSocket服务
san-devtools --port 8080
```

2. 根据提示将`ws-backend.js`添加到要调试页面的San.js之前
3. 打开要调试的页面
4. 进入 `localhost:8080` 页面选择需要debug的页面，然后开始San DevTools debug之旅！

## 🤝 如何贡献

贡献代码，可以参考该项目的[开发文档](https://github.com/baidu/san-devtools)

## 🍻 Companions

-   [san-devtools](https://github.com/baidu/san-devtools) - San DevTools
-   [san-router](https://github.com/baidu/san-router) - SPA Router
-   [san-store](https://github.com/baidu/san-store) - Application States Management
-   [san-update](https://github.com/baidu/san-update) - Immutable Data Update
-   [san-factory](https://github.com/baidu/san-factory) - Component register and instantiation
-   [santd](https://ecomfe.github.io/santd/) - Components Library following the [Ant Design](https://ant.design/) specification
-   [san-mui](https://ecomfe.github.io/san-mui/) - [Material Design](https://www.material.io/) Components Library
-   [san-xui](https://ecomfe.github.io/san-xui/) - A Set of SAN UI Components that widely used on Baidu Cloud Console
-   [drei](https://github.com/ssddi456/drei/) - VSCode extension for SAN
-   [san-cli](https://github.com/ecomfe/san-cli) - A CLI tooling based on SAN for rapid development
-   [san-test-utils](https://github.com/ecomfe/san-test-utils) - The unit testing utility library for SAN
-   [san-loader](https://github.com/ecomfe/san-cli/tree/master/packages/san-loader) - Webpack loader for single-file SAN components


## ☀️ License

MIT
