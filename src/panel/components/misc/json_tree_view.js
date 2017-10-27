/**
 * San Devtools
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file A Json Tree View component
 * @author luyuan(luyuan.china@gmail.com)
 */

import {Component, DataTypes} from 'san';

import JSONTreeView from 'json-tree-view';
import 'json-tree-view/devtools.css';


export default class JsonTreeView extends Component {

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

    bind(event) {
        this.view.on(event, (...args) => {
            this.fire.call(this, event, args);
        });
    }

    watchProp(key) {
        this.watch(key, value => {
            this.view[key] = value;
        });
    }

    attached() {
        this.watchProp('alwaysShowRoot');
        this.watchProp('readonlyWhenFiltering');
        this.watchProp('filterText');
        this.watchProp('readonly');

        this.watch('data', value => {
            this.view.value = value;
            this.view.refresh();
        });

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

        this.bind('change');
        this.bind('rename');
        this.bind('delete');
        this.bind('append');
    }

}
