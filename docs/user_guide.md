# &lt;san-devtool /&gt; 使用指南

San-devtool 为 **San** 基于浏览器扩展的开发者工具。目前暂时支持 Google Chrome 及以 Chromium 为核心的浏览器（以下全部以 Chrome 指代）。并且提供了一个基于 Node.js 的全局命令行工具 `san-devtool` 用于直接打开 *默认/制定* 的 Chrome 浏览器并自动加载 san-devtool 扩展调试页面。

### 版本依赖
 - san-devtool 的运行需要 **San 3.0.3-rc.17** 及以上的版本。
 - Store tab 的展现需要 **san-store 1.1.0** 及以上的版本。

> 提示：san-devtool 在 **San 3.1.4** 之前的版本中会向 `Object.prototype` 中设置 `__san_devtool__` 只读属性。在 3.1.4 之后的版本仅会向 `window`  对象设置。

- [下载](#下载)
- [安装](#安装)
    - [更新](#更新)
- [命令行工具](#命令行工具)
- [开发者工具](#开发者工具)
    - [图标](#图标)
    - [首页](#首页)
    - [Component](#component)
    - [Store](#store)
    - [History](#history)
    - [Routes](#routes)
- [控制台直接调试](#控制台直接调试) 
- [新功能预告](#新功能预告)


## 下载
目前支持以下的下载途径：

 - GitHub Releases：https://github.com/ecomfe/san-devtool/releases，zip 格式。
 - Source code：`$ git clone https://github.com/ecomfe/san-devtool.git`

## 安装
目前支持以下几种安装途径

 - Chrome Web Store：由 https://chrome.google.com/webstore/detail/san-devtool/pjnngoafflflkagpebgfifjejlnfhahc 安装。
 - 手动安装：请参见 https://blog.hunter.io/how-to-install-a-chrome-extension-without-using-the-chrome-web-store-31902c780034。
 - NPM：`$ npm install -g san-devtool`，`san-devtool` 命令参见下面 *命令行工具* 一节。
 - Source code：
 
 ```
$ git clone git@github.com:ecomfe/san-devtool.git
$ cd san-devtool
$ npm i
$ npm run build
$ cd dist
同手动安装
 ```

### 更新
 - Chrome Web Store：自动更新。
 - NPM：`npm update`。

## 命令行工具
通过 NPM 全局安装的 san-devtool 会提供一个名为 `san-devtool` 的全局命令行工具，执行 `san-devtool --help` 可以查看各参数的含义。这个工具可以在不通过 Chrome Web Store 及手动安装的情况下自动打开 Chrome 浏览器并加载 NPM 所安装的 san-devtool 来调试页面。

![global_executable](https://raw.githubusercontent.com/ecomfe/san-devtool/master/docs/images/global_executable.png#right)

## 开发者工具
### 图标
<p>
    <a href="https://raw.githubusercontent.com/ecomfe/san-devtool/master/docs/images/browser_action.png">
        <img align="right" src="https://raw.githubusercontent.com/ecomfe/san-devtool/master/docs/images/browser_action.png" alt="browser_action" height="100">
    </a>
</p>
在 Chrome 浏览器中安装好 san-devtool 扩展之后，我们会在 Chrome 的工具栏中看到 **San** 的图标，图标的默认状态为灰色。刷新当前页面，若检测到当前页面有使用 **San**，并且 `san.debug` 为 `true`，图标会变为 **San** 标准的蓝色，并且下方会显示出检测到的 **San** 的版本号。

#### Popup 窗口
<p>
    <a href="https://raw.githubusercontent.com/ecomfe/san-devtool/master/docs/images/popup.png">
        <img align="right" src="https://raw.githubusercontent.com/ecomfe/san-devtool/master/docs/images/popup.png" alt="popup" height="240">
    </a>
</p>
点击 **San** 图标会弹出 popup 窗口，此窗口中包含几个 san-devtool 的全局选项。

 - Do not display the version number：默认情况下，每次刷新页面，都会在 **San** 图标下显示当前页面所使用的 **San** 的版本号。当点击图标弹出 popup 窗口后，或者打开位于浏览器开发者工具中的 **San** 面板后，版本号会被隐藏。若勾选次选项，则始终不会显示版本号。
 - Readonly for component data：若勾选次选项，在浏览器开发者工具中的 **San** 面板中的 Component tab 中，选定组件显示出的组件 data 为只读，不允许修改其任何 key 及 value。
 - Readonly for store：若勾选次选项，在浏览器开发者工具中的 **San** 面板中的 Store tab 中，选定组件显示出的 payload 为只读，不允许修改其任何 key 及 value，以及 dispatch。
 
 
### 首页
San-devtool 集成在浏览器内的开发者工具界面，位于浏览器开发者工具的 **San** 面板中。此面板分为上下两大部分。

![main](https://raw.githubusercontent.com/ecomfe/san-devtool/master/docs/images/main.png)

 - 上部 **导航栏** 包括恒定显示的 *Component* tab 和 *History* tab。当使用了 san-store，则会追加 *Store* tab。当使用了 san-router，则会追加 *Route* tab。
 - 下部 **内容区** 会在接下来的几个段落中详细介绍。

### Component
浏览器开发者工具的 **San** 面板被打开后，会默认显示 Component tab。Component tab 由左右两个部分组成，中间通过一个可以拖动的分隔条隔开。左侧为页面的组件结构树。

<p>
    <a href="https://raw.githubusercontent.com/ecomfe/san-devtool/master/docs/images/building_component_tree.png">
        <img align="right" src="https://raw.githubusercontent.com/ecomfe/san-devtool/master/docs/images/building_component_tree.png" alt="building_component_tree" width="30%">
    </a>
</p>
第一次进入时，页面当前状态下的组件结构树会被一次性的加载。当组件较多的时候，加载可能会花费些时间，由于组件结构树的加载过程为异步的，这并不影响我们选择已经被加载出来的组件项目。其中每一条组件项目包含了三个内容：

 - Component name：默认情况为组件的 subTag 属性，当 subTag 不存在的时候（**San 3.1.0-beta.1** 之前的版本），则显示组件的 constructor name，可能为 `ComponentClass`。
 - Component ID：即组件 ID，`_san_+数字` 。同时也是组件所对应的 DOM 元素的 ID。
 - Route：当此组件由路由器的路由规则匹配时渲染生成，则显示此额外信息，内容为实际的路径。

当 *Building* 进度条走完并且消失的时候，则代表整个组件结构树已经加载完毕，我们可以将整个树形结构滚动到底部来查看当前整个页面的组件结构。

当页面的组件结构发生变化时，组件结构树会自动进行刷新，若当前被选中的组件项目所对应的组件没有发生变化，则不会影响到右侧已经展示出的详细信息区域。

![filter](https://raw.githubusercontent.com/ecomfe/san-devtool/master/docs/images/filter.png)

在组件结构树的顶部，有一个 filter bar，随着我们输入文本，下方的组件结构树会过滤出仅包含过滤文本的组件项目，过滤范围包括组件名、组件 ID、Route 信息。当 filter bar 的文本为空时，恢复显示完整的组件结构树。

Component tab 右侧为详细信息显示区域，包含了六个功能块：

 - Basic information：显示一个组件最基本的信息，包含了 ID，组件的祖先组件路径，parent/owner 组件信息等，点击蓝色按钮会跳转并且 inspect 至浏览器开发者工具 *Element* 面板中该按钮所示组件对应 DOM 元素上。<br />![basic_information_group](https://raw.githubusercontent.com/ecomfe/san-devtool/master/docs/images/basic_information_group.png)
 - Data viewer：这是一个 JSON viewer，展示一个组件的 data。这个 viewer 是可以修改的，我们可以进行 CRUD 操作，以及修改 object 中的 key。所有的修改会自动同步到组件的 data 中。<br />**值得注意的是**：当组件的 data 发生改变时，viewer 不会自动刷新，需要重新选择该组件在组件结构树中的对应项目。<br />![component_data_group](https://raw.githubusercontent.com/ecomfe/san-devtool/master/docs/images/component_data_group.png)
 - Computed：对应组件 computed 定义的 function，包含其所引用的 data 中的 key 及 value。<br />![computed_group](https://raw.githubusercontent.com/ecomfe/san-devtool/master/docs/images/computed_group.png)
 - Filters：对应组件 filters 定义的 function。
 - Messages：对应组件 messages 定义的 function。
 - Listeners：组件所挂载的事件的 listener。

上述六个功能块并不确保会全部显示，当某一个功能块确定为空时会隐藏整个区域。

![component_detail](https://raw.githubusercontent.com/ecomfe/san-devtool/master/docs/images/component_detail.png)

详细信息显示区域的顶部包含了一个 title bar，其中包含了三部分：

 - Component name
 - Inspect 按钮：点击会跳转并且 inspect 至浏览器开发者工具 *Element* 面板。
 - filter bar：与组件结构树的 filter bar 类似，随着我们输入文本，下方的六个功能块会过滤出仅包含过滤文本的内容，过滤范围包括 viewer 的 key/value，各 function 的代码字符串文本。当 filter bar 的文本为空时，恢复显示完整的功能块内容。

### Store
Store tab 反映了在使用了 **San 框架的官方应用状态管理套件** 即 **san-store** 后，页面应用的状态及状态的变更。与 Component tab 类似，Store tab 由左右两个部分组成，中间通过一个可以拖动的分隔条隔开。左侧为页面加载至今的状态变更快照。

![mutation_list](https://raw.githubusercontent.com/ecomfe/san-devtool/master/docs/images/mutation_list.png)

无论是否打开开发者工具，页面从初始加载时刻起的所有状态的变化都会被记录。在左侧的列表中，每个项目包含了三个内容：

 - Action name：触发此状态变更的 action 的名字。
 - 状态变化时刻的时间戳：包括日期及时间，精确到秒。
 - 附加信息。

<p>
    <a href="https://raw.githubusercontent.com/ecomfe/san-devtool/master/docs/images/store_group.png">
        <img align="right" src="https://raw.githubusercontent.com/ecomfe/san-devtool/master/docs/images/store_group.png" alt="store_group" width="40%">
    </a>
    <a href="https://raw.githubusercontent.com/ecomfe/san-devtool/master/docs/images/diff_group.png">
        <img align="right" src="https://raw.githubusercontent.com/ecomfe/san-devtool/master/docs/images/diff_group.png" alt="diff_group" width="40%">
    </a>
</p>

点击列表中的项目，右侧的详细信息区域会发生变化。从上之下包括：

 - Store：标示了所选的状态变更的 action 对应的 store（缺省 store 还是其他 store），payload，以及 action handler。
 - Diff：可以查看该 action dispatch 时， payload 变化前后的所有差异。

> 提示：当使用了非官方的 connector 时，要确保在必要的时刻向 san-devtool 发送 `store-connected` `store-comp-inited` `store-comp-disposed` 事件，这样 san-devtool 才可以更好的生成 Store tab 中所需要状态变更快照。虽然已对无法收到上述事件做了替代方案，但这样可能会导致 Store tab 中某些地方为空。


### History
![history_list](https://raw.githubusercontent.com/ecomfe/san-devtool/master/docs/images/history_list.png)

History tab 可以列举页面从加载至今的所有 **San** 发往 san-devtool 的事件的历史记录，这些事件包括：

 - comp-compiled
 - comp-inited
 - comp-created
 - comp-attached
 - comp-detached
 - comp-disposed
 
上述几种事件参见 **San 教程** 中 **组件**一章的 *生命周期* 部分，这里不再赘述。还有：

 - comp-route
此事件为 **san-router** 发出，san-devtool 监听 comp-route 事件用于更新 Routes tab 中的路由变化。

History tab 为一张表格，表格中的每一行包含了：

 - 事件发出时间戳：包括日期及时间，精确到秒。
 - 事件类型：上述事件之一。
 - 事件发生组件：以组件 ID 显示，点击会跳转并且 inspect 至浏览器开发者工具 *Element* 面板。
 - 事件发生时组件 data：显示为 data viewer。data 代表当事件发生时组件 data 的快照。

默认情况下，为了保证 san-devtool 的运行效率，页面从最开始的初始加载开始并不会将所有发往 san-devtool 的时间直接显示在历史记录列表内。

当点击 *Load all history records* 按钮后，才会加载从页面加载至今的所有事件。只有当顶端工具栏中的 ▶ 被点击且显示为 *Recording* 时，当前发生的所有事件才会实时的记录在历史记录列表内。

### Routes
![route_list](https://raw.githubusercontent.com/ecomfe/san-devtool/master/docs/images/route_list.png)

Routes tab 中按照由新至旧的顺序列出了页面路由变化。每一条包括了：

 - 组件 ID：点击会跳转并且 inspect 至浏览器开发者工具 *Element* 面板。
 - 时间戳：路由跳转时的时间戳，包括日期及时间，精确到秒。
 - 路由信息：包括了路径，hash（若有），query string（若有），referer（若有）。

## 控制台直接调试
![sandevtool_property](https://raw.githubusercontent.com/ecomfe/san-devtool/master/docs/images/sandevtool_property.png)

默认情况下，san-devtool 会在全局写入一个对象 `window.__san_devtool__`，里面包含了 san-devtool 用于展示开发者工具的所有源信息。包括：

 - san：**San** 全局对象。用于版本检测及 **San** hook 检测。
 - tree：生成组件结构树的原始对象。
 - store：展示 Store 变更状态的所有对象。
 - history：历史记录快照。
 - routes：路由记录列表。

![dom_properties](https://raw.githubusercontent.com/ecomfe/san-devtool/master/docs/images/dom_properties.png)

除此之外，san-devtool 还会向组件挂载的 DOM 对象上附加一些内容：包括但不限于：

 - \_\_san_component\_\_：组件实例。
 - \_\_san_data\_\_：组件实例中的 data。
 - \_\_san_path\_\_：组件的祖先组件路径。

![dom_values](https://raw.githubusercontent.com/ecomfe/san-devtool/master/docs/images/dom_values.png)

通过这些直接附加到 DOM 上的值，同样可以很方便快捷地了解组件状态，以及对组件进行适当的调试。

## 新功能预告
 - \$s0 to \$s9 commands as component historical reference.
 - Trigger event listeners.
 - Manual reloading component tree.
 - A better history tab. 
 - A graphical routes tab.
 - Time traveler.
 - Bi-directional data binding for component detail information (in especial data viewer).
