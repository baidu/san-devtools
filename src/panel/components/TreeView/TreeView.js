/**
 * @file TreeView
 * @author Lu Yuan(luyuan.china@gmail.com)
 */

import san, {DataTypes} from 'san';
import {Icon} from 'san-mui/lib/Icon';
import TextField from 'san-mui/lib/TextField';

export default san.defineComponent({

    template: `
        <div class="sm-tree-view {{treeViewClass}}">
            <div
                class="sm-tree-view-filter-bar {{treeViewClass}}"
                san-if="filterBar"
            >
                <san-text-field
                    icon="{{filterIcon}}"
                    hintText="{=filterPlaceholder=}"
                    inputValue="{=filterText=}"
                    fullWidth
                    s-ref="filterInputBox"
                    on-input-keypress="doHighlight($event)"
                />
            </div>
            <div class="sm-tree-view-loading-toast" s-if="loading">
                {{loadingToast}}
            </div>
            <div class="sm-tree-view-item-wrapper">
                <slot></slot>
            </div>
        </div>
    `,

    dataTypes: {
        compact: DataTypes.bool,
        wholeLineSelected: DataTypes.bool,
        keepingSelected: DataTypes.bool,
        filterBar: DataTypes.bool,
        filterBarHintText: DataTypes.string,
        dataSource: DataTypes.oneOf(['ATTRIBUTE', 'JSON']),
        highlighted: DataTypes.bool,
        treeData: DataTypes.arrayOf(DataTypes.object),
        loading: DataTypes.bool,
        loadingToast: DataTypes.string
    },

    components: {
        'san-icon': Icon,
        'san-text-field': TextField
    },

    inited() {
    },

    initData() {
        return {
            compact: false,
            wholeLineSelected: false,
            keepingSelected: false,
            filterBar: false,
            filterBarHintText: '',
            dataSource: 'ATTRIBUTE',
            highlighted: false,
            loading: true,
            rootTreeView: true,
            filterText: '',
            lastFilterText: ''
        };
    },

    attached() {
    },

    created() {
        this.dispatch('UI:tree-view-created', this);
    },

    messages: {
        'UI:nested-item-toggle'(arg) {
            if (arg.value) {
                this.fire('nestedItemToggle', arg.value);
            }
        },
        'UI:query-compact-attribute'(arg) {
            let compact = this.data.get('compact');
            let target = arg.target;
            target && target.data.set('compact', compact);
            target && target.data.set('rippleMarginLeft', compact ? 16 : 32);
            target && target.data.set('contentMarginLeft', compact ? 22 : 48);
        },
        'UI:query-whole-line-selected-attribute'(arg) {
            arg.target && arg.target.data && arg.target.data.set(
                'wholeLineSelected', this.data.get('wholeLineSelected'));
        },
        'UI:query-keeping-selected-attribute'(arg) {
            arg.target && arg.target.data && arg.target.data.set(
                'keepingSelected', this.data.get('keepingSelected'));
        },
        'UI:record-selected-item'(arg) {
            this.data.set('selectedItem', arg.target);
        },
        'UI:clear-selected-item'(arg) {
            let selectedItem = this.data.get('selectedItem');
            selectedItem && selectedItem.data
                && selectedItem.clearSelectedClass(false);
        },
        'UI:query-filter-bar-attribute'(arg) {
            arg.target && arg.target.data && arg.target.data.set(
                'filterBar', this.data.get('filterBar'));
        },
        'UI:query-filter-text-attribute'(arg) {
            arg.target && arg.target.data && arg.target.data.set(
                'filterText', this.data.get('filterText'));
        },
        'UI:query-checkbox-attribute'(arg) {
            let target = arg.target;
            if (this.data.get('hasCheckbox')) {
                target.data.set('hasCheckbox', true);
            }
        },
        'UI:query-data-source-attribute'(arg) {
            let target = arg.target;
            if (target.data.get('dataSource') === undefined) {
                target.data.set('dataSource', this.data.get('dataSource'));
            }
        }
    },

    computed: {
        treeViewClass() {
            return this.data.get('compact') ? 'compact ' : '';
        }
    },


    doHighlight(evt) {
        if (evt.keyCode !== 13) {
            return;
        }
        let filterText = this.data.get('filterText');
    }

});
