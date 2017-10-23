/**
 * @file A Json Tree View component
 * @author Lu Yuan
 */

import {Component, DataTypes} from 'san';

import JSONTreeView from 'json-tree-view';
import 'json-tree-view/devtools.css';


export default class SanJsonTreeView extends Component {

    static template = `
        <div class="s-json-tree-view">
        </div>
    `;

    static dataTypes = {
        data: DataTypes.object,
        expand: DataTypes.bool,
        rootName: DataTypes.string,
        withRootName: DataTypes.bool,
        alwaysShowRoot: DataTypes.bool,
        readonlyWhenFiltering: DataTypes.bool,
        filterText: DataTypes.string,
        readonly: DataTypes.bool
    };

    initData() {
        return {
            data: {},
            expand: true,
            rootName: '',
            withRootName: false,
            alwaysShowRoot: false,
            readonlyWhenFiltering: true,
            filterText: '',
            readonly: false
        }
    }

    refresh() {
        this.view && this.view.refresh();
    }

    fire(event) {
        let that = this;
        this.view.on(event, function (...args) {
            that.fire(event, ...args);
        });
    }

    watch(key) {
        this.watch(key, value => {
            this.view[key] = value;
        });
    }

    attached() {
        watch('alwaysShowRoot');
        watch('readonlyWhenFiltering');
        watch('filterText');
        watch('readonly');

        let rootName = this.data.get('rootName');
        let withRootName = this.data.get('withRootName');
        let alwaysShowRoot = this.data.get('alwaysShowRoot');
        let readonlyWhenFiltering = this.data.get('readonlyWhenFiltering');
        let filterText = this.data.get('filterText');
        let readonly = this.data.get('readonly');
        let expand = this.data.get('expand');
        let data = this.data.get('data');
        this.view = new JSONTreeView(rootName, data);
        expand ? this.view.expand() : this.view.collapse();
        this.view.withRootName = withRootName;
        this.view.alwaysShowRoot = alwaysShowRoot;
        this.view.readonlyWhenFiltering = readonlyWhenFiltering;
        this.view.filterText = filterText;
        this.view.readonly = readonly;
        this.el.appendChild(this.view.dom);

        this.fire('change');
        this.fire('rename');
        this.fire('delete');
        this.fire('append');
    }

}
