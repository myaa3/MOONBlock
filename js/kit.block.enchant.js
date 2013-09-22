(function() {

enchant.block.kit = {
    assets: [
        'images/kit_line.png',
        'images/kit_box.png'
    ]
};

var dragging, dragStarted;

var E_S = new enchant.Event(enchant.Event.DRAG_START);
var E_M = new enchant.Event(enchant.Event.DRAG_MOVE);
var E_E = new enchant.Event(enchant.Event.DRAG_END);
var _ontouchstart = function(e) {
    var _manager = enchant.block.Manager.instance;
    var game = enchant.Game.instance;
    var group = _manager.targetGroup;
    var ox = group._offsetX, oy = group._offsetY,
        sx = group.scaleX, sy = group.scaleY;
    if (!dragging) {
        dragging = new this.Constructor();
        dragging.x = (this._offsetX - ox + e.localX) / sx - e.localX;
        dragging.y = (this._offsetY - oy + e.localY) / sy - e.localY;
        group.addChild(dragging);
        E_S.x = e.x;
        E_S.y = e.y;
        dragging.dispatchEvent(E_S);
        E_M.x = e.x;
        E_M.y = e.y;
        dragging.dispatchEvent(E_M);
    }
};

var _ontouchmove = function(e) {
    var game = enchant.Game.instance;
    if (dragging) {
        E_M.x = e.x;
        E_M.y = e.y;
        dragStarted = true;
        dragging.dispatchEvent(E_M);
    }
};

var _ontouchend = function(e) {
    var _manager = enchant.block.Manager.instance;
    var game = enchant.Game.instance;
    if (dragging) {
        E_E.x = e.x;
        E_E.y = e.y;
        dragging.dispatchEvent(E_E);
        if (!dragStarted) {
            dragging.parentNode.removeChild(dragging);
            _manager.targetGroup.addChild(dragging);
        }
        dragStarted = false;
    }
    dragging = null;
};

enchant.block.kit.ActionKitItem = enchant.Class.create(enchant.widget.EntityGroup, {
    initialize: function(Constructor) {
        enchant.widget.EntityGroup.call(this);
        this.Constructor = Constructor;
        var thumb = this._thumb = new enchant.Sprite(32, 32);
        this.addChild(thumb);

        enchant.widget.draggable.toDraggable(this);
        this.addEventListener(enchant.Event.DRAG_START, function(e) {
            var kitBox = this.parentNode;
            _ontouchstart.call(this, e);
        });
        this.addEventListener(enchant.Event.DRAG_MOVE, _ontouchmove);
        this.addEventListener(enchant.Event.DRAG_END, _ontouchend);
    },
    createRenderQueue: function() {
        return function() {
            // dirty hack
            var Constructor = this.Constructor;
            var sf = enchant.block.Block.createBlockImageSurface(
                new (enchant.Class.create(Constructor, {
                    initialize: function() {
                        Constructor.apply(this, arguments);
                        this.fillColor = null;
                    }
                }))());
            var thumb = this._thumb;
            this.width = thumb.width = sf.width;
            this.height = thumb.height = sf.height;
            thumb.image = sf;
            thumb.alignHorizontalCenterIn(this).alignVerticalCenterIn(this);
        }.bind(this);
    }
});

enchant.block.kit.ActionKitLid = enchant.Class.create(enchant.Sprite, {
    initialize: function() {
        var image = enchant.Core.instance.assets['images/kit_line.png'];
        enchant.Sprite.call(this, image.width, image.height);
        this.image = image;
        this.originX = this.originY = 0;
    }
});

enchant.block.kit.ActionKitBox = enchant.Class.create(enchant.widget.EntityGroup, {
    initialize: function(text) {
        var image = enchant.Core.instance.assets['images/kit_box.png'];
        enchant.widget.EntityGroup.call(this, image.width, image.height);
        enchant.widget.draggable.toDraggable(this);
        this.background = image;
        var label = this.label = enchant.widget.parseContent(text || '', '24px helvetica', '#ffffff');
        label.alignHorizontalCenterIn(this);
        label.y = 12;
        this.addChild(label);
        this.items = {};
        this.itemsNum = 0;
        this.lid = new enchant.block.kit.ActionKitLid();
        this.lid.x = 4;
        this.lid.y = 44;
        this.addChild(this.lid);

        this.queue = [];

        this._folded = true;
        this.lidAngle = 0;
        var moved;
        this.addEventListener(enchant.Event.DRAG_MOVE, function(e) {
            moved = true;
        });
        this.addEventListener(enchant.Event.DRAG_END, function(e) {
            if (moved || this.parentNode._anim) {
                moved = false;
                return;
            }
            if (this.parentNode._unfoldedKit) {
                this.parentNode._unfoldedKit.fold();
            }
            if (this._folded) {
                this.unfold(e);
            } else {
                this.fold(e);
            }
        });
    },
    lidAngle: {
        get: function() {
            return this.lid.rotation * Math.PI / 180;
        },
        set: function(rad) {
            this.lid.rotation = rad * 180 / Math.PI;
        }
    },
    addItem: function(name, Constructor) {
        var item = new enchant.block.kit.ActionKitItem(Constructor);
        this.items[name] = item;
        this.itemsNum++;
        this.queue.push(item.createRenderQueue());
    },
    removeItem: function(name) {
        var result = delete this.items[name];
        if (result) {
            this.itemsNum--;
        }
        return result;
    },
    hideItem: function(name) {
        var item = this.items[name];
        if (!item) {
            return;
        }
        item.visible = false;
    },
    appearItem: function(name) {
        var item = this.items[name];
        if (!item) {
            return;
        }
        item.visible = true;
    },
    addItems: function(category) {
        for (var prop in category) {
            this.addItem(prop, category[prop]);
        }
    },
    openLid: function() {
        return this.tl
            .tween({
                lidAngle: Math.PI / 12,
                time: 15,
                easing: enchant.Easing.QUART_EASEOUT
            });
    },
    closeLid: function() {
        return this.tl
            .tween({
                lidAngle: 0,
                time: 10,
                easing: enchant.Easing.CUBIC_EASEIN
            });
    },
    fold: function(e) {
        var item, i;
        if (!this._folded && !this._anim) {
            this._anim = true;
            this.parentNode._anim = true;
            i = 0;
            for (var prop in this.items) {
                item = this.items[prop];
                if (item.parentNode === null) {
                    continue;
                }
                item.tl
                    .delay(i++)
                    .moveTo(0, this.height - item.height, 10, enchant.Easing.CUBIC_EASEIN)
                    .then(function() {
                        this.parentNode.removeChild(this);
                    });
            }
            this.closeLid()
                .delay(1 + i)
                .then(function() {
                    this._folded = true;
                    this._anim = false;
                    this.parentNode._anim = false;
                });
        }
    },
    unfold: function(e) {
        if (this.queue.length) {
            while (this.queue.length) {
                this.queue.shift()();
            }
        }
        var item, y, i, max;
        if (this._folded && !this._anim) {
            this._anim = true;
            this.parentNode._anim = true;
            y = this.height - 32;
            i = 0;
            max = this.itemsNum;
            for (var prop in this.items) {
                item = this.items[prop];
                if (!item.visible) {
                    continue;
                }
                item.y = -500;
                item.tl
                    .delay(max - i++)
                    .moveTo(0, y + 32 + 30, 15, enchant.Easing.QUART_EASEOUT);
                this.addChild(item);
                y += item.height;
            }
            this.openLid()
                .delay(1)
                .then(function() {
                    this._folded = false;
                    this._anim = false;
                    this.parentNode._anim = false;
                    this.parentNode._unfoldedKit = this;
                });
        }
    }
});

enchant.block.kit.ActionKitBar = enchant.Class.create(enchant.widget.EntityGroup, {
    initialize: function() {
        var manager = enchant.block.Manager.instance;
        enchant.widget.EntityGroup.call(this);
        enchant.widget.input.enableStopTouchPropagation(this);
        enchant.widget.draggable.toDraggable(this);
        enchant.widget.focus.toFocusTarget(this);
        this._dragging = false;
        this._scrolling = false;
        this._selected = 0;
        this._anim = false;
        this._unfoldedKit = null;
        this.box = {};
        this.load(manager.namespace);
        this._setItemOpacity();

        this.addEventListener(enchant.Event.ENTER_FRAME, this._onenterframe);
        this.addEventListener(enchant.Event.DRAG_START, this._ontouchstart);
        this.addEventListener(enchant.Event.DRAG_MOVE, this._ontouchmove);
        this.addEventListener(enchant.Event.DRAG_END, this._ontouchend);

        var bar = this;
        manager.addEventListener(enchant.Event.BLOCK_IMPORTED, function(e) {
            bar.load(e.modified);
        });

        this.addEventListener(enchant.Event.BLUR, function(e) {
            if (this._unfoldedKit) {
                this._unfoldedKit.fold();
            }
        });
    },
    _onenterframe: function(e) {
        var d, target;
        if (!this._dragging && this._scrolling) {
            target = -this._selected * 178 + 8;
            d = (target - this._x) / 5;
            if (Math.abs(d) < 0.01) {
                this.x = target;
                this._scrolling = false;
            } else {
                this.x += d;
            }
        }
    },
    _ontouchstart: function(e) {
        this._tx = e.x;
        this._scrolling = false;
    },
    _ontouchmove: function(e) {
        var dx;
        if (!dragging) {
            dx = e.x - this._tx;
            this.x += dx;
            this._tx = e.x;
        }
        this._dragging = true;
    },
    _ontouchend: function(e) {
        if (this._scrolling) {
            return;
        }
        var xx = -this._selected - this._x / 178;
        var s = xx / Math.abs(xx) || 0;
        var n = ~~(xx + 0.75 * s);
        if (this._dragging) {
            this._selected = Math.max(0, Math.min(this._selected + n, this.childNodes.length - 1));
        } else {
            this._selected = Math.max(0, Math.min(Math.floor(e.localX / 178), this.childNodes.length - 1));
        }
        this._setItemOpacity();
        this._dragging = false;
        this._scrolling = true;
    },
    _setItemOpacity: function() {
        var child;
        for (var i = 0, l = this.childNodes.length; i < l; i++) {
            child = this.childNodes[i];
            // at present, canvaslayer does not inherit opacity when render node tree.
            // canvaslayer has problem of compatibility with css3#opacity.
            child.opacity = child.lid.opacity = child.label.opacity = 1 / (Math.pow(Math.abs(this._selected - i), 1) + 1);
        }
    },
    load: function(namespace) {
        var category, box, last;
        for (var prop in namespace) {
            category = namespace[prop];
            if (this.box[prop]) {
                box = this.box[prop];
            } else {
                box = this.box[prop] = new enchant.block.kit.ActionKitBox(prop);
                last = this.lastChild;
                if (last) {
                    box.alignRightOf(last, 8);
                }
            }
            box.addItems(category);
            this.addChild(box);

            this.width = this.lastChild.x + this.lastChild.width;
            this.height = this.lastChild.y + this.lastChild.height;
        }
    }
});

}());
