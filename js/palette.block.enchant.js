
if (enchant.block && enchant.block.blocks) {

(function() {

enchant.block.palette = {};

enchant.block.palette.Palette = enchant.Class.create(enchant.widget.ListView, {
    initialize: function() {
        var manager = enchant.block.Manager.instance;
        enchant.widget.ListView.call(this, 160, 240);
        enchant.widget.input.enableStopTouchPropagation(this);
        this.clipping = true;
        this._firstCategory = null;
        this._categories = {};
        this.load(manager.namespace);
        var palette = this;
        manager.addEventListener(enchant.Event.BLOCK_IMPORTED, function(e) {
            palette.load(e.modified);
        });
    },
    load: function(namespace) {
        var category, catitem;
        for (var prop in namespace) {
            category = namespace[prop];
            if (this._categories[prop]) {
                catitem = this._categories[prop];
            } else {
                catitem = new enchant.block.palette.PaletteCategoryItem(prop);
            }
            catitem.addItems(category);
            if (!catitem.parentNode) {
                this.addChild(catitem);
                catitem.palette = this;
            }
        }
    }
});

enchant.block.palette.PaletteCategoryItem = enchant.Class.create(enchant.Label, {
    initialize: function(text) {
        enchant.Label.call(this, text);
        this.width = 160;
        this.height = 24;
        this.backgroundColor = '#a0a0a0';
        this.blockitems = [];
        this.palette = null;
        this._folding = true;
        this.addEventListener(enchant.Event.TAP, this.toggle);
        this.addEventListener(enchant.Event.DOUBLETAP, this.toggle);
    },
    addItem: function(name, Constructor) {
        // TODO mock sprite
        this.blockitems.push(new enchant.block.palette.PaletteBlockItem(name, Constructor));
    },
    addItems: function(category) {
        for (var prop in category) {
            this.addItem(prop, category[prop]);
        }
    },
    _fold: function() {
        if (this._folding) {
            return;
        }
        this.blockitems.forEach(function(label) {
            this.palette.removeChild(label);
        }, this);
        this._folding = true;
    },
    _unfold: function() {
        if (!this._folding) {
            return;
        }
        var i = this.palette.content.indexOf(this);
        var next = null;
        if (i !== -1) {
            next = this.palette.content[i + 1];
        }
        this.blockitems.forEach(function(label) {
            this.palette.insertBefore(label, next);
        }, this);
        this._folding = false;
    },
    toggle: function() {
        if (this._folding) {
            this._unfold();
        } else {
            this._fold();
        }
    }
});

enchant.block.palette.PaletteBlockItem = enchant.Class.create(enchant.widget.EntityGroup, {
    initialize: function(text, Constructor) {
        enchant.widget.EntityGroup.call(this, 0, 0);
        this.backgroundColor = '#e0e0e0';
        this.Constructor = Constructor;
        var label = new enchant.Label(text);
        label.height = 16;
        var margin = 8;
        var sf = enchant.block.Block.createBlockImageSurface(new Constructor());
        var blockThumb = this._thumb = new enchant.Sprite(sf.width, sf.height);
        blockThumb.image = sf;
        label.width = blockThumb.width;
        blockThumb.alignBottomOf(label, 8);
        this.width = blockThumb.width;
        this.height = label.height + blockThumb.height + margin * 2;

        this.addChild(label);
        this.addChild(blockThumb);

        this.addEventListener(enchant.Event.HOLD, _ontouchstart);
        this.addEventListener(enchant.Event.TOUCH_MOVE, _ontouchmove);
        this.addEventListener(enchant.Event.RELEASE, _ontouchend);
    }
});

// TODO dirty
var dragging, dragStarted;

var E_S = new enchant.Event(enchant.Event.TOUCH_START);
var E_M = new enchant.Event(enchant.Event.TOUCH_MOVE);
var E_E = new enchant.Event(enchant.Event.TOUCH_END);
var _ontouchstart = function(e) {
    var _manager = enchant.block.Manager.instance;
    if (!dragging) {
        dragging = new this.Constructor();
        dragging.x = this._thumb._offsetX;
        dragging.y = this._thumb._offsetY;
        _manager.targetGroup.scene.addChild(dragging);
        E_S.x = e.x;
        E_S.y = e.y;
        dragging.dispatchEvent(E_S);
    }
};

var _ontouchmove = function(e) {
    if (dragging) {
        E_M.x = e.x;
        E_M.y = e.y;
        dragStarted = true;
        dragging.dispatchEvent(E_M);
    }
};

var _ontouchend = function(e) {
    var _manager = enchant.block.Manager.instance;
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

})();

}
