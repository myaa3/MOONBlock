(function() {

enchant.block._env.useDropdown = true;

enchant.block.dropdown = {
    assets: [
        'images/dropdown.9.png'
    ]
};

var _off = function(src) {
    return 'images/button/' +src + '_off.png';
};

var _on = function(src) {
    return 'images/button/' + src + '_on.png';
};

[
    'appear_one', 'appear_random', 'bigger_horizontal', 'bigger',
    'bigger_vertical', 'dir_8', 'dir_down', 'dir_horizontal',
    'dir_left', 'dir_leftdown', 'dir_leftup', 'dir_random',
    'dir_right', 'dir_rightdown', 'dir_rightup', 'dir_up',
    'dir_vertical', 'rot_ccw', 'rot_cw', 'smaller_horizontal',
    'smaller', 'smaller_vertical'
].forEach(function(name) {
    enchant.block.dropdown.assets.push(_off(name), _on(name));
});

enchant.block.dropdown.APPEAR = {
    'appear_one': 'standAlone',
    'appear_random': 'randomSetup',
    'dir_left': 'randomAppearRight',
    'dir_right': 'randomAppearLeft',
    'dir_up': 'randomAppearBottom',
    'dir_down': 'randomAppearTop'
};

enchant.block.dropdown.ZIGZAG = {
    'dir_horizontal': 'X',
    'dir_vertical': 'Y'
};

enchant.block.dropdown.TAP = {
    'dir_horizontal': 'X',
    'dir_vertical': 'Y',
    'dir_8': ''
};

enchant.block.dropdown.MOVE = {
    'dir_leftup': 'Left", "moveUp',
    'dir_up': 'Up',
    'dir_rightup': 'Right", "moveUp',
    'dir_left': 'Left',
    'dir_random': 'RandomDir',
    'dir_right': 'Right',
    'dir_leftdown': 'Left", "moveDown',
    'dir_down': 'Down',
    'dir_rightdown': 'Right", "moveDown'
};

enchant.block.dropdown.BIGGER = {
    'bigger_horizontal': 'X',
    'bigger_vertical': 'Y',
    'bigger': ''
};

enchant.block.dropdown.SMALLER = {
    'smaller_horizontal': 'X',
    'smaller_vertical': 'Y',
    'smaller': ''
};

enchant.block.dropdown.ROT = {
    'rot_cw': '1',
    'rot_ccw': '-1'
};

var decode = function(obj) {
    var buttons = [];
    var value, button;
    for (var prop in obj) {
        value = obj[prop];
        button = new enchant.block.dropdown.IconButton(value, _off(prop), _on(prop));
        buttons.push(button);
    }
    return buttons;
};

var toSf = function(src) {
    if (typeof src === 'string') {
        src = enchant.Core.instance.assets[src];
    }
    if (!(src instanceof enchant.Surface)) {
        throw new Error('asset does not found');
    }
    return src;
};

enchant.block.dropdown.IconButton = enchant.Class.create(enchant.widget.EntityGroup, {
    initialize: function(value, src_off, src_on) {
        enchant.widget.EntityGroup.call(this);
        this.addEventListener(enchant.Event.TOUCH_START, this._ontouchstart);
        this.addEventListener(enchant.Event.TOUCH_END, this._ontouchend);
        this.value = value;
        this.image = this._off = toSf(src_off);
        this._on = toSf(src_on);
        this.background = this._off;
        this.width = this.background.width;
        this.height = this.background.height;
    },
    _ontouchstart: function() {
        this.background = this._on;
    },
    _ontouchend: function(e) {
        this.background = this._off;
    }
});

enchant.block.dropdown._InputIconSelectBox = enchant.Class.create(enchant.widget.input.Input, {
    initialize: function(tileDropDown, sp) {
        enchant.widget.input.Input.call(this);
        enchant.widget.focus.toFocusTarget(this, true);
        this.width = this.height = this._minWidth = this._minHeight = 32;
        this.dropdown = tileDropDown;
        this.addEventListener(enchant.Event.FOCUS, function() {
            if (this._waiting) {
                return;
            }
            this._waiting = true;
            this._inputMethod(function(value) {
                var oldValue = this.value;
                this.value = value;
                this._waiting = false;
                var e = new enchant.Event(enchant.Event.CHANGE);
                e.oldValue = oldValue;
                this.dispatchEvent(e);
            });
        });
        this.sp = sp;
        if (sp) {
            this.thumb = new enchant.Sprite(this.width, this.height);
            this.addChild(this.thumb);
        }
        this.value = this.dropdown._tileElements[0].value;
    },
    minWidth: {
        get: function() {
            return this._minWidth;
        },
        set: function(w) {
            this._minWidth = w;
            this.width = Math.max(this._width, w);
            if (this.sp) {
                this.thumb.width = this.width;
            } else {
                this._updateThumb();
            }
        }
    },
    minHeight: {
        get: function() {
            return this._minHeight;
        },
        set: function(h) {
            this._minHeight = h;
            this.height = Math.max(this._height, h);
            if (this.sp) {
                this.thumb.height = this.height;
            } else {
                this._updateThumb();
            }
        }
    },
    selected: {
        get: function() {
            return this.value;
        },
        set: function(selected) {
            this.value = selected;
        },
    },
    value: {
        get: function() {
            return this._value;
        },
        set: function(val) {
            this._value = val;
            this.dropdown.value = val;
            this._updateThumb();
        }
    },
    frame: {
        get: function() {
            if (this.sp) {
                return this.thumb.frame;
            } else {
                return null;
            }
        },
        set: function(frame) {
            if (this.sp) {
                this.thumb.frame = frame;
                this.dropdown._tileElements.forEach(function(elem) {
                    if (frame instanceof Array) {
                        elem.frame = frame.slice();
                    } else {
                        elem.frame = frame;
                    }
                })
            }
        }
    },
    _inputMethod: function(callback) {
        var scene = this.scene;
        var dropdown = this.dropdown;
        dropdown.alignHorizontalCenterIn(scene).alignVerticalCenterIn(scene);
        dropdown.target = this;
        var endInput = function(e) {
            callback.call(dropdown.target, dropdown.selected.value);
            dropdown.target = null;
            if (dropdown.parentNode) {
                dropdown.parentNode.removeChild(dropdown);
            }
        };
        this.onblur = function(e) {
            if (e.focus === dropdown) {
                return;
            }
            endInput.apply(this, arguments);
        };
        dropdown.onblur = endInput;

        scene.addChild(dropdown);
        //dropdown.focus();
    },
    _updateThumb: function() {
        if (this.sp) {
            this.thumb.image = this.dropdown.selected.image;
        } else {
            this.background = this.dropdown.selected.image;
        }
    },
    _serializeVariableNames: enchant.block.InputSelectBox.prototype._serializeVariableNames,
    combo: enchant.block.InputSelectBox.prototype.combo
});

enchant.block.dropdown.InputIconSelectBox = enchant.Class.create(enchant.block.dropdown._InputIconSelectBox, {
    initialize: function(elements, sp) {
        enchant.block.dropdown._InputIconSelectBox.call(this, new enchant.block.dropdown.TileDropDown(elements), sp);
    }
});

function tileTap(e) {
    var lx = e.localX;
    var ly = e.localY;
    if (0 < lx && lx < this.width && 0 < ly && ly < this.height) {
        this.dispatchEvent(new enchant.Event(enchant.Event.TAP));
        e.selected = this;
    }
}

enchant.block.dropdown.TileDropDown = enchant.Class.create(enchant.widget.EntityGroup, {
    initialize: function(tileElements, om, im) {
        var core = enchant.Core.instance;
        enchant.widget.EntityGroup.call(this);
        enchant.widget.focus.toFocusTarget(this);
        var sf = core.assets['images/dropdown.9.png'];
        this.background = new enchant.widget.Ninepatch(sf.width, sf.height);
        this.background.src = sf;

        this.tileElements = tileElements;

        this.addEventListener(enchant.Event.TOUCH_END, function(e) {
            if (e.selected) {
                this.value = e.selected.value;
            }
        });
        this.addEventListener(enchant.Event.FOCUS, function() {
            this.blur();
            if (this.parentNode) {
                this.parentNode.removeChild(this);
            }
        });
    },
    tileElements: {
        get: function() {
            return this._tileElements;
        },
        set: function(tileElements) {
            this._tileElements = tileElements;
            this._update();
        }
    },
    _update: function() {
        var tileElements = this._tileElements;
        var sq = Math.sqrt(tileElements.length);
        var xNum = Math.round(sq);
        var yNum = Math.ceil(tileElements.length / xNum);
        om = (typeof om === 'number') ? om : 32;
        im = (typeof im === 'number') ? im : 16;
        var i, button;
        for (var y = 0; y < yNum; y++) {
            for (var x = 0; x < xNum; x++) {
                i = y * xNum + x;
                if (i < tileElements.length) {
                    button = tileElements[i];
                    button.x = x * (button.width + im) + om;
                    button.y = y * (button.height + im) + om;
                    button.addEventListener(enchant.Event.TOUCH_END, tileTap);
                    this.addChild(button);
                }
            }
        }
        if (tileElements[0]) {
            this.value = tileElements[0].value;
        }
        this.width = xNum * (button.width + im) + om * 2 - im;
        this.height = yNum * (button.height + im) + om * 2 - im;
    },
    value: {
        get: function() {
            return this._value;
        },
        set: function(val) {
            this._value = val;
            var element;
            for (var prop in this._tileElements) {
                element = this._tileElements[prop];
                if (element.value === val) {
                    this.selected = element;
                    break;
                }
            }
        }
    }
});

enchant.block.dropdown.InputPuppetIconSelectBox = enchant.Class.create(enchant.block.dropdown._InputIconSelectBox, {
    initialize: function() {
        var dropDown = enchant.block.dropdown.InputPuppetIconSelectBox.getDropDown();
        enchant.block.dropdown._InputIconSelectBox.call(this, dropDown, true);
        this.backgroundColor = '#ffffff';
    }
});
enchant.block.dropdown.InputPuppetIconSelectBox.getDropDown = function() {
    if (!this._dropdown) {
        this._dropdown = new enchant.block.dropdown.TileDropDown(enchant.puppet.getImageThumbs());
    }
    return this._dropdown;
};

var override = {
    /*
    appeartype: enchant.block.dropdown.APPEAR,
    zigzagdirection: enchant.block.dropdown.ZIGZAG,
    movedirection: enchant.block.dropdown.MOVE,
    tapdirection: enchant.block.dropdown.TAP,
    biggerdir: enchant.block.dropdown.BIGGER,
    smallerdir: enchant.block.dropdown.SMALLER,
    rotdir: enchant.block.dropdown.ROT
    */
};

var _addSelectForm = enchant.block.Block.prototype.addSelectForm;
enchant.block.Block.prototype.addSelectForm = function(opt, name) {
    if (enchant.block._env.useDropdown && override[name]) {
        return this._addElement(new enchant.block.dropdown.InputIconSelectBox(decode(override[name])), name, true);
    } else {
        return _addSelectForm.apply(this, arguments);
    }
};

}());
