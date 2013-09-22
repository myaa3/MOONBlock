/**
 * input.widget.enchant.js
 * @version 0.1.3
 * @require enchant.js v0.6.2+
 * @require widget.enchant.js v0.2.0+
 * @require event.enchant.js v0.1.0+
 * @require focus.enchant.js v0.1.0+
 * @author Ubiquitous Entertainment Inc.
 * @description
[lang:ja]
 * DOM Input elementを使用しないFormを定義したプラグイン.
[/lang]
 */

/**
 * @type {Object}
 */
enchant.widget.input = {};
enchant.widget._env.font = '13px helvetica';
enchant.widget.input._env = {
    inputTextWidth: 64,
    inputTextHeight: 18,
    selectOptionColor: '#d0d0d0',
    selectOptionSelectColor: '#a0c0ff'
};

/**
 [lang:ja]
 * Inputの内容が変化したときに発生するイベント.
 * 発行するオブジェクト: {@link enchant.widget.input.Input}
 [/lang]
 * @param {String}
 */
enchant.Event.CHANGE = 'change';

/**
 * @scope enchant.widget.input.Input.prototype
 */
enchant.widget.input.Input = enchant.Class.create(enchant.widget.EntityGroup, {
    /**
     * @name enchant.widget.input.Input
     * @class
     [lang:ja]
     * {@link enchant.widget.input.InputTextBox}, {@link enchant.widget.input.InputSelectBox}のためのベースクラス.
     [/lang]
     * @constructs
     * @extends enchant.widget.EntityGroup
     */
    initialize: function() {
        var width = enchant.widget.input._env.inputTextWidth;
        var height = enchant.widget.input._env.inputTextHeight;
        enchant.widget.EntityGroup.call(this, width, height);
        // for instanceof check
    },
    touchEnabled: {
        get: function() {
            return this._touchEnabled;
        },
        set: function(enabled) {
            this._touchEnabled = enabled;
            if (enabled) {
                this._style.pointerEvents = 'all';
            } else {
                this._style.pointerEvents = 'none';
            }
            var queue = this.childNodes.slice();
            var node;
            while (queue.length) {
                node = queue.shift();
                node.touchEnabled = enabled;
                if (node.childNodes) {
                    queue = queue.concat(node.childNodes);
                }
            }
        }
    }
});

enchant.widget.input.stopTouchPropagationHandler = function(e) {
    e.stopTouchPropagation();
};

enchant.widget.input.enableStopTouchPropagation = function(node) {
    [
        enchant.Event.TOUCH_START,
        enchant.Event.TOUCH_MOVE,
        enchant.Event.TOUCH_END
    ].forEach(function(type) {
        node.addEventListener(type, enchant.widget.input.stopTouchPropagationHandler);
    });
};

enchant.widget.input.disableStopTouchPropagation = function(node) {
    [
        enchant.Event.TOUCH_START,
        enchant.Event.TOUCH_MOVE,
        enchant.Event.TOUCH_END
    ].forEach(function(type) {
        node.removeEventListener(type, enchant.widget.input.stopTouchPropagationHandler);
    });
};

/**
 * @scope enchant.widget.input.InputTextBox.prototype
 */
enchant.widget.input.InputTextBox = enchant.Class.create(enchant.widget.input.Input, {
    /**
     * @name enchant.widget.input.InputTextBox
     * @class
     [lang:ja]
     * 自由な文字入力のためのフォーム.
     [/lang]
     * @constructs
     * @extends enchant.widget.input.Input
     */
    initialize: function() {
        var width = enchant.widget.input._env.inputTextWidth;
        var height = enchant.widget.input._env.inputTextHeight;
        /**
         [lang:ja]
         * InputTextBoxの最小の横幅.
         * @type {Number}
         [/lang]
         */
        this.minWidth = width;
        /**
         [lang:ja]
         * InputTextBoxの最小の縦幅.
         * @type {Number}
         [/lang]
         */
        this.minHeight = height;
        /**
         [lang:ja]
         * window.promptの表示に使われる文字列.
         * @type {String}
         [/lang]
         */
        this.promptString = '値を入力してください';

        this._input = new enchant.Label('');
        this._input.backgroundColor = '#ffffff';
        enchant.widget.input.Input.call(this);
        enchant.widget.focus.toFocusTarget(this, true);
        this._value = '';
        this._input.font = enchant.widget._env.font;
        this.addChild(this._input);
        this.addEventListener(enchant.Event.FOCUS, function() {
            this._inputMethod(function(val) {
                if (val !== null) {
                    this.value = val;
                }
                this.blur();
            });
        });
    },
    /**
     [lang:ja]
     * 入力の方法をラップしたメソッド.
     * 第一引数のコールバックに値を渡す形であればオーバライドできる.
     [/lang]
     * @param {Function} callback 入力結果を渡すコールバック関数.
     * @private
     */
    _inputMethod: function(callback) {
        callback.call(this, window.prompt(this.promptString, this.value));
    },
    width: {
        get: function() {
            return this._width;
        },
        set: function(width) {
            this._width = width;
            this._input.width = width;
        }
    },
    height: {
        get: function() {
            return this._height;
        },
        set: function(height) {
            this._height = height;
            this._input.height = height;
        }
    },
    /**
     [lang:ja]
     * フォームの持つ値.
     * 変更されたとき, {@link enchant.Event#CHANGE}イベントが発生する.
     * @type {String}
     [/lang]
     */
    value: {
        get: function() {
            return this._value;
        },
        set: function(value) {
            var oldValue = this._value;
            var isValueChanged = (this._value !== value);
            this._value = ('' + value).replace(/\r|\n/g, '');
            this._input.text = this._value;
            this.width = this._input.width = Math.max(this.minWidth, this._input._boundWidth);
            this.height = this._input.height = Math.max(this.minHeight, this._input._boundHeight);
            var e;
            if (isValueChanged) {
                e = new enchant.Event(enchant.Event.CHANGE);
                e.oldValue = oldValue;
                this.dispatchEvent(e);
            }
        }
    }
});

