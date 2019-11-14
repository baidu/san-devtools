/**
 * San DevTools
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file Task Delayer
 */

export default class TaskDelayer {
    constructor({
        delay = 10,
        operator = '||',
        task = (queue, index) => {}
    } = {}) {
        this.delay = delay;
        this.operator = operator;
        this.task = task;
        this._init(arguments[0]);
    }

    _init(options) {
        this._queue = [];
        this._lastTimestamp = 0;
        this._index = 0;
        this._checker = null;
        if (typeof options === 'object') {
            Object.entries(options).forEach(e => this[e[0]] = e[1]);
        }
        if (this.operator.toLowerCase() === 'or') {
            this.operator = '||';
        }
        if (this.operator.toLowerCase() === 'and') {
            this.operator = '&&';
        }
    }

    _check() {
        if (+this.delay < 0 && isNaN(+this.delay)) {
            throw new Error('The "delay" property must be a number.');
        }
        this._checker = setTimeout(() => {
            this._stamp();
            this._ship();
            this._clear();
            clearTimeout(this._checker);
        }, +this.delay);
    }

    _stock(target) {
        this._queue.push(target);
    }

    _ship() {
        if (typeof this.task !== 'function') {
            throw new Error('The "task" property must be a function.');
        }
        this.task(this._queue, this._index);
    }

    _stamp() {
        this._lastTimestamp = Date.now();
    }

    _clear() {
        this._queue.splice(0, this._queue.length);
        this._index = 0;
    }

    _canShip() {
        let results = [];
        if (typeof this.condition === 'function') {
            results.push({ship: this.condition()});
        }
        if (+this.count > 0) {
            results.push({
                ship: this._index % this.count === 0 && this._queue.length === 0
            });
        }
        if (+this.interval > 0) {
            results.push({
                ship: Date.now() - this._lastTimestamp >= this.interval
            });
        }
        if (results.length < 1) {
            throw new Error('No specified condition.');
        }
        let canShip = true;
        switch (this.operator) {
            case '||':
                canShip = false;
                results.forEach(e => {
                    canShip = canShip || e.ship;
                });
                break;
            case '&&':
                canShip = true;
                results.forEach(e => {
                    canShip = canShip && e.ship;
                });
                break;
            default:
                throw new Error('Operator property must be "or" or "and"');
        }
        return canShip;
    }

    spawn(target) {
        if (!this._lastTimestamp) {
            this._stamp();
        }
        this._index++;
        let check;
        if (typeof this.condition === 'function') {
            check = this.condition();
        } else if (+this.count > 0) {
            check = this._index % this.count > 0 && this._queue.length === 0;
        } else if (+this.interval > 0) {
            check = Date.now() - this._lastTimestamp < this.interval;
        } else {
            throw new Error('No specified condition.');
        }
        if (this._canShip()) {
            this._stamp();
            this._stock(target);
            this._ship();
            this._clear();
        } else {
            this._checker && clearTimeout(this._checker);
            this._stock(target);
            this._check();
        }
    }

    queue() {
        return Object.assign({}, this._queue);
    }

    index() {
        return this._index;
    }
};
