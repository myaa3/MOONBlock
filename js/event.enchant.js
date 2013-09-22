/**
 * event.enchant.js
 * @version 0.1.0
 * @require enchant.js v0.6.2+
 * @author Ubiquitous Entertainment Inc.
 * @description
[lang:ja]
 * enchant.jsのタッチイベントの伝播を止められるようにするライブラリ.
[/lang]
 */

(function() {

var _event_original_initialize = enchant.Event.prototype.initialize;
enchant.Event.prototype.initialize = function() {
    _event_original_initialize.apply(this, arguments);
    this.__c = 0;
};

enchant.EventTarget.prototype.dispatchEvent = function(e) {
    e.__c++;
    e.target = this;
    e.localX = e.x - this._offsetX;
    e.localY = e.y - this._offsetY;
    if (this['on' + e.type] != null){
        this['on' + e.type](e);
    }
    var listeners = this._listeners[e.type];
    if (listeners != null) {
        listeners = listeners.slice();
        for (var i = 0, len = listeners.length; i < len; i++) {
            listeners[i].call(this, e);
        }
    }
    e.__c--;
    if (e.__c === 0) {
        e._cancel = false;
    }
};

/**
 [lang:ja]
 * タッチイベントの伝播を停止する.
 * イベントは呼び出し時にイベントをハンドルしていたEntityで止まる.
 [/lang]
 */
enchant.Event.prototype.stopTouchPropagation = function() {
    this._cancel = true;
};

var _node_original_initialize = enchant.Node.prototype.initialize;
enchant.Node.prototype.initialize = function() {
    _node_original_initialize.apply(this, arguments);
    var touchevents = [
        enchant.Event.TOUCH_START,
        enchant.Event.TOUCH_MOVE,
        enchant.Event.TOUCH_END
    ];
    touchevents.forEach(function(type) {
        this.clearEventListener(type);
        this.addEventListener(type, function(e) {
            if (this.parentNode && !e._cancel) {
                this.parentNode.dispatchEvent(e);
            }
        });
    }, this);
};

}());
