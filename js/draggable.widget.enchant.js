/**
 * draggable.widget.enchant.js
 * @version 0.1.0
 * @require enchant.js v0.6.2+
 * @require widget.enchant.js v0.2.0+
 * @author Ubiquitous Entertainment Inc.
 * @description
 [lang:ja]
 * タッチ位置のブレを吸収したドラッグイベントを使用するためのプラグイン.
 [/lang]
 */

(function() {

/**
 * @type {Object}
 */
enchant.widget.draggable = {};

/**
 [lang:ja]
 * {@link enchant.Event#DRAG_START}の発生後, {@link enchant.Event#DRAG_MOVE}が発生するまでに無視する移動量.
 [/lang]
 */
enchant.ENV.DRAG_THRETHOLD_LENGTH = 25;

/**
 [lang:ja]
 * Entityに対するドラッグが始まったときに発生するイベント.
 * {@link enchant.widget.draggable#toDraggable}に渡されたEntityから発生する.
 * 発行するオブジェクト: {@link enchant.Entity}
 [/lang]
 * @type {String}
 */
enchant.Event.DRAG_START = 'dragstart';

/**
 [lang:ja]
 * Entityに対するドラッグが移動したときに発生するイベント.
 * {@link enchant.widget.draggable#toDraggable}に渡されたEntityから発生する.
 * 発行するオブジェクト: {@link enchant.Entity}
 [/lang]
 * @type {String}
 */
enchant.Event.DRAG_MOVE = 'dragmove';

/**
 [lang:ja]
 * Entityに対するドラッグが移動したときに発生するイベント.
 * {@link enchant.widget.draggable#toDraggable}に渡されたEntityから発生する.
 * 発行するオブジェクト: {@link enchant.Entity}
 [/lang]
 * @type {String}
 */
enchant.Event.DRAG_END = 'dragend';

var dragStartEvent = new enchant.Event(enchant.Event.DRAG_START);
var dragMoveEvent = new enchant.Event(enchant.Event.DRAG_MOVE);
var dragEndEvent = new enchant.Event(enchant.Event.DRAG_END);

/**
 * 指定したEntityから {@link enchant.Event#DRAG_START}, {@link enchant.Event#DRAG_MOVE}, {@link enchant.Event#DRAG_END}イベントを発生させるようにする.
 * DRAG_START, DRAG_ENDはそれぞれ[@link enchant.Event#TOUCH_START}, {@link enchant.Event#TOUCH_END}と同じタイミングで発生する.
 * DRAG_MOVEはタッチ位置が{@link enchant.ENV#DRAG_THRETHOLD_LENGTH}だけ移動するまで発行されない.
 * @param {enchant.Entity} entity 対象のEntity.
 * @static
 */
enchant.widget.draggable.toDraggable = function(entity) {
    var threthold = 0;
    var lastX, lastY;
    entity.addEventListener(enchant.Event.TOUCH_START, function(e) {
        threthold = 0;
        lastX = e.x;
        lastY = e.y;
        dragStartEvent.x = e.x;
        dragStartEvent.y = e.y;
        this.dispatchEvent(dragStartEvent);
    });
    entity.addEventListener(enchant.Event.TOUCH_MOVE, function(e) {
        var dx = e.x - lastX;
        var dy = e.y - lastY;
        threthold += dx * dx + dy * dy;
        if (threthold > enchant.ENV.DRAG_THRETHOLD_LENGTH) {
            dragMoveEvent.x = e.x;
            dragMoveEvent.y = e.y;
            this.dispatchEvent(dragMoveEvent);
        }
        lastX = e.x;
        lastY = e.y;
    });
    entity.addEventListener(enchant.Event.TOUCH_END, function(e) {
        dragEndEvent.x = e.x;
        dragEndEvent.y = e.y;
        this.dispatchEvent(dragEndEvent);
    });
};

}());
