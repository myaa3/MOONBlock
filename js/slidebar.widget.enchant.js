/**
 * slidebar.widget.enchant.js
 * @version 0.1.0
 * @require enchant.js v0.6.2+
 * @require widget.enchant.js v0.2.0+
 * @author Ubiquitous Entertainment Inc.
 * @description
 [lang:ja]
 * スライドバーを追加するプラグイン.
 [/lang]
 */

/**
 * @scope enchant.widget.SlideBar.prototype
 */
enchant.widget.SlideBar = enchant.Class.create(enchant.widget.EntityGroup, {
    /**
     * @name enchant.widget.SlideBar
     * @class
     [lang:ja]
     * スライドバー.
     * ノブをドラッグすることで値が変わる.
     * @param {Number} min SlideBarの最小値.
     * @param {Number} max SlideBarの最大値.
     * @param {Number} precision SlideBarの小数点以下の桁数.
     * @param {Number} value SlideBarの初期値.
     [/lang]
     * @constructs
     * @extends enchant.widget.EntityGroup
     */
    initialize: function(min, max, precision, value) {
        enchant.widget.EntityGroup.call(this, 128, 24);
        enchant.widget.focus.toFocusTarget(this);
        enchant.widget.input.enableStopTouchPropagation(this);
        /**
         [lang:ja]
         * SlideBarのノブ.
         [/lang]
         * @type {enchant.widget.Knob}
         */
        var knob = this.knob = new enchant.widget.Knob(8);
        knob.color = '#8080b0';
        knob.y = 4;
        this.addChild(knob);
        /**
         * SlideBarの色.
         * @type {String}
         */
        this.color = '#b0b0b0';
        this._min = min;
        this._max = max;
        this._precision = (typeof precision === 'number') ? precision : 4;
        this.value = (typeof value === 'number') ? value : Math.min(max, Math.max(min, 0));
        this.knob.addEventListener(enchant.Event.TOUCH_START, this._onknobtouchstart);
        this.knob.addEventListener(enchant.Event.TOUCH_MOVE, this._onknobtouchmove);
        this.knob.addEventListener(enchant.Event.TOUCH_END, this._onknobtouchend);
    },
    _onknobtouchstart: function(e) {
        var bar = this.parentNode;
        this._lastX = e.x;
        this._lastY = e.y;
        bar._lastValue = bar.value;
    },
    _onknobtouchmove: function(e) {
        var bar = this.parentNode;
        var min = 0;
        var max = bar._width - this._width;
        var dx = e.x - this._lastX;
        var dy = e.y - this._lastY;
        this.x = Math.min(max, Math.max(min, this._x + dx));
        this._lastX = e.x;
        this._lastY = e.y;
        bar._updateValue();
        bar.value = bar._valueX;
    },
    _onknobtouchend: function() {
        var bar = this.parentNode;
        var e;
        if (bar._lastValue !== bar._value) {
            e = new enchant.Event(enchant.Event.CHANGE);
            e.oldValue = bar._lastValue;
            bar.dispatchEvent(e);
        }
    },
    _updateValue: function() {
        var ratio = this.knob.x / (this._width - this.knob.width);
        this._valueX = ratio * (this.max - this.min) + this.min;
    },
    _updateKnobPosition: function() {
        var ratio = (this._value - this.min) / (this.max - this.min);
        this.knob.x = ratio * (this._width - this.knob._width);
    },
    /**
     [lang:ja]
     * SlideBarの値.
     [/lang]
     * @type {Number}
     */
    value: {
        get: function() {
            return this._value;
        },
        set: function(val) {
            var shift = Math.pow(10, this._precision);
            this._value = Math.round(val * shift) / shift;
            this._updateKnobPosition();
        }
    },
    /**
     [lang:ja]
     * SlideBarの最小値.
     * @type {Number}
     [/lang]
     */
    min: {
        get: function() {
            return this._min;
        },
        set: function(min) {
            this._min = min;
            this._updateKnobPosition();
        }
    },
    /**
     [lang:ja]
     * SlideBarの最大値.
     * @type {Number}
     [/lang]
     */
    max: {
        get: function() {
            return this._max;
        },
        set: function(max) {
            this._max = max;
            this._updateKnobPosition();
        }
    },
    /**
     [lang:ja]
     * SlideBarの小数点以下の桁数.
     * @type {Number}
     [/lang]
     */
    precision: {
        get: function() {
            return this._precision;
        },
        set: function(precision) {
            this._precision = precision;
        }
    },
    cvsRender: function(ctx) {
        var hh = this.height / 2;
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineCap = 'round';
        ctx.lineWidth = 6;
        ctx.moveTo(6, hh);
        ctx.lineTo(this.width - 6, hh);
        ctx.stroke();
        ctx.lineCap = 'butt';
        ctx.lineWidth = 1;
    }
});

/**
 * @scope enchant.widget.Knob.prototype
 */
enchant.widget.Knob = enchant.Class.create(enchant.Entity, {
    /**
     * @name enchant.widget.Knob
     * @class
     [lang:ja]
     * スライドバーのノブ.
     * DOM描画には現在非対応.
     * {@see enchant.widget.SlideBar}
     * @param {Number} radius ノブの半径.
     [/lang]
     * @constructs
     * @extends enchant.Entity
     */
    initialize: function(radius) {
        var width = radius * 2;
        enchant.Entity.call(this, width, width);
        /**
         * ノブの色.
         * @type {String}
         */
        this.color = '#ff00ff';
        this.radius = radius;
    },
    /**
     [lang:ja]
     * ノブの半径.
     [/lang]
     * @type {Number}
     */
    radius: {
        get: function() {
            return this._radius;
        },
        set: function(r) {
            this._radius = r;
            this.width = r * 2;
            this.height = r * 2;
        }
    },
    cvsRender: function(ctx) {
        var r = this._radius;
        var a = this.opacity;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.arc(r, r, r, 0, Math.PI * 2);
        ctx.globalAlpha = a * 0.8;
        ctx.fill();
        ctx.globalAlpha = a;
        ctx.stroke();
    }
});
