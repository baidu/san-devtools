## 开发

```bash
yarn
```

```json
"scripts":{
    "start:ext": "concurrently \"tsc -b -w --force --verbose\" \"yarn workspace extensions start\"",
    "start": "concurrently \"yarn dev:frontend\" \"yarn dev:todo\"",
    "dev:frontend": "yarn workspace frontend start",
    "dev:todo":"yarn workspace shell-dev start"
}
```

## 问题

1. xpath在v8环境怎么计算？
2. 梳理用到的Component对象的方法，san-native需要补齐
   1. 这个一次梳理不完，只能从现在的里面找，还要考虑到component作为变量给函数的情况，后面写代码的时候如果发现还需要用新的api，还需要sn支持
3. 

## 用到的 Component API
id
el
parentComponent
data.raw data.data
data.get dat.get(route)

el.id
el.style.cssText
el.className
el.classList

subTag || constructor.name
tagName
owner
owner.id
parent

## store API

name
components


## backend 事件

## 全局事件

* 断开连接：`disconnected`
* 连接/重连：`connected`

> `global:`开头

backend -> frontend
* backend准备就绪：`global:backendReady`
* san版本：`global:sanVersion`
* san对象准备就绪
* 一次性将tree、router、之类传给frontend `global:`

frontend -> backend

* frontend准备就绪
* 停止记录：`stopRecord`
* 开始记录：`startRecord`

### Component
> `component:`开头

backend -> frontend

* 按需？传递component生命周期变化和anode
  * created
  * inited
  * disposed
  * updated
* inpsectComponent


frontend -> backend
* data：
  * rename
  * change
  * append
  * delete
* computed函数修改，toString（）
* component选中高亮
  * 高亮 highlight
  * 取消高亮 unhighlight
* changeClassName
* changeStyle

### inspect
> `inspect:`开头

frontend -> backend
* inspect：xpath
* logElementToConsole

### history

### store 修改
> `store:`开头