/**
 * @scope enchant.widget.input.InputSelectElement.prototype
 */
enchant.widget.input.InputSelectElement = enchant.Class.create(enchant.widget.input.Input, {
    /**
     * @name enchant.widget.input.InputSelectElement
     * @class
     [lang:ja]
     * {@link enchant.widget.input.InputSelectBox}のためのクラス.
     * 選択項目の表示にも使われる.
     [/lang]
     * @constructs
     * @extends enchant.widget.input.Input
     * @private
     */
    initialize: function(id, content) {
        var width = enchant.widget.input._env.inputTextWidth;
        var height = enchant.widget.input._env.inputTextHeight;
        enchant.widget.input.Input.call(this);
        this.content = content;
        this.width = Math.max(width, this._content.width + enchant.widget._env.listItemMargin * 2);
        this.height = Math.max(height, this._content.height);
        this.backgroundColor = '#ffffff';
        this.refresh();
        this.id = id;
    },
    /**
     * 表示を更新する.
     * @private
     */
    refresh: function() {
        var content = this._content;
        var margin = enchant.widget._env.listItemMargin;
        if (content) {
            content.alignLeftIn(this, margin).alignVerticalCenterIn(this);
        }
    },
    /**
     * 選択中かどうか.
     * 表示の色に影響する.
     * @type {Boolean}
     */
    activeColor: {
        get: function() {
            return this._activeColor;
        },
        set: function(isActive) {
            this._activeColor = !!isActive;
            if (this._activeColor) {
                this.backgroundColor = enchant.widget.input._env.selectOptionSelectColor;
            } else {
                this.backgroundColor = enchant.widget.input._env.selectOptionColor;
            }
        }
    },
    /**
     * 表示したい文字列.
     * @type {String}
     */
    content: {
        get: function() {
            return this._rawContent;
        },
        set: function(content) {
            this._rawContent = content;
            content = enchant.widget.parseContent(content, enchant.widget._env.font);
            if (this._content) {
                this.removeChild(this._content);
            }
            this.addChild(content);
            this._content = content;
            this.refresh();
        }
    }
});

/**
 * @scope enchant.widget.input.InputSelectPulldown.prototype
 */
enchant.widget.input.InputSelectPulldown = enchant.Class.create(enchant.widget.ListView, {
    /**
     * @name enchant.widget.input.InputSelectPulldown
     * @class
     [lang:ja]
     * {@link enchant.widget.input.InputSelectBox}のためのクラス.
     * プルダウンのクラス.
     [/lang]
     * @constructs
     * @extends enchant.widget.ListView
     */
    initialize: function(dict) {
        var width = enchant.widget.input._env.inputTextWidth;
        var height = enchant.widget.input._env.inputTextHeight;
        enchant.widget.ListView.call(this, width, height);
        this.addOptions(dict);
        this.height = this._content.height;
    },
    /**
     [lang:ja]
     * リストビューの項目を更新する.
     * @param {Object} dictionary 値と選択肢の連想配列.
     [/lang]
     * @private
     */
    replaceOptions: function(dict) {
        this.content.slice().forEach(function(e) {
            this.removeChild(e);
        }, this);
        this.width = enchant.widget.input._env.inputTextWidth;
        this.height = enchant.widget.input._env.inputTextHeight;
        this.addOptions(dict);
    },
    addOptions: function(dict) {
        for (var prop in dict) {
            this.addOption(prop, dict[prop]);
        }
    },
    /**
     [lang:ja]
     * リストビューの項目を追加する.
     * @param {String} id 値.
     * @param {String} content 表示のテキスト.
     [/lang]
     * @private
     */
    addOption: function(id, content) {
        var element = new enchant.widget.input.InputSelectElement(id, content);
        if (this.width < element.width) {
            this.width = element.width;
            this.content.forEach(function(e) {
                e.width = this.width;
            }, this);
        } else {
            element.width = this.width;
        }
        this.addChild(element);
        this.height = this._content.height;
    },
    /**
     [lang:ja]
     * 値から{@link enchant.widget.input.InputSelctElement}を取得する.
     * @param {String} id 値.
     * @return {enchant.widget.input.InputSelctElement} 要素.
     [/lang]
     * @private
     */
    getOptionById: function(id) {
        var elements = this.content;
        var element;
        var ret = null;
        for (var i = 0, l = elements.length; i < l; i++) {
            element = elements[i];
            if (element.id === id) {
                ret = element;
                break;
            }
        }
        return ret;
    }
});

