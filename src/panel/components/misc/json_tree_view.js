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
        withRootName: DataTypes.bool
    };

    initData() {
        return {
            data: {},
            expand: true,
            rootName: '',
            withRootName: false
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

    attached() {
        let rootName = this.data.get('rootName');
        let withRootName = this.data.get('withRootName');
        let expand = this.data.get('expand');
        let data = this.data.get('data');
        this.view = new JSONTreeView(rootName, data);
        expand ? this.view.expand() : this.view.collapse();
        this.view.withRootName = withRootName;
        this.el.appendChild(this.view.dom);

        this.fire('change');
        this.fire('rename');
        this.fire('delete');
        this.fire('append');
    }

}
