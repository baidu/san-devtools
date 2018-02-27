/**
 * @file TreeViewItem
 * @author Lu Yuan(luyuan.china@gmail.com)
 */

import san, {DataTypes} from 'san';
import _ from 'lodash';
import {TouchRipple, CenterRipple} from 'san-mui/lib/Ripple';
import Icon from 'san-mui/lib/Icon';
import Chip from 'san-mui/lib/Chip';
import Avatar from 'san-mui/lib/Avatar';
import Checkbox from 'san-mui/lib/Checkbox';

export default san.defineComponent({

    template: `
        <div class="sm-tree-view-item {{itemClass}} {{selectedClass}}
                    {{hasSecondaryTextClass}} {{checkedClass}}"
            on-click="toggleTreeView($event)"
            on-mouseover="handleContainerMouseover($event)"
            on-mouseout="handleContainerMouseout($event)"
            style="{{itemStyle}}"
        >
            <div class="pad {{selectedClass}}" s-if="renderable">
                <san-touch-ripple s-if="!disableRipple && !disabled"
                    style="{{touchRippleStyle}}"
                    class="{{selectedClass}} {{hiddenClass}}"
                ></san-touch-ripple>
                <div class="sm-tree-view-item-content {{selectedClass}}
                            {{hiddenClass}}"
                    style="{{itemContentStyle}}"
                >
                    <san-checkbox
                        s-if="checked === true || checked === false"
                        s-ref="checkbox"
                        nativeValue="{{checkboxValue}}"
                        disabled="{{disabled}}"
                        checked="{=checkboxInputValue=}"
                        indeterminate="{=checkboxIndeterminate=}"
                        on-change="checkboxChanged($event)"
                        on-click="checkboxClicked($event)"
                    />
                    <p
                        class="sm-tree-view-item-primary-text"
                        s-if="primaryText"
                    >
                        {{primaryText}}
                    </p>
                    <div class="sm-tree-view-item-extras" s-if="extras">
                        <san-chip
                            s-for="extra in extras"
                            class="{{extra.class||extra.text}}"
                        >
                            <san-avatar icon="{{extra.icon}}" s-if="extra.icon">
                            </san-avatar>
                            {{extra.text}}
                        </san-chip>
                    </div>
                    <p class="sm-tree-view-item-secondary-text" 
                        style="{{secondaryTextStyle}}" 
                        s-if="secondaryText"
                    >{{secondaryText | raw}}
                    </p>
                </div>
                <div
                    class="sm-tree-view-item-expand {{selectedClass}}
                           {{hiddenClass}}"
                    s-if="toggleNested"
                    on-click="toggleTreeView($event, 'EXPAND', false, true)"
                    style="{{expandStyle}}"
                >
                    <san-icon>
                        arrow_drop_{{ open | treeViewOpenIcon }}
                    </san-icon>
                    <san-center-ripple />
                </div>
                <div class="sm-tree-view-item-nested {{ open | treeViewOpen }}"
                    style="{{nestedTreeViewStyle}}"
                >
                    <slot name="nested" s-if="dataSource!=='JSON'"></slot>
                    <san-tree-view-item
                        s-else
                        s-for="item, index in treeData.treeData"
                        s-ref="{{ref}}_{{index}}"
                        index="{{index}}"
                        ref="{{ref}}_{{index}}"
                        identity="{{item.identity}}"
                        treeData="{=item=}"
                        filterText="{{filterText}}"
                        initiallyOpen="{{initiallyOpen}}"
                        dataSource="JSON"
                    >
                    </san-tree-view-item>
                </div>
            </div>
        </div>
    `,

    dataTypes: {
        disabled: DataTypes.bool,
        hidden: DataTypes.bool,
        renderable: DataTypes.bool,
        index: DataTypes.number,
        selected: DataTypes.bool,
        disableRipple: DataTypes.bool,
        primaryTogglesNestedTreeView: DataTypes.bool,
        initiallyOpen: DataTypes.bool,
        compact: DataTypes.bool,
        wholeLineSelected: DataTypes.bool,
        keepingSelected: DataTypes.bool,
        checked: DataTypes.bool,
        nestedLevel: DataTypes.number,
        secondaryTextLines: DataTypes.number,
        lastExpandingState: DataTypes.bool,
        checkboxValue: DataTypes.string,
        checkboxInputValue: DataTypes.array,
        checkboxIndeterminate: DataTypes.bool,
        filterText: DataTypes.string,
        filtered: DataTypes.bool,
        primaryText: DataTypes.string,
        secondaryText: DataTypes.string,
        extras: DataTypes.arrayOf(DataTypes.objectOf(DataTypes.string))
    },

    components: {
        'san-touch-ripple': TouchRipple,
        'san-center-ripple': CenterRipple,
        'san-checkbox': Checkbox,
        'san-icon': Icon,
        'san-chip': Chip,
        'san-avatar': Avatar,
        'san-tree-view-item': 'self'
    },

    messages: {
        'UI:nested-counter'(arg) {
            let target = arg.value;
            target.set('nestedLevel', target.get('nestedLevel') + 1);
            this.dispatch('UI:nested-counter', target);
        },
        'UI:tree-view-item-hidden'(arg) {
            let childHidden = arg.value;
            this.data.set('hidden', childHidden && this.data.get('hidden'));
        },
        'UI:expand-parent-tree-view-item'(arg) {
            if (typeof arg.value === 'object') {
                if (arg.value.old === ''
                    && this.data.get('lastExpandingState') === null) {
                    this.data.set('lastExpandingState', this.data.get('open'));
                }
            }
            this.toggleTreeView(document.createEvent('MouseEvent'), '',
                true, false);
        },
        'UI:query-data-source-attribute'(arg) {
            let target = arg.target;
            if (target.data.get('dataSource') === undefined) {
                target.data.set('dataSource', this.data.get('dataSource'));
            }
        },
        'UI:query-loading-toast-attribute'(arg) {
            let target = arg.target;
            if (target.data.get('loadingToast') === undefined) {
                target.data.set('loadingToast', this.data.get('loadingToast'));
            }
        },
        'UI:query-parent-checkbox-state'(arg) {
            this.dispatch('UI:query-parent-checkbox-state');
            let child = arg.target;
            if (!child) {
                return;
            }
            let checked = this.data.get('checked');
            if (typeof checked !== 'boolean') {
                return;
            }
            if (child.data.get('checked') !== true) {
                child.data.set('checked', checked);
            }
            if (checked === true) {
                child.data.set('checked', checked);
            }
        }
    },

    initData() {
        return {
            nestedLevel: 1,
            secondaryTextLines: 1,
            lastExpandingState: null,
            checkboxValue: 'ON',
            checkboxInputValue: [],
            checkboxIndeterminate: false,
            filterText: '',
            filtered: true,
            /* 是否可用 */
            disabled: false,
            /* 是否隐藏（高亮过滤时启用） */
            hidden: false,
            /* 是否选中 */
            selected: false,
            /* 是否取消波纹效果 */
            disableRipple: false,
            /* 点击时优先展开/折叠子项 */
            primaryTogglesNestedTreeView: true,
            /* 初始展开状态 */
            initiallyOpen: false,
            /* 复选框状态
               （null：禁用，undefined：由父项决定，true：选中，false：未选中） */
            checked: null,
            /* 数据源
              （ATTRIBUTE：属性定义（静态），JSON：传入 treeData 数据定义（动态）） */
            dataSource: 'ATTRIBUTE'
        };
    },

    filters: {
        treeViewOpenIcon(open) {
            return open ? 'down' : 'up';
        },
        treeViewOpen(open) {
            this.data.set('shown', open);
            return open ? '' : 'hide';
        }
    },

    computed: {
        itemStyle() {
            return {
                'margin-left': this.data.get('nestedLevel') === 1
                    ? 0
                    : this.data.get('rippleMarginLeft') + 'px'
            };
        },
        itemContentStyle() {
            let paddingLeftHasLeft = this.data.get('compact') ? '32px' : '64px';
            let paddingLeftWithoutLeft
                = this.data.get('compact') ? '6px' : '16px';
            return {
                'margin-left': this.data.get('contentMarginLeft') + 'px',
                'padding-left': this.data.get('hasLeft')
                    ? paddingLeftHasLeft
                    : paddingLeftWithoutLeft
            };
        },
        expandStyle() {
            return {
                transform: this.data.get('open') ? 'rotate(0)' : 'rotate(90deg)'
            };
        },
        touchRippleStyle() {
            let level = this.data.get('nestedLevel');
            let leftNormal = this.data.get('wholeLineSelected')
                ? ((1 - level) * this.data.get('rippleMarginLeft'))
                : this.data.get('contentMarginLeft');
            let leftCompact = this.data.get('wholeLineSelected')
                ? ((1 - level) * this.data.get('rippleMarginLeft'))
                : this.data.get('contentMarginLeft');
            if (!leftNormal || !leftCompact) {
                return;
            }

            return {
                left: this.data.get('compact') ? leftCompact + 'px'
                    : leftNormal + 'px'
            };
        },
        selectedClass() {
            return this.data.get('selected') ? 'selected' : '';
        },
        checkedClass() {
            return this.data.get('checked') === true ? 'checked' : '';
        },
        hiddenClass() {
            return !this.data.get('filtered') ? 'hidden' : '';
        },
        hasSecondaryTextClass() {
            return this.data.get('secondaryText') ? 'hasSecondaryText' : '';
        },
        itemClass() {
            return (this.data.get('disabled') ? 'disabled ' : '')
                + (this.data.get('toggleNested') ? 'nested ' : '')
                + (this.data.get('compact') ? 'compact' : '');
        },
        secondaryTextStyle() {
            return {
                /* '-webkit-line-clamp': this.data.get('secondaryTextLines') */
            };
        }
    },

    inited() {
        this.data.set('defaultSelectedIdentity',
            this.parentComponent.data.get('defaultSelectedIdentity'));
        this.data.set('checked', this.data.get('checked'));
        this.data.set('open', this.data.get('initiallyOpen'));
        this.data.set('dataSource',
            (this.data.get('dataSource') || '').toUpperCase());

        this.dispatch('UI:nested-counter', this.data);

        this.dispatch('UI:query-compact-attribute');
        this.dispatch('UI:query-whole-line-selected-attribute');
        this.dispatch('UI:query-keeping-selected-attribute');
        this.dispatch('UI:query-data-source-attribute');
        this.dispatch('UI:query-loading-toast-attribute');

        if (this.data.get('dataSource') === 'JSON') {
            this.initFromTreeData(this.data.get('treeData'));
        }
        else {
            this.generateTreeData();
        }

        this.watch('treeData.text', value => {
            this.data.get('treeData') && this.data.set('primaryText', value);
        });
        this.watch('treeData.secondaryText', value => {
            this.data.get('treeData') && this.data.set('secondaryText', value);
        });
        this.watch('treeData.extras', value => {
            this.data.get('treeData') && this.data.set('extras', value);
        });

        this.watch('filterText', value => {
            if (!value) {
                this.data.set('filtered', true);
                return;
            }
            let text = [
                this.data.get('primaryText'),
                this.data.get('secondaryText'),
                this.data.get('extras').map(item => item ? item.text : '')
            ];
            let matched = new RegExp(value, 'ig').test(
                text.reduce((a, b) => a.concat(b), []));
            this.data.get('filtered') === matched
                ? this.watchFiltered(matched)
                    : this.data.set('filtered', matched);
        });
        this.watch('filtered', value => {
            this.watchFiltered(value);
        });

        this.watch('treeData.checked', value => {
            this.data.set('checked', value, {silence: true});
            this.data.set('checkboxInputValue',
                value ? [this.data.get('checkboxValue')] : [''], {
                    silence: true
                }
            );
            let index = this.data.get('index');
            this.parentComponent
                && this.parentComponent.data.set(
                    'treeData.treeData[' + index + '].checked', value,
                        {silence: true});
        });
        this.watch('treeData.indeterminate', value => {
            this.data.set('checkboxIndeterminate', value, {silence: true});
            let index = this.data.get('index');
            this.parentComponent
                && this.parentComponent.data.set(
                    'treeData.treeData[' + index + '].indeterminate', value,
                        {silence: true});
        });

        this.watch('checkboxInputValue', value => {
            this.data.set('treeData.checked',
                value && value.toString() !== '');
            this.data.set('checked', value && value.toString() !== '', {
                silence: true
            });
            this.parentComponent
                && this.parentComponent.subTag === this.subTag
                    && this.parentComponent.updateSelfCheckboxStateFromChilds();
        });

        this.watch('checked', value => {
            this.data.set('treeData.checked', value);
            if (value === null) {
                return;
            }
            this.data.set('checkboxInputValue',
                value ? [this.data.get('checkboxValue')] : ['']);
        });

        this.watch('checkboxIndeterminate', value => {
            this.data.set('treeData.indeterminate', value);
        });

        this.dispatch('UI:query-parent-checkbox-state');
    },

    attached() {
        if (this.data.get('loadingToast')) {
            let index = this.data.get('index');
            setTimeout(() => {
                this.data.set('renderable', true);
                this.dispatch('UI:item-rendering');
            }, index);
        } else {
            this.data.set('renderable', true);
        }

        const defaultSelectedIdentity = this.data.get('defaultSelectedIdentity');
        const identity = this.data.get('identity');
        console.log(defaultSelectedIdentity, identity);
        if (defaultSelectedIdentity && identity && defaultSelectedIdentity === identity) {
            console.log('bingo!!!');
            let evt = document.createEvent('MouseEvent');
            this.toggleTreeView(evt, 'FORCE');
        }

        let slotChilds = this.slotChilds;
        let hasLeft = 0;

        for (let slot of slotChilds) {
            if (slot.name === 'left') {
                hasLeft++;
            }
        }
        this.data.set('hasLeft', hasLeft);

        this.watch('selected', value => {
            this.fire('selectedToggle', value);
        });

        this.watch('hidden', value => {
            this.fire('hiddenToggle', value);
        });

        this.watch('treeData', value => {
            if (this.data.get('dataSource') !== 'JSON') {
                return;
            }
            if (!value || typeof value !== 'object') {
                return;
            }
            let treeData = value.treeData;
            this.data.set('toggleNested',
                treeData && (treeData instanceof Array) && treeData.length > 0);
        });
        this.watch('treeData.treeData', value => {
            san.nextTick(function () {
                this.updateSelfCheckboxStateFromChilds();
            }, this);
        });

        if (typeof this.data.get('treeData') === 'object') {
            this.data.set('treeData.checked', this.data.get('checked'));
            this.data.set('treeData.indeterminate',
                this.data.get('checkboxIndeterminate'));
        }

        this.updateSelfCheckboxStateFromChilds();

        this.treeView = this.getTreeView();
        this.filterInputBoxEl = this.treeView
            && this.treeView.ref('filterInputBox')
                && this.treeView.ref('filterInputBox').el.querySelector('input');
    },

    detached() {
        this.data.get('dataSource') !== 'JSON'
            && this.parentComponent
                && this.parentComponent.subTag === this.subTag
                    && this.parentComponent.updateSelfCheckboxStateFromChilds();
    },

    created() {
    },

    disposed() {
        if (typeof checked === 'boolean') {
            this.dispatch('UI:query-parent-checkbox-state');
        }
    },

    updated() {
        this.data.get('loadingToast') && this.dispatch('UI:item-rendering');
    },

    watchFiltered(filtered) {
        let parent = this.parentComponent;
        if (!filtered) {
            do {
                let parentFiltered = parent.data.get('filtered');
                if (parentFiltered) {
                    this.data.set('filtered', true);
                }
            } while (parent = parent.parentComponent);
        }
    },

    getTreeView() {
        let parent = this.parentComponent;
        do {
            if (parent && parent.data.get('rootTreeView')) {
                return parent;
            }
        } while (parent = parent.parentComponent);
        return null;
    },

    toggleTreeView(evt, driver, forceOpen = false, forceSelected = true) {
        evt.stopPropagation();

        if (this.data.get('disabled')) {
            return;
        }
        if ((evt.target && evt.target.tagName !== 'LABEL'
                        && evt.target.tagName !== 'INPUT')
                            || (driver === 'FORCE')) {
            this.fire('click', {event: evt, comp: this});
            this.dispatch('EVENT:click', {event: evt, comp: this});
        }

        if (driver === 'EXPAND' || forceSelected) {
            this.toggleRipple();
        }
        if (driver !== 'EXPAND' && !forceOpen
                && !this.data.get('primaryTogglesNestedTreeView')
                || (evt && evt.target && (evt.target.tagName === 'INPUT'
                                       || evt.target.tagName === 'LABEL'))) {
            return;
        }

        let open = this.data.get('open');
        this.data.set('open', forceOpen ? true : !open);

        this.fire('nestedTreeViewToggle', open);
        this.dispatch('UI:nested-item-toggle', this);
    },

    checkboxChanged(evt) {
        evt.stopPropagation();

        let value = this.data.get('checkboxInputValue');
        let checked = value && value.toString() !== '';
        this.data.set('checked', checked);
        this.updateChildsCheckboxState(checked, 'checkbox');

        this.fire('checkboxClick',
            {event: evt, comp: this.ref('checkbox'), checked: checked});
    },

    handleContainerMouseover(evt) {
        evt.stopPropagation();
        this.dispatch('EVENT:mouseover', {event: evt, comp: this});
    },

    handleContainerMouseout(evt) {
        evt.stopPropagation();
        this.dispatch('EVENT:mouseout', {event: evt, comp: this});
    },

    clearSelectedClass(send) {
        this.data.get('selected') === true
            && this.data.set('selected', false);
        send && this.dispatch('UI:clear-selected-item');
    },

    toggleRipple() {
        if (this.data.get('keepingSelected')) {
            if (this.data.get('selected')
                && !this.data.get('primaryTogglesNestedTreeView')) {
                return;
            }
            this.clearSelectedClass(true);
            this.data.set('selected', true);
            this.dispatch('UI:record-selected-item');
        }
    },

    updateChildsCheckboxState(value, driver) {
        this.data.set('checkboxInputValue',
            value ? [this.data.get('checkboxValue')] : ['']);
        this.hasNestedSlotChilds()
            ? this.updateSlotChildsCheckboxState(value)
            : this.updateJsonChildsCheckboxState(value);
        if (driver === 'checkbox' && this.parentComponent
            && this.parentComponent.subTag === this.subTag) {
            this.parentComponent.updateSelfCheckboxStateFromChilds();
        }
    },

    hasNestedSlotChilds() {
        let slotChilds = this.slotChilds;
        if (slotChilds.length <= 0) {
            return false;
        }
        for (let i of slotChilds) {
            if (i.name !== 'nested') {
                continue;
            }
            for (let j of i.childs) {
                if (j.subTag === this.subTag) {
                    return true;
                }
            }
        }
        return false;
    },

    getNestedAndCheckedSlotChilds() {
        let items = [];
        let slotChilds = this.slotChilds;
        if (!slotChilds) {
            return items;
        }
        if (slotChilds.length <= 0) {
            return items;
        }
        for (let i of slotChilds) {
            if (i.name !== 'nested') {
                continue;
            }
            for (let j of i.childs) {
                if (!j.el || !j.el.parentNode) {
                    continue;
                }
                if (j.subTag !== this.subTag || !j.owner) {
                    continue;
                }
                if (typeof j.data.get('checked') !== 'boolean') {
                    continue;
                }
                items.push(j);
            }
        }
        return items;
    },

    getNestedAndCheckedJsonChilds() {
        let items = [];
        let treeData = this.data.get('treeData');
        if (!treeData || typeof treeData !== 'object'
            || !(treeData.treeData instanceof Array)) {
            return items;
        }
        let count = treeData.treeData.length;
        if (count === 0) {
            return items;
        }
        for (let i = 0; i < count; i++) {
            let childComp = this.ref('item_' + i);
            if (!childComp || childComp.subTag !== this.subTag) {
                continue;
            }
            if (typeof childComp.data.get('checked') !== 'boolean') {
                continue;
            }
            items.push(childComp);
        }
        return items;
    },

    getParentHavingCheckbox() {
        let parent = this.parentComponent;
        if (!parent || parent.subTag !== this.subTag) {
            return null;
        }
        let checked = parent.data.get('checked');
        if (typeof checked !== 'boolean') {
            return null;
        }
        return parent;
    },

    hasChildHavingCheckbox() {
        let childs = this.getNestedAndCheckedSlotChilds();
        if (!childs || childs.length <= 0) {
            childs = this.getNestedAndCheckedJsonChilds();
            if (!childs || childs.length <= 0) {
                return false;
            }
        }
        for (let i of childs) {
            if (typeof i.data.get('checked') === 'boolean') {
                return true;
            }
        }
        return false;
    },

    updateSlotChildsCheckboxState(value) {
        let childs = this.getNestedAndCheckedSlotChilds();
        for (let i of childs) {
            i.data.set('checked', value);
            i.updateChildsCheckboxState(value);
        }
    },

    updateJsonChildsCheckboxState(value) {
        let childs = this.getNestedAndCheckedJsonChilds();
        for (let i of childs) {
            i.data.set('checked', value);
            i.updateChildsCheckboxState(value);
        }
    },

    updateSelfCheckboxStateFromChilds() {
        let childs = this.getNestedAndCheckedSlotChilds();
        if (!childs || childs.length <= 0) {
            childs = this.getNestedAndCheckedJsonChilds();
            if (!childs || childs.length <= 0) {
                this.data.set('checkboxIndeterminate', false);
                return;
            }
        }
        if (this.data.get('checked') === null) {
            return;
        }
        let subChecked;
        let count = 0;
        for (let i of childs) {
            let childChecked = i.data.get('checked');
            if (typeof childChecked !== 'boolean') {
                continue;
            }
            let childIndeterminate = i.data.get('checkboxIndeterminate');
            if (childIndeterminate) {
                this.data.set('checkboxIndeterminate', true);
                if (this.data.get('checked') === undefined) {
                    this.data.set('checked', false);
                }
                return;
            }
            if (subChecked === undefined) {
                subChecked = childChecked << count;
            }
            else {
                subChecked |= childChecked << count;
            }
            count++;
        }
        if (subChecked !== undefined) {
            this.data.set('checked',
                (subChecked === (1 << count) - 1));
            this.data.set('checkboxIndeterminate',
                (subChecked > 0 && subChecked < (1 << count) - 1));
        }
        let parent = this.getParentHavingCheckbox();
        if (parent) {
            return parent.updateSelfCheckboxStateFromChilds();
        }
    },

    initFromTreeData(data) {
        !data && (data = this.data.get('treeData'));
        if (!data || !(data instanceof Object)) {
            return;
        }
        this.data.set('toggleNested', !!data.treeData);
        this.data.set('primaryText', data.text);
        this.data.set('secondaryText', data.secondaryText);
        this.data.set('extras', data.extras);
        this.data.set('open', data.treeData && data.treeData.length > 0);
        let checked = data.checked;

        this.data.set('checked', checked);
        this.data.set('checkboxInputValue',
            checked
                ? [this.data.get('checkboxValue')]
                : [],
                    {
                        silence: true
                    }
        );
    },

    generateTreeData() {
        let data = {
            text: this.data.get('primaryText'),
            secondaryText: this.data.get('secondaryText'),
            extras: this.data.get('extras'),
            checked: this.data.get('checked')
        };
        this.data.set('treeData', data, {
            silence: true
        });
        let checked = this.data.get('checked');
        this.data.set('checked', checked);
        this.data.set('checkboxInputValue',
            checked ? [this.data.get('checkboxValue')] : ['']);
    },
});
