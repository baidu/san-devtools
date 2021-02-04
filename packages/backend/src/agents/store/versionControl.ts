/**
 * @file
 */
// https://github.com/baidu/san-store/commit/a8ade597cf8b00906c95adf9c628a9bded7d3d38

export const storeDecorator = {
    hasDecorated: false, // 是否已经装饰
    /**
     * 装饰 store 原型上的每个原型函数
     * 1. 确保在开发环境启用
     * 2. 兼容低版本san-store2.1.0以下
     */
    handler: function (store: Record<string, any>) {
        if (this.canDecorate(store)) {
            console.log('canDecorate');
            let storeProto = Object.getPrototypeOf(store);
            let descs = Object.getOwnPropertyDescriptors(storeProto);
            this.hasDecorated = true;
            // AOP handler
            for (let desc in descs) {
                let oldProtoFn = storeProto[desc];
                if (typeof storeProto[desc] !== 'function' || desc === 'constructor') {
                    continue;
                }
                storeProto[desc] = function (...args: any) {
                    !this.log && (this.log = true);
                    return oldProtoFn.call(this, ...args);
                };
            }
        }
    },
    /**
    * 根据 store 实例上是否有特定属性方法来判断是否添加装饰器
    */
    canDecorate: function canDecorate(store: Record<string, any>) {
        let versionOk = !store.actionCtrl || !store.actionCtrl.getById;
        return !this.hasDecorated && !store.log && versionOk;
    }
};
