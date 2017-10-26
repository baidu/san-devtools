/**
 * San Devtools
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file A Button component for inspecting element
 * @author luyuan(luyuan.china@gmail.com)
 */

import {Component, DataTypes} from 'san';
import Messenger from 'chrome-ext-messenger';

import {Button} from 'san-mui/lib/Button';
import 'san-mui/lib/Button/Button.styl';
import Icon from 'san-mui/lib/Icon';
import 'san-mui/lib/Icon/Icon.styl';

export default class InspectableButton extends Component {

    static template = `
        <div
            class="inspectable-button-wrapper"
            on-mouseover="highlight"
            on-mouseout="unhighlight"
        >
            <san-button
                variants="{{variants}}"
                on-click="inspectId"
            >
                <san-icon style="margin-right:{{spacing}}" s-if="!!hasIcon">
                    {{iconName}}
                </san-icon>
                {{text}}
            </san-button>
        </div>
    `;

    static components = {
        'san-button': Button,
        'san-icon': Icon
    };

    static dataTypes = {
        cid: DataTypes.string,
        variants: DataTypes.string,
        hasIcon: DataTypes.bool,
        iconName: DataTypes.string,
        spacing: DataTypes.string,
        text: DataTypes.string
    };

    initData() {
        return {
            cid: '',
            variants: 'info',
            hasIcon: false,
            iconName: '',
            spacing: '0',
            text: 'Inspect'
        }
    }

    created() {
        this.pageEval = chrome.devtools.inspectedWindow.eval;
        this.messenger = new Messenger();
        this.mouseOverConnection = this.messenger.initConnection(
            'component_base_info_mouseover', () => {});
        this.mouseOutConnection = this.messenger.initConnection(
            'component_base_info_mouseout', () => {});
    }

    inspectId() {
        this.pageEval('inspect(document.getElementById("'
            + this.data.get('cid') + '"))|0');
    }

    highlight() {
        this.data.get('cid') && this.mouseOverConnection.sendMessage(
            'content_script:highlight_dom',
                {id: this.data.get('cid')}, () => {});
    }

    unhighlight() {
        this.mouseOutConnection.sendMessage(
            'content_script:unhighlight_dom', {}, () => {});
    }

}
