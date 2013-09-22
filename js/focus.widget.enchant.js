/**
 * focus.widget.enchant.js
 * @version 0.1.0
 * @require enchant.js v0.6.2+
 * @require widget.enchant.js v0.2.0+
 * @require event.enchant.js v0.1.0+
 * @require draggable.enchant.js v0.1.0+
 * @author Ubiquitous Entertainment Inc.
 * @description
 [lang:ja]
 * enchant.jsでfocus, blurイベントを発生させるようにするためのプラグイン.
 [/lang]
 */

(function() {

//enchant.ENV.CURRENT_FOCUS_ITEM = null;
var CURRENT_FOCUS_ITEM = null;

/**
 * @type {Object}
 */
enchant.widget.focus = {};

/**
 [lang:ja]
 * Entityにフォーカスしたときに発生するイベント.
 * {@link enchant.widget.focus#toFocusTarget}に渡されたEntityから発生する.
 * 発行するオブジェクト: {@link enchant.Entity}
 [/lang]
 * @type {String}
 */
enchant.Event.FOCUS = 'focus';

/**
 [lang:ja]
 * Entityのフォーカスが外れたときに発生するイベント.
 * {@link enchant.widget.focus#toFocusTarget}に渡されたEntityから発生する.
 * 発行するオブジェクト: {@link enchant.Entity}
 [/lang]
 * @type {String}
 */
enchant.Event.BLUR = 'blur';

/**
 * @scope enchant.widget.focus.FocusTouchEventManager.prototype
 */
enchant.widget.focus.FocusTouchEventManager = enchant.Class.create(enchant.EventTarget, {
    /**
     * @name enchant.widget.focus.FocusTouchEventManager
     * @class
     [lang:ja]
     * フォーカスイベントを管理するクラス.
     * インスタンスは一つしか存在することができず, 読み込み時にインスタンスを作成する.
     * ユーザが直接使用することはない.
     [/lang]
     * @constructs
     * @extends enchant.EventTarget
     * @private
     */
    initialize: function() {
        var core = enchant.Core.instance;
        if (enchant.widget.focus.FocusTouchEventManager.instance) {
            return enchant.widget.focus.FocusTouchEventManager.instance;
        }
        enchant.EventTarget.call(this);
        this.addEventListener(enchant.Event.TOUCH_END, function() {
            if (becomefocus) {
                focus.call(becomefocus);
            } else if (CURRENT_FOCUS_ITEM) {
                blur.call(CURRENT_FOCUS_ITEM);
            }
            becomefocus = null;
        });
    }
});
/**
 [lang:ja]
 * FocusTouchEventManagerのインスタンス.
 [/lang]
 [lang:en]
 * The Current Manager instance.
 [/lang]
 * @type {enchant.widget.focus.FocusTouchEventManager}
 * @static
 */
enchant.widget.focus.FocusTouchEventManager.instance = new enchant.widget.focus.FocusTouchEventManager();

var becomefocus = null;

var focusEvent = new enchant.Event(enchant.Event.FOCUS);
focusEvent.blur = null;
var blurEvent = new enchant.Event(enchant.Event.BLUR);
blurEvent.focus = null;

var focusControl = function(e) {
    becomefocus = this;
};

var focusIgnore = function(e) {
    if (becomefocus === this) {
        becomefocus = null;
    }
};

var sceneTouch = function(e) {
    enchant.widget.focus.FocusTouchEventManager.instance.dispatchEvent(e);
};

/**
 * @memberOf enchant.Entity.prototype
 [lang:ja]
 * Entityにフォーカスする.
 * {@link enchant.widget.focus#toFocusTarget} を使用することでこのメソッドが追加される.
 [/lang]
 */
var focus = function() {
    if (CURRENT_FOCUS_ITEM) {
        if (this === CURRENT_FOCUS_ITEM) {
            return;
        } else {
            blurEvent.focus = this;
            blur.call(CURRENT_FOCUS_ITEM);
        }
    } else {
        focusEvent.blur = null;
        blurEvent.focus = null;
    }
    CURRENT_FOCUS_ITEM = this;
    this.dispatchEvent(focusEvent);
};

/**
 * @memberOf enchant.Entity.prototype
 [lang:ja]
 * Entityからフォーカスを外す.
 * {@link enchant.widget.focus#toFocusTarget} を使用することでこのメソッドが追加される.
 [/lang]
 */
var blur = function() {
    if (CURRENT_FOCUS_ITEM !== this) {
        return;
    }
    CURRENT_FOCUS_ITEM = null;
    focusEvent.blur = this;
    blurEvent.focus = becomefocus;
    this.dispatchEvent(blurEvent);
};

/**
 [lang:ja]
 * 現在フォーカスしているEntityを返す.
 * @return {enchant.Entity}
 [/lang]
 * @static
 */
enchant.widget.focus.getCurrentFocusedItem = function() {
    return CURRENT_FOCUS_ITEM;
};

/**
 [lang:ja]
 * 指定したEntityから{@link enchant.Event#FOCUS}, {@link enchant.Event#BLUR}イベントを発生させるようにする.
 * 対象がタッチされたとき, 直前までフォーカスを持っていたEntityにBLURイベントが発生し,
 * 対象にフォーカスが移り, FOCUSイベントが発生する.
 * すでにフォーカスを持っているEntityに続けてタッチした場合はFOCUSイベントは発生しない.
 * シーンなどをタッチすることによってもEntityのフォーカスは外れる.
 * @param {enchant.Entity} entity 対象のEntity.
 [/lang]
 * @static
 */
enchant.widget.focus.toFocusTarget = function(entity, dragCancel) {
    enchant.widget.draggable.toDraggable(entity);
    entity.focus = focus;
    entity.blur = blur;
    entity.addEventListener(enchant.Event.ADDED_TO_SCENE, function() {
        this.addEventListener(enchant.Event.DRAG_START, focusControl);
        if (dragCancel) {
            this.addEventListener(enchant.Event.DRAG_MOVE, focusIgnore);
        }
        this.scene.addEventListener(enchant.Event.TOUCH_END, sceneTouch);
    });
    entity.addEventListener(enchant.Event.REMOVED_FROM_SCENE, function() {
        this.removeEventListener(enchant.Event.DRAG_START, focusControl);
        this.removeEventListener(enchant.Event.DRAG_MOVE, focusIgnore);
    });
};

if (typeof enchant.Event.prototype.stopTouchPropagation === 'function') {
    enchant.Event.prototype.stopTouchPropagation = function() {
        this._cancel = true;
        enchant.widget.focus.FocusTouchEventManager.instance.dispatchEvent(this);
    };
}

}());
