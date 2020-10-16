/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file main.js
 */

import san from 'san';
// style
import 'font-awesome/css/font-awesome.min.css';
import './main.css';

// route
import List from './todo/List';
import Form from './todo/Form';
import AddCategory from './category/Add';
import EditCategory from './category/Edit';

import {router} from 'san-router';


router.add({rule: '/', Component: List, target: '#app'});
router.add({rule: '/todos/category/:category', Component: List, target: '#app'});
router.add({rule: '/add', Component: Form, target: '#app'});
router.add({rule: '/edit/:id', Component: Form, target: '#app'});
router.add({rule: '/category/add', Component: AddCategory, target: '#app'});
router.add({rule: '/category/edit', Component: EditCategory, target: '#app'});

// start
router.start();

