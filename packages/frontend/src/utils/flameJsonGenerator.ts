/**
 * @file 用于构建火焰图数据的算法：构建树
 *       可以用尾递归调用实现，但是所有尾递归调用都可以用无栈的循环来实现
 *       尾递归调用的特点：易读，代码比较好理解，不会爆栈
 *       无栈循环：不会爆栈
 */
interface TimeFragement {
    start: number;
    end: number;
    name: string;
    componentId: string;
    hookName: string;
    value: number;
    children: TimeFragement[];
}

interface HookData {
    count: number; // 执行次数
    totalTime: number; // 执行的总时长
    start: number[]; // 开始时间，before* 触发的时刻
    end: number[]; // 结束时间，*ed 结束的时刻
}

interface ProfilerData {
    name: string; // 组件名称
    id: string; // 组件 id
    hooks: Record<string, HookData>; // 组件的生命周期钩子函数的数据
    totalTime: number; // 组件渲染的总时间
    parentId: string;
}

type RootData = Pick<TimeFragement, 'name' | 'value' | 'children'>;

/**
 * 用于生成火焰图数据
 *
 * @param {Object} data 源数据
 * @return {Object} root 特定格式的火焰图数据，树结构
 */
export function flameJsonGenerator(data: Record<string, ProfilerData> = {}) {
    let root: RootData = {
        name: 'time line',
        value: 0,
        children: []
    };

    // 遍历 profilerData，将所有 hookData 数据收集起来
    Object.values(data).forEach((item: ProfilerData) => {
        let {name, id, hooks} = item;
        Object.entries(hooks).forEach((hookData: [string, HookData]) => {
            let hookDataStartTime = hookData[1].start;
            let hookDataEndTime = hookData[1].end;
            // start 与 end 都是数组，保存了每次 hook 触发时候的数据
            hookDataStartTime.forEach((start: number, index: number) => {
                let value = hookDataEndTime[index] - start;
                if (value < 0) {
                    return;
                }
                let timeFragment: TimeFragement = {
                    start,
                    end: hookDataEndTime[index],
                    name,
                    componentId: id,
                    hookName: hookData[0],
                    value,
                    children: []
                };
                timeFragementCacheHandler(root.children, timeFragment);
            });
        });
    });

    // 生成 value
    root.children.forEach((child: TimeFragement) => {
        root.value += child.value;
    });

    return root;
}

/**
 * 按照时间线做的火焰图数据结构是一个树，节点是时间区间，具备 start 以及 end，从左到右时间区间递增，从上到下时间区间为包含关系
 *
 * @param {Array} cache 为 flameNode.children
 */
function timeFragementCacheHandler(children: TimeFragement[], timeFragment: TimeFragement) {
    let curChildren = children;
    // 深度遍历
    while (Array.isArray(curChildren)) {
        let len = curChildren.length;
        // 空数组，直接 push
        if (!len) {
            curChildren.push(timeFragment);
            return;
        }
        // 找出匹配到的第一个 children
        let index;
        loopMatchChildren:
        for (index = 0; index < len; index++) {
            let item = curChildren[index];
            let includeInfo = getTimeSlotsRelation(timeFragment, item);
            switch (includeInfo) {
                case 0: {
                    // 如果现存的包含了新加入的
                    curChildren = item.children;
                    break loopMatchChildren;
                }
                case 1: {
                    // 如果新加入的包含了现存的，那么替换之后直接结束
                    timeFragment.children.push(item);
                    curChildren[index] = timeFragment;
                    return;
                }
                case 2: {
                    // 如果新加入的在现存的右边，那么继续loopMatchChildren的循环
                    // 即继续判断与下一个 child 区间的关系，这么处理的原因是火焰图的数据结构是一个树
                    continue loopMatchChildren;
                }
                case 3: {
                    // 如果新加入的在现存的左边，直接放到现存的左边，因为数据是从小到大排列
                    curChildren.splice(index, 0, timeFragment);
                    return;
                }
                // 不存在严格的包含关系，直接退出即可
                default: break;
            }
        }
        // 如果数组遍历完了，还是没有找到 case 0 的情况，则直接 push 到 curChildren，并结束深度遍历
        if (index === len) {
            curChildren.push(timeFragment);
            return;
        }
    }
}

/**
 * 用于判断两个时间区间的关系
 *
 * @param {Object} timeSlotA 时间区间
 * @param {Object} timeSlotB 时间区间
 * @return {number} 0: B 包含 A, 1: A 包含 B, 2: A 在 B 的右边, 3: A 在 B 的左边, 4: 没有包含关系以及不互为子集
 */
function getTimeSlotsRelation(timeSlotA: TimeFragement, timeSlotB: TimeFragement) {
    let startDiff = timeSlotA.start - timeSlotB.start;
    let endDiff = timeSlotA.end - timeSlotB.end;
    if (startDiff * endDiff < 0) {
        // 包含关系: startDiff > 0 为 B 包含 A，startDiff < 0 为 A 包含 B
        return startDiff < 0 ? 1 : 0;
    }
    else {
        if (timeSlotA.start >= timeSlotB.end) {
            // timeSlotA 在 timeSlotB 的右边
            return 2;
        } else if (timeSlotA.end <= timeSlotB.start) {
            // timeSlotA 在 timeSlotB 的左边
            return 3;
        }
        // 两区间不互为子集，根据组件的生命周期的关系，不会出现这种情况。
        return 4;
    }
}