/**
 * @scope enchant.widget.input.InputSelectBox.prototype
 */
enchant.widget.input.InputSelectBox = enchant.Class.create(enchant.widget.input.InputSelectElement, {
    /**
     * @name enchant.widget.input.InputSelectBox
     * @class
     [lang:ja]
     * プルダウンメニューから値を選択するフォーム.
     * @param {Object} dictionary 値と選択肢の連想配列.
     [/lang]
     * @constructs
     * @extends enchant.widget.input.InputSelectElement
     */
    initialize: function(dict) {
        var pulldown = new enchant.widget.input.InputSelectPulldown(dict);
        var first = pulldown.content[0];
        var width = enchant.widget.input._env.inputTextWidth;
        var height = enchant.widget.input._env.inputTextHeight;
        /**
         [lang:ja]
         * InputTextBoxの最小の横幅.
         * @type {Number}
         */
        this.minWidth = width;
        /**
         [lang:ja]
         * InputTextBoxの最小の縦幅.
         * @type {Number}
         */
        this.minHeight = height;
        enchant.widget.input.InputSelectElement.call(this);
        enchant.widget.focus.toFocusTarget(this, true);
        this._pulldown = pulldown;
        this.width = Math.max(this.minWidth, pulldown.width);
        if (first) {
            this.height = Math.max(this.minHeight, first.height);
            this.selected = first.id;
        }
        this._opened = false;
        var that = this;
        this.addEventListener(enchant.Event.REMOVED_FROM_SCENE, this.blur);
        this.addEventListener(enchant.Event.FOCUS, this._openPulldown);
        this.addEventListener(enchant.Event.BLUR, this._closePulldown);
        this._pulldown.addEventListener(enchant.Event.TOUCH_END, function(e) {
            var item = this.getSelectedItem(e);
            if (item != null) {
                that.blur();
                that.selected = item.id;
            }
            that.dispatchEvent(e);
        });
        this._pulldown.addEventListener(enchant.Event.RENDER, function() {
            if (this._pulldown.parentNode && this.scene) {
                this._pulldown.x = this._offsetX - this.scene.x;
                this._pulldown.y = this._offsetY - this.scene.y;
            }
        }.bind(this));
    },
    /**
     [lang:ja]
     * 現在選択されている値.
     * @param {String}
     [/lang]
     */
    selected: {
        get: function() {
            return this._selected;
        },
        set: function(id) {
            var oldValue = this._selected;
            var isValueChanged = this._updateContent(id);
            this._updateHighlight();
            var e;
            if (isValueChanged) {
                e = new enchant.Event(enchant.Event.CHANGE);
                e.oldValue = oldValue;
                this.dispatchEvent(e);
            }
        }
    },
    /**
     [lang:ja]
     * 現在選択されている値.
     * {@link enchant.widget.input.InputSelectBox#selected}への参照.
     * @type {String}
     [/lang]
     */
    value: {
        get: function() {
            return this.selected;
        },
        set: function(value) {
            this.selected = value;
        }
    },
    addOption: function(id, content) {
        this._pulldown.addOption(id, content);
        this._updateContent(this._selected);
        this._updateHighlight();
    },
    replaceOptions: function(dict) {
        this._pulldown.replaceOptions(dict);
        this._updateContent(this._selected);
        this._updateHighlight();
    },
    _updateContent: function(id) {
        var element = this._pulldown.getOptionById(id);
        if (element) {
            this.content = element.content;
        }
        var isValueChanged = this._selected !== id;
        this._selected = id;
        this.width = Math.max(this.minWidth, this._pulldown.width);
        return isValueChanged;
    },
    _updateHighlight: function() {
        this._pulldown.content.forEach(function(element) {
            element.activeColor = false;
        });
        var current = this._pulldown.getOptionById(this.selected);
        if (current) {
            current.activeColor = true;
        }
    },
    _openPulldown: function() {
        this._pulldown.x = this._offsetX - this.scene.x;
        this._pulldown.y = this._offsetY - this.scene.y;
        this.scene.addChild(this._pulldown);
        this._opened = true;
    },
    _closePulldown: function() {
        this._pulldown.parentNode.removeChild(this._pulldown);
        this._opened = false;
    }
});
