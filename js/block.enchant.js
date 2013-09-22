/**
 * block.enchant.js
 * @version 0.2.2
 * @require enchant.js v0.6.3+
 * @require widget.enchant.js v0.2.0+
 * @require event.enchant.js v0.1.0+
 * @require draggable.enchant.js v0.1.0+
 * @require focus.enchant.js v0.1.0+
 * @require input.enchant.js v0.1.2+
 * @require slidebar.widget.enchant.js v0.1.1+
 * @author Ubiquitous Entertainment Inc.
 *
 * @description
[lang:ja]
 * enchant.jsでBlockyライクなビジュアルプログラム環境を提供するためのライブラリ.
[/lang]
 */

if (enchant && enchant.widget) {

(function() {

/**
 * @type {Object}
 */
enchant.block = {};
enchant.block.blocks = {};

enchant.block._env = {
    blockLabelColor: '#000000',
    blockLabelFont: '14px helvetica',
    blockEdgeColor: '#db7093',
    blockFillColor: null
};

/**
 [lang:ja]
 * 新しいブロックのサブクラスがManagerに読み込まれたときに発生するイベント.
 * ブロックの定義はenchant.block.Manager#importNamespaceの呼び出しによって上書きされる可能性がある.
 * Event#modifiedから読み込まれたクラス定義を取得することができる.
 * 発行するオブジェクト: {@link enchant.block.Manager}
 [/lang]
 * @param {String}
 */
enchant.Event.BLOCK_IMPORTED = 'blockimported';

/**
 [lang:ja]
 * ブロックのインスタンスの生成が完了したときに発生するイベント.
 * 発行するオブジェクト: {@link enchant.block.Block}
 [/lang]
 * @param {String}
 */
enchant.Event.INITIALIZE_END = 'initializeend';

/**
 [lang:ja]
 * 新しいブロックのインスタンスがManagerの管理するGroupに追加されたときに発生するイベント.
 * Event#blockから追加されたブロックのインスタンスを取得することができる.
 * 発行するオブジェクト: {@link enchant.block.Manager}
 [/lang]
 * @param {String}
 */
enchant.Event.BLOCK_ADDED = 'blockadded';

/**
 [lang:ja]
 * 新しいブロックのインスタンスがManagerの管理するGroupから削除されたときに発生するイベント.
 * Event#blockから削除されたブロックのインスタンスを取得することができる.
 * 発行するオブジェクト: {@link enchant.block.Manager}
 [/lang]
 * @param {String}
 */
enchant.Event.BLOCK_REMOVED = 'blockremoved';

/**
 [lang:ja]
 * Manager#registerDragTargetで登録されたEntityにブロックがドラッグされたときに発生するイベント.
 * Event#blockからドラッグされたブロックのインスタンスを取得することができる.
 * 発行するオブジェクト: Manager#registerDragTargetされた{@link enchant.Entity}
 [/lang]
 * @param {String}
 */
enchant.Event.BLOCK_RECEIVED = 'blockreceived';

/**
 [lang:ja]
 * ブロックの接続状態や変数が変更され, ブロックのサイズが変わった時に発生するイベント.
 * 内部的なイベント.
 * 発行するオブジェクト: {@link enchant.block.Receptor}, {@link enchant.block.Block}
 [/lang]
 * @param {String}
 */
enchant.Event.METRICS_CHANGED = 'metricschanged';

/**
 [lang:ja]
 * Receptorの接続状態が変化したときに発生するイベント.
 * Event#receivedから新たなConnectorを取得することができる.
 * 発行するオブジェクト: {@link enchant.block.Receptor}
 [/lang]
 * @param {String}
 */
enchant.Event.CONNECTION_CHANGED = 'connectionchanged';

/*
 * [OICH]\(_[LRTB]\)\{1,2}
 *   O:outside
 *   I:inside
 *   C:convex
 *   H:hollow
 *   L:left
 *   R:right
 *   T:top
 *   B:bottom
 */
var assetnames = {
    O_L: 'o_l.png',
    O_R: 'o_r.png',
    O_T: 'o_t.png',
    O_B: 'o_b.png',
    O_L_T: 'o_l_t.png',
    O_L_B: 'o_l_b.png',
    O_R_T: 'o_r_t.png',
    O_R_B: 'o_r_b.png',
    I_L: 'i_l.png',
    I_R: 'i_r.png',
    I_T: 'i_t.png',
    I_B: 'i_b.png',
    I_L_T: 'i_l_t.png',
    I_L_B: 'i_l_b.png',
    I_R_T: 'i_r_t.png',
    I_R_B: 'i_r_b.png',
    C_L: 'c_l.png',
    C_B: 'c_b.png',
    H_R: 'h_r.png',
    H_T: 'h_t.png',
    X: '1x1.png'
};

/*
 * images/[colorname]/***
 */
enchant.block.assets = [];

// prepare assets
var imagePath = 'images/';
(function() {
    for (var prop in assetnames) {
        enchant.block.assets.push(imagePath + 'block/' + assetnames[prop]);
    }
})();

var _manager;

var getBGAsset = function(color, alias) {
    var core = enchant.Core.instance;
    return core.assets[imagePath + 'block/' + assetnames[alias]];
};

var hex2rgbarray = function(hex) {
    return hex.match(/[0-9a-fA-F]{2}/g).map(function(n) { return parseInt(n, 16); }).concat(255);
};

var changeColor = function(sf, color) {
    var ctx = sf.context;
    var width = sf.width;
    var height = sf.height;
    var imageData = ctx.getImageData(0, 0, width, height);
    var data = imageData.data;
    var r = color[0];
    var g = color[1];
    var b = color[2];
    var a = color[3];
    var y, x, i = 0;
    for (y = 0; y < height; y++) {
        for (x = 0; x < width; x++) {
            if ((data[i] || data[i + 1] || data[i + 2] || data[i + 3]) != 0) {
                data[i] = r;
                data[i + 1] = g;
                data[i + 2] = b;
                data[i + 3] = a;
            }
            i += 4;
        }
    }
    ctx.putImageData(imageData, 0, 0);
    return sf;
};

enchant.EventTarget.prototype.on = function(types, callback) {
    var callback = arguments[arguments.length - 1];
    Array.prototype.slice.call(arguments, 0, -1).forEach(function(type) {
        this.addEventListener.call(this, type, callback);
    }, this);
    return this;
};

/**
 * @scope enchant.block.BlockBGAsset.prototype
 */
enchant.block.BlockBGAsset = enchant.Class.create({
    /**
     * @name enchant.block.BlockBGAsset
     * @class
     [lang:ja]
     * ブロックの画像を生成するための画像を管理するクラス.
     [/lang]
     * @constructs
     */
    initialize: function(obj, color) {
        var core = enchant.Core.instance;
        this.color = color;
        this.bgfrag = {};
        for (var prop in obj) {
            this._createColorAsset(prop, core.assets['images/block/' + obj[prop]]);
        }
    },
    _createColorAsset: function(name, image) {
        var sf = image.clone();
        this.bgfrag[name] = changeColor(sf, hex2rgbarray(this.color));
    },
    getFragment: function(name) {
        return this.bgfrag[name]._element;
    }
});

enchant.block.BlockBGAsset.colors = {};
enchant.block.BlockBGAsset.color = function(color) {
    if (!this.colors[color]) {
        this.colors[color] = new enchant.block.BlockBGAsset(assetnames, color);
    }
    return this.colors[color];
};

/**
 * @scope enchant.block.BlockBG.prototype
 */
enchant.block.BlockBG = enchant.Class.create(enchant.Surface, {
    /**
     * @name enchant.block.BlockBG
     * @class
     [lang:ja]
     * ブロックの画像のクラス.
     * ブロックのEntityの背景として使われる.
     * @param {enchant.block.Block} block 描画するブロック.
     * @param {String} edgeColor ブロックの枠の色.
     * @param {String} fillcolor ブロックの背景の色.
     [/lang]
     * @constructs
     * @extends enchant.Surface
     */
    initialize: function(block, edgeColor, fillColor) {
        // TODO default size
        enchant.Surface.call(this, 32, 32);
        this.block = block;
        this.iteratable = block.iteratable && !block.parallel;
        this.edgeColor = edgeColor;
        this.fillColor = fillColor;
        this._needUpdate = false;
    },
    edgeColor: {
        get: function() {
            return this._edgeColor;
        },
        set: function(color) {
            this._edgeColor = color;
            this.asset = enchant.block.BlockBGAsset.color(color);
        }
    },
    fillColor: {
        get: function() {
            return this._fillColor;
        },
        set: function(color) {
            this._fillColor = color;
        }
    },
    /**
     [lang:ja]
     * 背景を更新する.
     [/lang]
     */
    refreshDraw: function() {
        if (!this._needUpdate) {
            return;
        }
        var block = this.block;
        this.iteratable = block.iteratable && !block.parallel;
        this.tail = block._tail;
        this.connectable = block.connectable;
        this.width = block.width;
        this.height = block.height;
        this._element.width = block.width;
        this._element.height = block.height;

        this.context.clearRect(0, 0, this.width, this.height);
        var C_L_OFST = getBGAsset(this.edgeColor, 'C_L').width / 2 - 1;
        var baseX = (this.connectable && !this.iteratable) ? C_L_OFST : 0;
        this._fill(baseX, 0, this.width - baseX, this.height);

            this._drawLT(baseX);
            this._drawRT();
            this._drawLB(baseX);
            this._drawRB();

            var olt = getBGAsset(this.edgeColor, 'O_L_T');
            this._drawTopEdge(baseX + olt.width, null, this.width - olt.width * 2 - baseX, this.iteratable);
            this._drawBotEdge(baseX + olt.width, null, this.width - olt.width * 2 - baseX, this.iteratable && !this.tail);
        if (this.connectable && !this.iteratable) {
            this._drawLeftEdge(C_L_OFST);
        } else {
            this._drawLeftEdge();
        }
            this._drawRightEdge();

        if (this.connectable && !this.iteratable) {
            this._drawConnector();
        }
        var lines = block._layout;
        var line;
        var element;
        for (var i = 0, l = lines.length; i < l; i++) {
            line = lines[i];
            for (var j = 0, ll = line.length; j < ll; j++) {
                element = line[j];
                if (element === block._nextReceptor || !element.parentNode) {
                    continue;
                } if (element instanceof enchant.block.MultipleReceptor) {
                    this._drawReceptor(element, true, element._parallel);
                } else if (element instanceof enchant.block.Receptor) {
                    this._drawReceptor(element);
                }
            }
        }
        if (this._fillColor) {
            this.fillPixel(16, 16, hex2rgbarray(this._fillColor));
        }
        this._needUpdate = false;
    },
    _fill: function(x, y, w, h) {
        var img = this.asset.getFragment('X');
        this.context.drawImage(img, 0, 0, img.width, img.height, x, y, w, h);
    },
    _drawHole: function(x, y, w, h, multi) {
        this.context.clearRect(x, y, w, h);
        // I_L_T, I_L_B, I_R_T, I_R_B
        var ilt = this.asset.getFragment('I_L_T');
        var iltw = ilt.width, ilth = ilt.height;
        this.context.drawImage(ilt, x - iltw / 2, y - ilth / 2, iltw, ilth);
        var ilb = this.asset.getFragment('I_L_B');
        var ilbw = ilb.width, ilbh = ilb.height;
        this.context.drawImage(ilb, x - ilbw / 2, y + h - ilbh / 2, ilbw, ilbh);
        var irt = this.asset.getFragment('I_R_T');
        var irtw = irt.width, irth = irt.height;
        this.context.drawImage(irt, x + w - irtw / 2, y - irth / 2, irtw, irth);
        var irb = this.asset.getFragment('I_R_B');
        var irbw = irb.width, irbh = irb.height;
        this.context.drawImage(irb, x + w - irbw / 2, y + h - irbh / 2, irbw, irbh);
        // I_T, I_B, I_L, I_R
        var it = this.asset.getFragment('I_T');
        this.context.drawImage(it, x + iltw / 2, y - it.height / 2, w - iltw / 2 - irtw / 2, it.height);
        var ib = this.asset.getFragment('I_B');
        this.context.drawImage(ib, x + ilbw / 2, y + h - ib.height / 2, w - ilbw / 2 - irbw / 2, ib.height);
        var il = this.asset.getFragment('I_L');
        this.context.drawImage(il, x - il.width / 2, y + ilth / 2, il.width, h - ilth / 2 - ilbh / 2);
        var ir = this.asset.getFragment('I_R');
        this.context.drawImage(ir, x + w - ir.width / 2, y + irth / 2, ir.width, h - irth / 2 - irbh / 2);
        var d, up;
        var L_T_OFST = getBGAsset(this.edgeColor, 'O_L_T').height;
        if (multi) {
            d = this.asset.getFragment('C_B');
            this.context.clearRect(x + L_T_OFST, y - d.height / 2, d.width, d.height);
            this.context.drawImage(d, x + L_T_OFST, y - d.height / 2, d.width, d.height);
            up = this.asset.getFragment('H_T');
            this.context.clearRect(x + L_T_OFST, y + h - up.height / 2, up.width, up.height);
            this.context.drawImage(up, x + L_T_OFST, y + h - up.height / 2, up.width, up.height);
        }
    },
    _drawReceptor: function(receptor, multi, parallel) {
        var x = receptor.x;
        var y = receptor.y;
        var w = receptor.width;
        var h = receptor.height;
        var C_L_OFST = getBGAsset(this.edgeColor, 'C_L').width / 2;
        var received;
        if (multi) {
            if (parallel) {
                this._drawHole(x + C_L_OFST, y, this.block.width, h, false);
                if (receptor.received) {
                    received = receptor.received.parentNode.getIterated();
                    for (var i = 0, l = received.length; i < l; i++) {
                        this._drawHollow(x, y + C_L_OFST);
                        y += received[i].height - 8;
                    }
                }
                this._drawHollow(x, y + C_L_OFST);
            } else {
                this._drawHole(x, y, this.block.width, h, true);
            }
        } else {
            this._drawHole(x + C_L_OFST, y, w - C_L_OFST, h);
            this._drawHollow(x, y + C_L_OFST);
        }
    },
    _drawConnector: function() {
        var img = this.asset.getFragment('C_L');
        this.context.clearRect(0, img.height / 2, img.width, img.height);
        this.context.drawImage(img, 0, 0, img.width, img.height, 0, img.height / 2, img.width, img.height);
    },
    _drawHollow: function(x, y) {
        var img = this.asset.getFragment('H_R');
        this.context.clearRect(x, y, img.width, img.height);
        this.context.drawImage(img, x, y, img.width, img.height);
    },
    _drawLeftEdge: function(x, y, length) {
        var img = this.asset.getFragment('O_L');
        x = x || 0;
        y = y || getBGAsset(this.edgeColor, 'O_R_T').height;
        var a = getBGAsset(this.edgeColor, 'C_B').height / 2 + getBGAsset(this.edgeColor, 'O_R_B').height;
        length = length || this.height - y - a;
        if (length > 0) {
            this.context.drawImage(img, 0, 0, img.width, img.height, x, y, img.width, length);
        }
    },
    _drawRightEdge: function() {
        var img = this.asset.getFragment('O_R');
        var dy = getBGAsset(this.edgeColor, 'O_R_T').height;
        var a = getBGAsset(this.edgeColor, 'C_B').height / 2 + getBGAsset(this.edgeColor, 'O_R_B').height;
        var length = this.height - dy - a;
        if (length > 0) {
            this.context.drawImage(img, 0, 0, img.width, img.height, this.width - img.width, dy, img.width, length);
        }
    },
    _drawTopEdge: function(x, y, length, multi) {
        var img = this.asset.getFragment('O_T');
        x = x || 4;
        y = y || 0;
        length = Math.max(length || this.width - 6, 0);
        this.context.drawImage(img, 0, 0, img.width, img.height, x, y, length, img.height);
        var up;
        var L_T_OFST = getBGAsset(this.edgeColor, 'O_L_T').height;
        if (multi) {
            up = this.asset.getFragment('H_T');
            var dx = L_T_OFST;
            var dy = -up.height / 2 + 1;
            this.context.clearRect(dx, dy, up.width, up.height);
            this.context.drawImage(up, dx, dy, up.width, up.height);
        }
    },
    _drawBotEdge: function(x, y, length, multi) {
        var img = this.asset.getFragment('O_B');
        x = x || 4;
        length = Math.max(length || this.width - 6, 0);
        var d = getBGAsset(this.edgeColor, 'C_B');
        this.context.clearRect(x, this.height - img.height - d.height / 2, length, img.height);
        this.context.drawImage(img, 0, 0, img.width, img.height, x, this.height - img.height - d.height / 2, length, img.height);
        var L_T_OFST = getBGAsset(this.edgeColor, 'O_L_T').height;
        if (multi) {
            d = this.asset.getFragment('C_B');
            this.context.clearRect(L_T_OFST, this.height - d.height, d.width, d.height);
            this.context.drawImage(d, L_T_OFST, this.height - d.height, d.width, d.height);
        }
    },
    _drawLT: function(x) {
        var img = this.asset.getFragment('O_L_T');
        x = x || 0;
        this.context.drawImage(img, x, 0, img.width, img.height);
    },
    _drawRT: function() {
        var img = this.asset.getFragment('O_R_T');
        this.context.drawImage(img, this.width - img.width, 0, img.width, img.height);
    },
    _drawLB: function(x) {
        var img = this.asset.getFragment('O_L_B');
        x = x || 0;
        var C_B_OFST = getBGAsset(this.edgeColor, 'C_B').height / 2;
        this.context.clearRect(x, this.height - img.height - C_B_OFST, img.width, img.height + C_B_OFST);
        this.context.drawImage(img, x, this.height - img.height - C_B_OFST, img.width, img.height);
    },
    _drawRB: function() {
        var img = this.asset.getFragment('O_R_B');
        var C_B_OFST = getBGAsset(this.edgeColor, 'C_B').height / 2;
        this.context.clearRect(this.width - img.width, this.height - img.height - C_B_OFST, img.width, img.height + C_B_OFST);
        this.context.drawImage(img, this.width - img.width, this.height - img.height - C_B_OFST, img.width, img.height);
    }
});

/**
 * @scope enchant.block.Manager.prototype
 */
enchant.block.Manager = enchant.Class.create(enchant.EventTarget, {
    /**
     * @name enchant.block.Manager
     * @class
     [lang:ja]
     * ブロックと編集領域を管理するクラス.
     * インスタンスは一つしか存在することができず, すでにインスタンスが存在する状態で
     * コンストラクタを実行した場合既存のものが返される. 存在するインスタンスには,
     * enchant.block.Manager.instanceからアクセスできる.
     * @see enchant.block.Manager#importNamespace
     * @param {enchant.Group} [targetGroup] ブロックを表示するためのGroup. 指定しなければ{@link enchant.Core#currentScene}が使用される.
     * @param {Object} [namespace] ブロックのサブクラスをまとめたオブジェクト. 指定しなければenchant.block.blocksが使用される.
     [/lang]
     * @constructs
     * @extends enchant.EventTarget
     */
    initialize: function(targetGroup, namespace) {
        var core = enchant.Core.instance;
        if (_manager) {
            return _manager;
        }
        enchant.EventTarget.call(this);

        namespace = namespace || enchant.block.blocks;
        /**
         [lang:ja]
         * ブロックの編集領域となるGroup.
         [/lang]
         * @type {enchant.Group}
         */
        this.targetGroup = targetGroup || core.currentScene;

        /**
         [lang:ja]
         * ブロックのコンストラクタを保持するオブジェクト.
         [/lang]
         * @type {Object}
         */
        this.namespace = {};

        this._blocks = [];
        this._receptors = [];
        this._dragTargets = [];

        this._dragging = null;
        this._dragStarted = false;
        this._linked = false;
        this._nearReceptor = null;

        this._posX = 0;
        this._posY = 0;
        this._touchX = 0;
        this._touchY = 0;
        this._vx = 0;
        this._vy = 0;

        this._areaTop = 0;
        this._areaBottom = targetGroup.height || 0;
        this._areaLeft = 0;
        this._areaRight = targetGroup.width || 0;

        enchant.block.Manager.instance = _manager = this;
        this.targetGroup.addEventListener(enchant.Event.ENTER_FRAME, function(e) {
            _manager._onenterframe(e);
        });

        this.importNamespace(namespace);
    },
    /**
     [lang:ja]
     * ブロックのサブクラスを追加する.
     * 追加しようとしているブロックと同じ名前のブロッククラスが存在したら上書きされる.
     * @param {Object} namespace 追加したいブロックをまとめたオブジェクト.
     * @example
     * var namespace = {
     *     puppet: {
     *         desc: {
     *             blockCategory: 'パペット'
     *         },
     *         PuppetBlock: enchant.Class.create(enchant.block.Block, {
     *             ...
     *         })
     *     },
     *     control: {
     *         desc: {
     *             blockCategory: '制御'
     *         }
     *     }
     * };
     * namespace.control.IfBlock = enchant.Class.create(enchant.block.Block, {
     *     ...
     * });
     * manager.importNamespace(namespace); // パペットカテゴリにPuppetBlock, 制御カテゴリにIfBlockが追加される.
     [/lang]
     */
    importNamespace: function(namespace) {
        var e = new enchant.Event(enchant.Event.BLOCK_IMPORTED);
        e.modified = {};
        var category;
        for (var prop in namespace) {
            this._importCategory(namespace[prop], e);
        }
        this.dispatchEvent(e);
    },
    _importCategory: function(category, e) {
        var name, Constructor, tree;
        if (category.desc && category.desc.blockCategory) {
            name = category.desc.blockCategory;
        } else {
            name = 'uncategoried';
        }
        if (!this.namespace[name]) {
            this.namespace[name] = {};
        }
        e.modified[name] = {};
        var namespace = this.namespace[name];
        for (var prop in category) {
            Constructor = category[prop];
            if (typeof Constructor === 'function' &&
                enchant.Class.getInheritanceTree(Constructor).indexOf(enchant.block.Block !== -1)) {
                namespace[prop] = category[prop];
                e.modified[name][prop] = category[prop];
            }
        }
    },
    _onenterframe: function(e) {
        if (this._dragging === null || !this._dragStarted) {
            return;
        }
        var C = this._dragging.connector;
        var R = this._nearReceptor;
        var gsx = this.targetGroup._scaleX;
        var gsy = this.targetGroup._scaleY;
        var ox, oy, roX, roY, distance;
        if (this._dragging.connector && R !== null) {
            if (C.canConnect(R)) {
                ox = this._dragging.parentNode._offsetX;
                oy = this._dragging.parentNode._offsetY;
                roX = (R.width * gsx - R.width) * 0.5;
                roY = (R.height * gsy - R.height) * 0.5;
                this._vx = 0;
                this._vy = 0;
                if (R._withinPoint(this._posX * gsx + roX + ox, this._posY * gsy + roY + oy, 32)) {
                    if (R.received) {
                        R.received.parentNode.y = this._dragging.height - 8;
                    }
                    this._startClipAnimation(R);
                    return;
                } else {
                    if (this._nearReceptor.received) {
                        this._nearReceptor.received.parentNode.y = 0;
                    }
                    this._startUnClipAnimation();
                }
            } else {
                // TODO ぼよんともどる
                distance = R._potentialPoint(this._dragging.x, this._dragging.y);
                var dx = (this._dragging.x - R._offsetX);
                var dy = (this._dragging.y - R._offsetY);
                var l = Math.sqrt(dx * dx + dy * dy);
                var p = 100000 / distance / distance;
                var vx = p * dx / l;
                var vy = p * dy / l;
                vx = Math.min(5, Math.max(-5, vx));
                vy = Math.min(5, Math.max(-5, vy));
                this._vx += vx;
                this._vy += vx;
            }
        }
        this._followDragging();
    },
    _followDragging: function() {
        if (this._inAnim) {
            return;
        }
        this._dragging.x = this._posX + this._vx;
        this._dragging.y = this._posY + this._vy;
    },
    _updateAreaRect: function() {
        var blocks = this.getRootBlocks(this.targetGroup);
        var top = Infinity;
        var left = Infinity;
        var bottom = -Infinity;
        var right = -Infinity;
        var block, x, y, ex, ey;
        for (var i = 0, l = blocks.length; i < l; i++) {
            block = blocks[i];
            x = block.x;
            y = block.y;
            ex = x + block.width;
            ey = y + block.height;
            top = Math.min(top, y);
            left = Math.min(left, x);
            bottom = Math.max(bottom, ey);
            right = Math.max(right, ex);

        }
        this._areaTop = top;
        this._areaLeft = left;
        this._areaBottom = bottom;
        this._areaRight = right;
    },
    _startClipAnimation: function(receiver) {
        if (this._linked) {
            return;
        }
        this._inAnim = true;
        var gsx = this.targetGroup._scaleX;
        var gsy = this.targetGroup._scaleY;
        var ox = this._dragging.parentNode._offsetX;
        var oy = this._dragging.parentNode._offsetY;
        var roX = (receiver.width * gsx - receiver.width) * 0.5;
        var roY = (receiver.height * gsy - receiver.height) * 0.5;
        this._dragging.tl
            .moveTo((receiver._offsetX - roX - ox) / gsx, (receiver._offsetY - roY - oy) / gsy, 3, enchant.Easing.QUAD_EASEIN)
            .then(function() { enchant.block.Manager.instance._inAnim = false; });
        this._linked = true;
    },
    _startUnClipAnimation: function() {
        if (!this._linked) {
            return;
        }
        this._inAnim = true;
        this._dragging.tl
            .moveTo(this._posX, this._posY, 5, enchant.Easing.QUAD_EASEIN)
            .then(function() { enchant.block.Manager.instance._inAnim = false; });
        this._linked = false;
    },
    _getRelativePosition: function(node) {
        var x = 0;
        var y = 0;
        while (node && node !== this.targetGroup) {
            x += node.x;
            y += node.y;
            node = node.parentNode;
        }
        return { x: x, y: y };
    },
    /**
     [lang:ja]
     * ブロックのドラッグが開始されたときに実行されるメソッド.
     [/lang]
     * @param {enchant.Event} event touchstartイベント
     * @private
     */
    startDragging: function(e) {
        if (this._dragging !== null) {
            return;
        }
        this._dragging = e.target;
    },
    /**
     [lang:ja]
     * ブロックのドラッグ中に実行されるメソッド.
     [/lang]
     * @param {enchant.Event} event touchmoveイベント
     * @private
     */
    moveDragging: function(e) {
        var gsx = this.targetGroup._scaleX;
        var gsy = this.targetGroup._scaleY;
        var ooX, ooY;
        if (e.target === this._dragging && !this._dragStarted) {
            ooX = (this._dragging.width * gsx - this._dragging.width) * 0.5;
            ooY = (this._dragging.height * gsy - this._dragging.height) * 0.5;
            this._touchX = (e.x - (this._dragging._offsetX - ooX)) / gsx;
            this._touchY = (e.y - (this._dragging._offsetY - ooY)) / gsy;
            this._posX = e.x / gsx - this._touchX - this._dragging.parentNode._offsetX;
            this._posY = e.y / gsy - this._touchY - this._dragging.parentNode._offsetY;
            this._dragStarted = true;
            this._dragging._style.zIndex = 1;
            this.pickUpDraggingBlock();
            this._linked = false;
        }
        if (e.target !== this._dragging) {
            return;
        }
        var C = this._dragging.connector;
        this._posX = (e.x - this._dragging.parentNode._offsetX) / gsx - this._touchX;
        this._posY = (e.y - this._dragging.parentNode._offsetY) / gsy - this._touchY;
        var R;
        if (this._dragging.connector) {
            R = this.getNearestReceptor(C);
            if (this._nearReceptor === null || R === null || R !== this._nearReceptor) {
                this._nearReceptor = R;
            }
        }
    },
    /**
     [lang:ja]
     * ブロックのドラッグが終了されたときに実行されるメソッド.
     [/lang]
     * @param {enchant.Event} event touchendイベント
     * @private
     */
    endDragging: function(e) {
        if (this._dragging === null || !this._dragStarted) {
            this._dragging = null;
            return;
        }
        this._followDragging();
        this._dragging.x += (this._dragging.parentNode._offsetX - this.targetGroup._offsetX);
        this._dragging.y += (this._dragging.parentNode._offsetY - this.targetGroup._offsetY);
        this.putDraggingBlock();
        var evt;
        if (!this._linked) {
            var target = this.getHoverDragTarget(e);
            if (target) {
                evt = new enchant.Event(enchant.Event.BLOCK_RECEIVED);
                evt.block = this._dragging;
                target.dispatchEvent(evt);
            }
        }
        this._dragging._style.zIndex = 'auto';
        this._dragging = null;
        this._dragStarted = false;
        this._linked = false;
        this._touchX = this._touchY = 0;
    },
    /**
     [lang:ja]
     * ブロックのドラッグが開始するときにブロックの接続状態を整理する.
     [/lang]
     * @private
     */
    pickUpDraggingBlock: function() {
        var ox, oy, prevReceptor, nextBlock, nextConnector;
        if (this._dragging.connector) {
            ox = this._dragging.parentNode._offsetX - this.targetGroup._offsetX;
            oy = this._dragging.parentNode._offsetY - this.targetGroup._offsetY;
            if (this._dragging.iteratable) {
                if (this._dragging.prev && this._dragging.next) {
                    prevReceptor = this._dragging.connector.connected;
                    nextConnector = this._dragging.next.connector;
                    this._dragging.connector.disconnect(ox, oy);
                    nextConnector.disconnect();
                    nextConnector.connect(prevReceptor);
                } else {
                    this._dragging.connector.disconnect(ox, oy);
                }
            } else {
                this._dragging.connector.disconnect(ox, oy);
            }
        }
    },
    /**
     [lang:ja]
     * ブロックのドラッグが終了するときにブロックの接続状態を整理する.
     [/lang]
     * @private
     */
    putDraggingBlock: function() {
        if (!this._dragStarted) {
            return;
        }
        var C, target, draggings;
        if (this._linked) {
            C = this._nearReceptor.received;
            this._dragging.x = 0;
            this._dragging.y = 0;
            if (C) {
                C.parentNode.y = 0;
                if (this._dragging.iteratable) {
                    draggings = this._dragging.getIterated();
                    target = draggings[draggings.length - 1];
                } else {
                    target = this._dragging;
                }
                if (target.iteratable && !target._tail) {
                    C.disconnect();
                    this._dragging.connector.connect(this._nearReceptor);
                    C.connect(target._nextReceptor);
                } else {
                    var pos = this._getRelativePosition(C.parentNode);
                    x = pos.x;
                    y = pos.y + C.parentNode.height;
                    C.disconnect(x, y);
                    this._dragging.connector.connect(this._nearReceptor);
                }
            } else {
                this._dragging.connector.connect(this._nearReceptor);
            }
        } else {
            this._dragging.parentNode.removeChild(this._dragging);
            this.targetGroup.addChild(this._dragging);
        }
        this._dragging.tl.clear();
        this._inAnim = false;
    },
    /**
     [lang:ja]
     * 指定したConnectorに一番近いReceptorを返す.
     * @param {enchant.block.Connector} connector 対象のConnector.
     * @return {enchant.block.Receptor} 一番近いReceptor.
     [/lang]
     * @private
     */
    getNearestReceptor: function(connector) {
        var core = enchant.Core.instance;
        var nearR = null;
        var minPotential = core.width * core.height;
        var potential;
        var C, R;
        C = connector;
        for (var i = 0, l = this._receptors.length; i < l; i++) {
            R = this._receptors[i];
            if (R.parentNode.ancestor === C.parentNode.ancestor) {
                continue;
            }
            potential = R._potentialPoint(C.parentNode._offsetX, C.parentNode._offsetY);
            if (minPotential >= potential) {
                minPotential = potential;
                nearR = R;
            }
        }
        return nearR;
    },
    /**
     [lang:ja]
     * {@link enchant.block.Manager#registerDragTarget}で追加したEntityとブロックの当たり判定をとる.
     * @param {enchant.block.Connector} connector 対象のConnector.
     * @return {enchant.Entity} 衝突していたdragtarget.
     [/lang]
     * @private
     */
    getBoundDragTarget: function(block) {
        var dragTarget;
        for (var i = this._dragTargets.length - 1; i >= 0; i--) {
            dragTarget = this._dragTargets[i];
            if  (dragTarget.intersect(block)) {
                return dragTarget;
            }
        }
        return null;
    },
    /**
     [lang:ja]
     * {@link enchant.block.Manager#registerDragTarget}で追加したEntityと現在のドラッグ位置との当たり判定をとる.
     * @return {enchant.Entity} タッチしていたdragtarget.
     [/lang]
     * @private
     */
    getHoverDragTarget: function(e) {
        var tx = e.x, ty = e.y;
        var dragTarget;
        for (var i = this._dragTargets.length - 1; i >= 0; i--) {
            dragTarget = this._dragTargets[i];
            if (dragTarget._offsetX < tx && tx < dragTarget._offsetX + dragTarget.width &&
                dragTarget._offsetY < ty && ty < dragTarget._offsetY + dragTarget.height) {
                return dragTarget;
            }
        }
        return null;
    },
    /**
     [lang:ja]
     * Managerが管理しているブロックのうち, 指定したGroupの直接の子になっているブロックを返す.
     * @param {enchant.Group} group 対象のGroup.
     * @return {Array,<enchant.block.Block>} 衝突していたdragtarget.
     [/lang]
     */
    getRootBlocks: function(group) {
        return this._blocks.filter(function(block) {
            return block.parentNode === group;
        }, this);
    },
    /**
     [lang:ja]
     * ブロックからデータを生成して返す.
     * @param {enchant.Group} [group] 対象のGroup. {@line enchant.block.Manager#getRootBlocks}で指定される.
     * @param {Function} [filter] フィルタ関数 第一引数にブロックが渡される. 戻り値がtrueならそのブロックを生成対象に含める.
     * @return {*} ブロックから生成したデータ.
     [/lang]
     */
    compile: function(group, filter) {
        var ret = '';
        var core = enchant.Core.instance;
        group = group || this.targetGroup;
        filter = filter || function(block) { return true; };
        var blocks = this.getRootBlocks(group).filter(filter);
        blocks.forEach(function(block) {
            ret += block.compile();
        });
        return ret;
    },
    /**
     [lang:ja]
     * ブロックをシリアライズした結果を返す.
     * @param {enchant.Group} [group] 対象のGroup. {@line enchant.block.Manager#getRootBlocks}で指定される.
     * @param {Function} [filter] フィルタ関数.第一引数にブロックが渡される.戻り値がtrueならそのブロックを生成対象に含める.
     * @return {Object[]} ブロックをシリアライズした結果.
     [/lang]
     */
    serialize: function(group, filter) {
        var core = enchant.Core.instance;
        group = group || this.targetGroup;
        filter = filter || function(block) { return true; };
        var blocks = this.getRootBlocks(group).filter(filter);
        return blocks.map(function(block) {
            return block._getSerializationSource();
        })
        .filter(function(obj) {
            return !!obj;
        });
    },
    /**
     [lang:ja]
     * ブロックをシリアライズした文字列からブロックを生成する.
     * ブロックは自動的にGroupに追加される.
     * @param {Object[]} data ブロックをシリアライズしたオブジェクトの配列.
     * @param {enchant.Group} [group] 対象のGroup. Blockが追加される.
     [/lang]
     */
    deserialize: function(data, group) {
        var core = enchant.Core.instance;
        group = group || this.targetGroup;
        data.forEach(function(block) {
            group.addChild(enchant.block.Block.createFromSerializedData(block));
        });
    },
    /**
     [lang:ja]
     * Managerが管理しているブロックすべてを削除する.
     [/lang]
     */
    clear: function() {
        this._blocks.slice().forEach(function(b) {
            this.targetGroup.removeChild(b);
        }, this);
    },
    _register: function(target, data) {
        var elements = Array.prototype.slice.call(data);
        Array.prototype.push.apply(target, elements.filter(function(element) {
            return target.indexOf(element) === -1;
        }));
    },
    _unregister: function(target, data) {
        var elements = Array.prototype.slice.call(data);
        return target.filter(function(element) {
            return elements.indexOf(element) === -1;
        });
    },
    /**
     [lang:ja]
     * ブロックをManagerに追加する.
     * ブロックを{@link enchant.block.Manager#targetGroup}に追加した際に自動で呼び出される.
     * @param {...enchant.block.Block} block 追加するブロック.
     [/lang]
     * @private
     */
    registerBlock: function(blocks) {
        this._register(this._blocks, arguments);
        this._updateAreaRect();
        var evt = new enchant.Event(enchant.Event.BLOCK_ADDED);
        Array.prototype.slice.call(arguments).forEach(function(block) {
            evt.block = block;
            this.dispatchEvent(evt);
        }, this);
    },
    /**
     [lang:ja]
     * ブロックをManagerから削除する.
     * ブロックを{@link enchant.block.Manager#targetGroup}から削除した際に自動で呼び出される.
     * @param {...enchant.block.Block} block 削除するブロック.
     [/lang]
     * @private
     */
    unregisterBlock: function(blocks) {
        this._blocks = this._unregister(this._blocks, arguments);
        this._updateAreaRect();
        var evt = new enchant.Event(enchant.Event.BLOCK_REMOVED);
        Array.prototype.slice.call(arguments).forEach(function(block) {
            evt.block = block;
            this.dispatchEvent(evt);
        }, this);
    },
    /**
     [lang:ja]
     * ReceptorをManagerに追加する.
     * ブロックを{@link enchant.block.Manager#targetGroup}に追加した際にブロックの持つReceptorを引数に自動で呼び出される.
     * @param {...enchant.block.Receptor} block 追加するReceptor.
     [/lang]
     * @private
     */
    registerReceptor: function(receptors) {
        this._register(this._receptors, arguments);
    },
    /**
     [lang:ja]
     * ReceptorをManagerから削除する.
     * ブロックを{@link enchant.block.Manager#targetGroup}から削除した際にブロックの持つReceptorを引数に自動で呼び出される.
     * @param {...enchant.block.Receptor} block 削除するReceptor.
     [/lang]
     * @private
     */
    unregisterReceptor: function(receptors) {
        this._receptors = this._unregister(this._receptors, arguments);
    },
    /**
     [lang:ja]
     * dragtargetをManagerに追加する.
     * 追加したEntityにブロックがドラッグされたときに, {@link enchant.Event#BLOCK_RECEIVED}イベントが発生する.
     * @param {...enchant.Entity} entity 追加するdragtarget.
     [/lang]
     */
    registerDragTarget: function(dragTargets) {
        this._register(this._dragTargets, arguments);
    },
    /**
     [lang:ja]
     * dragtargetをManagerから削除する.
     * @param {...enchant.Entity} entity 削除するdragtarget.
     [/lang]
     */
    unregisterDragTarget: function(dragTargets) {
        this._dragTargets = this._unregister(this._dragTargets, arguments);
    },
    /**
     [lang:ja]
     * ブロックのコンストラクタの名前を取得する.
     * 名前空間に存在しないコンストラクタの名前は見つけられない.
     * @param {Function} Constructor 名前を知りたいブロックのコンストラクタ.
     * @param {Object} [namespace] コンストラクタを探す範囲.指定しない場合は{@link enchant.block.Manager#namaspace}から探される.
     * @return {String} コンストラクタ名
     [/lang]
     */
    findConstructorName: function(Constructor, namespace) {
        var property;
        var ret = null;
        if (!namespace) {
            namespace = this.namespace;
        }
        for (var name in namespace) {
            property = namespace[name];
            if (property === Constructor) {
                return name;
            } else if (typeof property === 'object') {
                ret = this.findConstructorName(Constructor, property);
            } if (ret !== null) {
                break;
            }
        }
        return ret;
    },
    /**
     [lang:ja]
     * 名前からブロックのコンストラクタを取得する.
     * 名前空間に存在しないコンストラクタは見つけられない.
     * @param {String} constructorName コンストラクタの名前.
     * @param {Object} [namespace] 名前を探す範囲.指定しない場合は{@link enchant.block.Manager#namaspace}から探される.
     * @return {Function} コンストラクタ
     [/lang]
     */
    findConstructor: function(constructorName, namespace) {
        var property;
        var ret = null;
        if (!namespace) {
            namespace = this.namespace;
        }
        for (var name in namespace) {
            property = namespace[name];
            if (name === constructorName) {
                return property;
            } else if (typeof property === 'object') {
                ret = this.findConstructor(constructorName, property);
            } if (ret !== null) {
                break;
            }
        }
        return ret;
    },
    /**
     [lang:ja]
     * ブロックのコンストラクタからブロックのカテゴリを取得する.
     * 名前空間に存在しないコンストラクタは見つけられない.
     * @param {Function} Constructor カテゴリの名前を知りたいブロックのコンストラクタ.
     * @param {Object} [namespace] 名前を探す範囲.指定しない場合は{@link enchant.block.Manager#namaspace}から探される.
     * @return {Object} カテゴリのオブジェクト.
     [/lang]
     */
    findCategoryByConstructor: function(Constructor, namespace) {
        var property;
        var ret = null;
        if (!namespace) {
            namespace = this.namespace;
        }
        for (var name in namespace) {
            property = namespace[name];
            if (property === Constructor) {
                return namespace;
            } else if (typeof property === 'object') {
                ret = this.findCategoryByConstructor(Constructor, property);
            } if (ret !== null) {
                break;
            }
        }
        return ret;
    },
    /**
     [lang:ja]
     * ブロックのコンストラクタからブロックのカテゴリ名を取得する.
     * 名前空間に存在しないコンストラクタは見つけられない.
     * @param {Function} Constructor カテゴリの名前を知りたいブロックのコンストラクタ.
     * @param {Object} [namespace] 名前を探す範囲.指定しない場合は{@link enchant.block.Manager#namaspace}から探される.
     * @return {String} カテゴリの名前.
     [/lang]
     */
    findCategoryNameByConstructor: function(Constructor, namespace) {
        var found = 'FOUND';
        var property;
        var ret = null;
        if (!namespace) {
            namespace = this.namespace;
        }
        for (var name in namespace) {
            property = namespace[name];
            if (property === Constructor) {
                return found;
            } else if (typeof property === 'object') {
                ret = this.findCategoryNameByConstructor(Constructor, property);
            } if (ret === found) {
                return name;
            }
        }
        return ret;
    },
    /**
     [lang:ja]
     * 名前からブロックのカテゴリを取得する.
     * 名前空間に存在しないコンストラクタは見つけられない.
     * @param {String} constructorName コンストラクタの名前.
     * @param {Object} [namespace] 名前を探す範囲.指定しない場合は{@link enchant.block.Manager#namaspace}から探される.
     * @return {Object} カテゴリのオブジェクト.
     [/lang]
     */
    findCategoryByConstructorName: function(constructorName, namespace) {
        var Constructor = this.findConstructor(constructorName, namespace);
        if (Constructor) {
            return this.findCategoryByConstructor(Constructor, namespace);
        } else {
            return null;
        }
    },
    /**
     [lang:ja]
     * 名前からブロックのカテゴリ名を取得する.
     * 名前空間に存在しないコンストラクタは見つけられない.
     * @param {String} constructorName コンストラクタの名前.
     * @param {Object} [namespace] 名前を探す範囲.指定しない場合は{@link enchant.block.Manager#namaspace}から探される.
     * @return {String} カテゴリの名前.
     [/lang]
     */
    findCategoryNameByConstructorName: function(constructorName, namespace) {
        var Constructor = this.findConstructor(constructorName, namespace);
        if (Constructor) {
            return this.findCategoryNameByConstructor(Constructor, namespace);
        } else {
            return null;
        }
    }
});
/**
 [lang:ja]
 * 現在のManagerインスタンス.
 [/lang]
 [lang:en]
 * The Current Manager instance.
 [/lang]
 * @type {enchant.block.Manager}
 * @static
 */
enchant.block.Manager.instance = null;

var parseType = function(type) {
    if (typeof type === 'string') {
        return type.split(' ');
    } else if (type instanceof Array) {
        return type;
    } else {
        throw new Error('type shuld set by be Array or string');
    }
};

/**
 * @scope enchant.block.Connector.prototype
 */
enchant.block.Connector = enchant.Class.create({
    /**
     * @name enchant.block.Connector
     * @class
     [lang:ja]
     * Connectorクラス.
     * Receptorと接続する.
     * 内部的なクラス.
     [/lang]
     * @constructs
     */
    initialize: function(type) {
        this.type = type;
        /**
         [lang:ja]
         * 実際に接続するEntity.
         [/lang]
         * @type {enchant.Entity}
         */
        this.parentNode = null;
        this.x = 0;
        this.y = 0;
        /**
         [lang:ja]
         * 接続中のReceptor.
         [/lang]
         * @type {enchant.block.Receptor}
         */
        this.connected = null;
    },
    /**
     [lang:ja]
     * Connectorのタイプ.
     * Receptorのタイプと一つでも一致する場合接続できる.
     * @type {Array.<String>} タイプを表す文字列の配列.
     [/lang]
     */
    type: {
        get: function() {
            return this._type;
        },
        set: function(type) {
            this._type = parseType(type);
        }
    },
    /**
     [lang:ja]
     * 指定したReceptorと接続できるかどうかを返す.
     * @param {enchant.block.Receptor} receptor 対象のReceptor.
     * @return {Boolean} 接続できるかどうか.
     [/lang]
     */
    canConnect: function(receptor) {
        return (receptor && receptor._canReceive(this));
    },
    /**
     [lang:ja]
     * Receptorと接続する.
     * @param {enchant.block.Receptor} receptor 接続したいReceptor.
     [/lang]
     */
    connect: function(receptor) {
        if (this.connected || receptor.received) {
            return;
        } if (this.parentNode.parentNode) {
            this.parentNode.parentNode.removeChild(this.parentNode);
        }
        this.connected = receptor;
        receptor.receive(this);
    },
    /**
     [lang:ja]
     * Receptorとの接続を解除する.
     * @param {Number} [x] 接続解除後のx座標.
     * @param {Number} [y] 接続解除後のy座標.
     [/lang]
     */
    disconnect: function(x, y) {
        if (!this.connected) {
            return;
        }
        var receptor = this.connected;
        this.connected = null;
        receptor.release(x, y);
    }
});

/**
 * @scope enchant.block.Receptor.prototype
 */
enchant.block.Receptor = enchant.Class.create(enchant.widget.EntityGroup, {
    /**
     * @name enchant.block.Receptor
     * @class
     [lang:ja]
     * Receptorクラス.
     * Connectorを一つ接続できる.
     [/lang]
     * @constructs
     * @extends enchant.widget.EntityGroup
     */
    initialize: function(type) {
        var w = this._defaultWidth = 48;
        var h = this._defaultHeight = 40;
        enchant.widget.EntityGroup.call(this, w, h);
        this.type = type;
        /**
         [lang:ja]
         * 接続中のConnector.
         [/lang]
         * @type {encahnt.block.Connector}
         */
        this.received = null;
        this.innerWidth = this.width;
        this.innerHeight = this.height;
        this.addEventListener(enchant.Event.ADDED_TO_SCENE, function() {
            this._cvsCache.detectColor = '#000000';
        });
        this.addEventListener(enchant.Event.ADDED, this._fitSize);
        this.addEventListener(enchant.Event.CONNECTION_CHANGED, this._onconnectionchange);
    },
    /**
     [lang:ja]
     * Receptorのタイプ.
     * Connectorのタイプと一つでも一致する場合接続できる.
     * @type {Array.<String>} タイプを表す文字列の配列.
     [/lang]
     */
    type: {
        get: function() {
            return this._type;
        },
        set: function(type) {
            this._type = parseType(type);
        }
    },
    /**
     [lang:ja]
     * Connectorと接続する.
     * Connectorの持つEntityを自身の子として追加する.
     * @param {enchant.block.Conector} connector 接続したいConnector.
     [/lang]
     * @private
     */
    receive: function(connector) {
        this.addChild(connector.parentNode);
        this.received = connector;
        this.dispatchEvent(new enchant.Event(enchant.Event.CONNECTION_CHANGED));
    },
    /**
     [lang:ja]
     * Connectorとの接続を解除する.
     * @param {Number} [x] 接続解除後のx座標.
     * @param {Number} [y] 接続解除後のy座標.
     [/lang]
     * @private
     */
    release: function(x, y) {
        var connector = this.received;
        this.removeChild(connector.parentNode);
        if (typeof x === 'number') {
            connector.parentNode.x = x;
            connector.parentNode.y = y;
        }
        _manager.targetGroup.addChild(connector.parentNode);
        this.received = null;
        this.dispatchEvent(new enchant.Event(enchant.Event.CONNECTION_CHANGED));
    },
    _setDefaultSize: function() {
        this.width = this._defaultWidth;
        this.height = this._defaultHeight;
    },
    /**
     [lang:ja]
     * 指定したConnectorと接続できるかどうかを返す.
     * @param {enchant.block.Connector} connector 対象のConnector.
     * @return {Boolean} 接続できるかどうか.
     [/lang]
     * @private
     */
    _canReceive: function(connector) {
        var typea, typeb;
        for (var i = 0, l = this.type.length; i < l; i++) {
            typea = this.type[i];
            for (var j = 0, ll = connector.type.length; j < ll; j++) {
                typeb = connector.type[j];
                if (typea === typeb) {
                    return true;
                }
            }
        }
        return false;
    },
    _fitSize: function() {
        var metrics;
        if (this.received) {
            metrics = this.received.parentNode.getMetrics();
            this.width = metrics.width;
            this.height = metrics.height;
        } else {
            this._setDefaultSize();
        }
        this.parentNode.dispatchEvent(new enchant.Event(enchant.Event.METRICS_CHANGED));
    },
    _onconnectionchange: function(e) {
        var parent = this.parentNode;
        if (parent && parent.connectable && parent.connector.connected) {
            parent.connector.connected.dispatchEvent(e);
        }
    },
    _potentialPoint: function(x, y) {
        var _;
        return (_ = this._offsetX - x) * _ +
            (_ = this._offsetY - y) * _;
    },
    _withinPoint: function(x, y, distance) {
        if (distance === null) {
            distance = (this.width + this.height) / 4;
        }
        return this._potentialPoint(x, y) < distance * distance;
    }
});

/**
 * @scope enchant.block.MultipleReceptor.prototype
 */
enchant.block.MultipleReceptor = enchant.Class.create(enchant.block.Receptor, {
    /**
     * @name enchant.block.MultipleReceptor
     * @class
     [lang:ja]
     * MultipleReceptorクラス.
     * Connectorを縦に複数個接続できる.
     [/lang]
     * @constructs
     * @extends enchant.block.Receptor
     */
    initialize: function(type) {
        enchant.block.Receptor.call(this, type);
        this.width = this._defaultWidth = 96;
        this._parallel = false;
    },
    _fitSize: function() {
        var metrics;
        if (!this.parentNode) {
            return;
        }
        if (this.received) {
            metrics = this.received.parentNode.getMetrics();
            this.width = Math.min(metrics.width, this.parentNode.width - this.x);
            this.height = metrics.height + 40;
        } else {
            this._setDefaultSize();
        }
        this.parentNode.dispatchEvent(new enchant.Event(enchant.Event.METRICS_CHANGED));
    },
    _setDefaultSize: function() {
        this.width = Math.min(this._defaultWidth, this.parentNode.width - this.x);
        this.height = this._defaultHeight;
    },
    /**
     [lang:ja]
     * Receptorのもつ情報を順不同に扱っても問題ないことを設定する.
     * @private
     [/lang]
     */
    parallel: function() {
        this._parallel = true;
        this.dispatchEvent(new enchant.Event(enchant.Event.CONNECTION_CHANGED));
    }
});

/**
 * @scope enchant.block.Draggable.prototype
 */
enchant.block.Draggable = enchant.Class.create(enchant.widget.EntityGroup, {
    /**
     * @name enchant.block.Draggable
     * @class
     [lang:ja]
     * Draggableクラス.
     * このクラスのインスタンスはドラッグイベントをManagerに管理される.
     [/lang]
     * @constructs
     * @extends enchant.widget.EntityGroup
     */
    initialize: function() {
        enchant.widget.EntityGroup.call(this, 16, 16);
        enchant.widget.draggable.toDraggable(this);
        this._managed = false;
        this.enableManage();
    },
    /**
     [lang:ja]
     * Managerによる管理を有効にする.
     [/lang]
     */
    enableManage: function() {
        if (!this._managed) {
            this.addEventListener(enchant.Event.DRAG_START, this._ontouchstart);
            this.addEventListener(enchant.Event.DRAG_MOVE, this._ontouchmove);
            this.addEventListener(enchant.Event.DRAG_END, this._ontouchend);
            this._managed = true;
        }
    },
    /**
     [lang:ja]
     * Managerによる管理を無効にする.
     [/lang]
     */
    disableManage: function() {
        if (this._managed) {
            this.removeEventListener(enchant.Event.DRAG_START, this._ontouchstart);
            this.removeEventListener(enchant.Event.DRAG_MOVE, this._ontouchmove);
            this.removeEventListener(enchant.Event.DRAG_END, this._ontouchend);
            this._managed = false;
        }
    },
    _ontouchstart: function(e) {
        _manager.startDragging(e);
    },
    _ontouchmove: function(e) {
        _manager.moveDragging(e);
    },
    _ontouchend: function(e) {
        _manager.endDragging(e);
    }
});

/**
 * @scope enchant.block.BlockLabel.prototype
 */
enchant.block.BlockLabel = enchant.Class.create(enchant.Label, {
    /**
     * @name enchant.block.BlockLabel
     * @class
     [lang:ja]
     * ブロックの文字表示に使われるクラス.
     [/lang]
     * @constructs
     * @extends enchant.Label
     */
    initialize: function(text) {
        enchant.Label.call(this, text);
    },
    _update: function() {
        var metrics = this.getMetrics(this.text);
        this.width = metrics.width;
        this.height = metrics.height;
    },
    /**
     [lang:ja]
     * 表示されるテキスト.
     * {@link enchant.Label#text}への参照.
     * 値を変更した場合, {@link enchant.Event#CHANGE}イベントが発生する.
     * @type {String}
     [/lang]
     */
    value: {
        get: function() {
            return this.text;
        },
        set: function(text) {
            var oldValue = this.text;
            var isValueChanged = (this.text !== text);
            this.text = text;
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
     * 文字のスタイルを設定する.
     * @param {Object} object スタイルを表すオブジェクト.
     * @param {Object} object.font 文字のフォント.
     * @param {Object} object.color 文字の色.
     * @return {enchant.block.BlockLabel} 自身.
     [/lang]
     */
    style: function(obj) {
        for (var prop in obj) {
            this[prop] = obj[prop];
        }
        this._update();
        return this;
    }
});
/**
 [lang:ja]
 * 指定した文字列, フォントにフィットするサイズのBlockLabelを生成して返す.
 * @param {String} text BlockLabelの表示テキスト.
 * @param {String} [font] BlockLabelの表示テキストのフォント.
 * @param {String} [color] BlockLabelの表示テキストの色.
 * @return {enchant.block.BlockLabel} 生成したBlockLabel
 [/lang]
 * @static
 */
enchant.block.BlockLabel.create = function(text, font, color) {
    var label = new enchant.block.BlockLabel(text);
    if (font) {
        label.font = font;
    }
    if (color) {
        label.color = color;
    }
    label._update();
    return label;
};

/**
 * @scope enchant.block.BlockVariable.prototype
 */
enchant.block.BlockVariable = enchant.Class.create(enchant.EventTarget, {
    /**
     * @name enchant.block.BlockVariable
     * @class
     [lang:ja]
     * ブロックの変数を表すクラス.
     [/lang]
     * @constructs
     * @extends enchant.EventTarget
     */
    initialize: function(name) {
        enchant.EventTarget.call(this);
        /**
         [lang:ja]
         * 変数の名前.
         [/lang]
         * @type {String}
         */
        this.name = name;
    },
    /**
     [lang:ja]
     * 変数の値.
     * 値を変更した場合, {@link enchant.Event#CHANGE}イベントが発生する.
     [/lang]
     * @type {String}
     */
    value: {
        get: function() {
            return this._value;
        },
        set: function(value) {
            var oldValue = this.value;
            var isValueChanged = (this.value !== value);
            this._value = value;
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
 * @scope enchant.block.Block.prototype
 */
enchant.block.Block = enchant.Class.create(enchant.block.Draggable, {
    /**
     * @name enchant.block.Block
     * @class
     [lang:ja]
     * ブロックのクラス.
     * このクラスを継承してブロックを定義する.
     * addBR, addReceptor, addMultipleReceptor, addBlank,
     * addLabel, addTextForm, addSelectForm, addSliderFormなどを使用して, ブロックのレイアウトを設定する.
     * @param {String} edgeColor ブロックの枠の色.
     * @param {String} fillcolor ブロックの背景の色.
     [/lang]
     * @constructs
     * @extends enchant.block.Draggable
     */
    initialize: function(edgeColor, fillColor) {
        enchant.block.Draggable.call(this);
        var edgeColor = edgeColor || enchant.block._env.blockEdgeColor;
        var fillColor = fillColor || enchant.block._env.blockFillColor;
        fillColor = edgeColor;
        this.background = new enchant.block.BlockBG(this, edgeColor, fillColor);
        this._edgeColor = edgeColor;
        this._fillColor = fillColor;
        /**
         [lang:ja]
         * ブロックの一番親のブロック.
         [/lang]
         * @type {enchant.block.Block}
         */
        this.ancestor = this;
        /**
         [lang:ja]
         * ブロックのコネクタ.
         [/lang]
         * @type {enchant.block.Connector}
         */
        this.connector = null;
        /**
         [lang:ja]
         * ブロックが他のブロックに接続できるかどうか.
         [/lang]
         * @type {Boolean}
         */
        this.connectable = false;
        /**
         [lang:ja]
         * ブロックがiteratableかどうか.
         [/lang]
         * @type {Boolean}
         * @see enchant.block.Block#iteratize
         */
        this.iteratable = false;
        this._tail = false;
        this._parallel = false;
        this._nextReceptor = null;
        this._receptors = [];
        this._layout = [[]];
        this._variables = {};
        this._script = '';
        /**
         [lang:ja]
         * ブロックのコンストラクタ名.
         [/lang]
         * @type {String}
         */
        this.constructorName = _manager.findConstructorName(this.getConstructor());
        this.addEventListener(enchant.Event.ADDED_TO_SCENE, function() {
            this.background.refreshDraw();
            if (this._managed) {
                this.updateAncestor();
                this._register();
            }
        });
        this.addEventListener(enchant.Event.REMOVED_FROM_SCENE, function() {
            if (this._managed) {
                this.updateAncestor();
                this._unregister();
            }
        });
        this.addEventListener(enchant.Event.METRICS_CHANGED, this._onmetricschange);
        this.addEventListener(enchant.Event.INITIALIZE_END, function() {
            this._resize();
        });
        this.addEventListener(enchant.Event.ENTER_FRAME, function() {
            if (this.parentNode !== enchant.block.Manager.instance.targetGroup) {
                return;
            }
            var scene = this.scene;
            var ox = this._offsetX;
            var oy = this._offsetY;
            var metrics = calcSize(this);
            if (ox < -metrics.width || scene.width < ox || oy < -metrics.height || scene.height < oy) {
                this.visible = false;
            } else {
                this.visible = true;
            }
        });
    },
    _register: function() {
        _manager.registerBlock(this);
        this._receptors
            .filter(function(receptor) {
                return !!receptor.parentNode;
            })
            .forEach(function(receptor) {
                _manager.registerReceptor(receptor);
            });
    },
    _unregister: function() {
        _manager.unregisterBlock(this);
        this._receptors
            .filter(function(receptor) {
                return !!receptor.parentNode;
            })
            .forEach(function(receptor) {
                _manager.unregisterReceptor(receptor);
            });
    },
    /**
     [lang:ja]
     * ブロックのアクションを有効化する.
     [/lang]
     */
    enableAction: function() {
        if (this._managed) {
            return;
        }
        enchant.block.Draggable.prototype.enableManage.call(this);
        if (this.parentNode) {
            this._register();
        }
        var variable;
        for (var prop in this._variables) {
            variable = this._variables[prop];
            variable.touchEnabled = true;
        }
    },
    /**
     [lang:ja]
     * ブロックのアクションを無効化する.
     * アクションを無効化したブロックはドラッグできず, ブロックも接続できない.
     [/lang]
     */
    disableAction: function() {
        if (!this._managed) {
            return;
        }
        enchant.block.Draggable.prototype.disableManage.call(this);
        this._unregister();
        var variable;
        for (var prop in this._variables) {
            variable = this._variables[prop];
            variable.touchEnabled = false;
        }
    },
    /**
     [lang:ja]
     * ブロックの枠の色.
     * {@link enchant.block.BlockBG}が参考にする.
     [/lang]
     * @type {String}
     */
    edgeColor: {
        get: function() {
            return this._edgeColor;
        },
        set: function(color) {
            this._edgeColor = this.background.edgeColor = color;
            this.background._needUpdate = true;
            if (this.scene) {
                this.background.refreshDraw();
            }
        }
    },
    /**
     [lang:ja]
     * ブロックの背景の色.
     * {@link enchant.block.BlockBG}が参考にする.
     [/lang]
     * @type {String}
     */
    fillColor: {
        get: function() {
            return this._fillColor;
        },
        set: function(color) {
            this._fillColor = this.background.fillColor = color;
            this.background._needUpdate = true;
            if (this.scene) {
                this.background.refreshDraw();
            }
        }
    },
    /**
     [lang:ja]
     * ブロックの生成するスクリプトのテンプレート.
     * <% variable %>のフォーマットで埋め込みたい変数の値を指定できる.
     * {@link enchant.block.Block#compile}のオーバーライドすることでscriptの置換を使用しないこともできる.
     * @type {String}
     [/lang]
     */
    script: {
        get: function() {
            return this._script;
        },
        set: function(str) {
            this._script = str;
        }
    },
    /**
     [lang:ja]
     * データを生成して返す.
     * {@link enchant.block.Block#script}に設定された文字列に, ブロックの変数を埋め込んで返す.
     * 変数が存在しない場合, 空の文字列で置換される.
     * @return {String} scriptの置換結果.
     [/lang]
     */
    compile: function() {
        var compiled = this.script;
        (compiled.match(/<% ?[\s\S]*? ?%>/g) || []).forEach(function(variable) {
            var _var = variable.match(/<% ?(\w+)(?:\(([\s\S]+)\))? ?%>/);
            var name = _var[1];
            var separator = _var[2];
            var sentence = this.getSentence(name);
            var _sentence = '';
            if (separator) {
                for (var i = 0, l = sentence.length; i < l; i++) {
                    _sentence += sentence[i] + separator;
                }
                sentence = _sentence.slice(0, -separator.length);
            }
            compiled = compiled.replace(variable, sentence);
        }, this);
        return compiled;
    },
    _getSerializationSource: function() {
        var obj = {};
        obj.x = parseInt(this.x, 10);
        obj.y = parseInt(this.y, 10);
        obj.constructorName = this.constructorName;
        obj.variables = {};
        var variable;
        var val;
        for (var name in this._variables) {
            variable = this._variables[name];
            if (!variable.serializable) {
                continue;
            }
            if (variable instanceof enchant.block.Receptor &&
                variable.received) {
                val = variable.received.parentNode._getSerializationSource();
            } else {
                val = variable.value;
            }
            obj.variables[name] = (typeof val !== 'undefined') ? val : null;
        }
        if (this.iteratable) {
            if (this.next instanceof enchant.block.Block) {
                obj.next = this.next._getSerializationSource();
            } else {
                obj.next = null;
            }
        }
        return obj;
    },
    /**
     [lang:ja]
     * ブロックをシリアライズして返す.
     * ブロックの位置, コンストラクタ名, 変数の値を保持したオブジェクトの配列を返す.
     * シリアライズしたデータからブロックを生成する場合は,
     * {@link enchant.block.Block#createFromSerializedData}を使用する.
     * @return {String} シリアライズ結果.
     [/lang]
     */
    serialize: function() {
        return this._getSerializationSource();
    },
    /**
     [lang:ja]
     * ブロックの要素のレイアウトの開始位置を折り返す.
     [/lang]
     */
    addBR: function() {
        this._layout.push([]);
    },
    /**
     [lang:ja]
     * ブロックが接続できるReceptorのタイプを設定する.
     * @see enchant.block.Connector
     * @see enchant.block.Receptor
     * @see enchant.block.MultipleReceptor
     * @param {String|Array.<String>} type 接続できるようにしたいReceptorのtype.
     [/lang]
     */
    setConnectTarget: function(type) {
        if (this.connectable) {
            this.connector.type = type;
        } else {
            this.connector = new enchant.block.Connector(type);
            this.connector.parentNode = this;
            this.connectable = true;
        }
    },
    /**
     [lang:ja]
     * ブロックをひとつだけ接続できるReceptorを追加する.
     * @param {String|Array.<String>} type 接続させたいBlockのtype.
     * @param {String} name 名前.
     * @return {enchant.block.Receptor} 追加されたReceptor.
     [/lang]
     */
    addReceptor: function(type, name) {
        var receptor = new enchant.block.Receptor(type, this);
        return this._addElement(receptor, name, true);
    },
    /**
     [lang:ja]
     * ブロックを複数接続できるReceptorを追加する.
     * @param {String|Array.<String>} type 接続させたいBlockのtype.
     * @param {String} name 名前.
     * @return {enchant.block.MultipleReceptor} 追加されたMultipleReceptor.
     [/lang]
     */
    addMultipleReceptor: function(type, name) {
        var receptor = new enchant.block.MultipleReceptor(type, this);
        return this._addElement(receptor, name, true);
    },
    /**
     [lang:ja]
     * ブロックに空白を追加する.
     * @param {Number} width 空白の横幅.
     * @param {Number} height 空白の縦幅.
     * @return {enchant.Entity} 追加されたダミーのEntity.
     [/lang]
     */
    addBlank: function(w, h) {
        var entity = new enchant.Entity();
        entity.width = w;
        entity.height = h;
        return this._addElement(entity);
    },
    /**
     [lang:ja]
     * ブロックにラベルを追加する.
     * @param {String} text ラベルの表示テキスト.
     * @param {String} name 名前.
     * @param {Boolean} [serializable] シリアライズ結果に含めるかかどうか.
     * @return {enchant.block.BlockLabel} 追加されたBlockLabel.
     [/lang]
     */
    addLabel: function(str, name, serializable) {
        var font = enchant.block._env.blockLabelFont;
        var color = enchant.block._env.blockLabelColor;
        var label = enchant.block.BlockLabel.create(str, font, color);
        return this._addElement(label, name, serializable);
    },
    /**
     [lang:ja]
     * ブロックに文字入力のフォームを追加する.
     * @param {*} value フォームの初期値.
     * @param {String} name 名前.
     * @return {enchant.block.InputTextBox} 追加されたInputTextBox.
     [/lang]
     */
    addTextForm: function(val, name) {
        var form = new enchant.block.InputTextBox();
        if (val) {
            form.value = val;
        }
        return this._addElement(form, name, true);
    },
    /**
     [lang:ja]
     * ブロックに選択入力のフォームを追加する.
     * @param {Object} option フォームの選択肢とその値の連想配列.
     * @param {String} name 名前.
     * @return {enchant.block.InputSelectBox} 追加されたInputSelectBox.
     [/lang]
     */
    addSelectForm: function(opt, name) {
        var form = new enchant.block.InputSelectBox(revertKeyValue(opt));
        return this._addElement(form, name, true);
    },
    /**
     [lang:ja]
     * ブロックに数値入力のフォームを追加する.
     * @param {Object} value フォームの初期値.
     * @param {String} name 名前.
     * @return {enchant.block.InputSliderBox} 追加されたInputSliderBox.
     [/lang]
     */
    addSliderForm: function(value, name) {
        var form = new enchant.block.InputSliderBox(-10, 10, 0, value);
        return this._addElement(form, name, true);
    },
    /**
     [lang:ja]
     * ブロックに変数表示を操作するボタンを追加する.
     * ボタンは文字列({@link enchant.block.BlockLabel)として表示される.
     * 表示, 非表示の状態はBlock#_variable[name]として保存される.
     * @param {String} open 閉じている状態の表示.
     * @param {String} close 開いている状態の表示.
     * @param {String|String[]} targets fold, unfoldしたい変数の名前.
     * @param {String} [name] 自身の名前.
     * @return {enchant.block.BlockLabel} 追加されたBlockLabel.
     [/lang]
     */
    addFoldButton: function(open, close, targets, name) {
        name = name || 'fold';
        if (!(targets instanceof Array)) {
            targets = [ targets ];
        }
        return this.addLabel(close, name, true)
            .on(enchant.Event.CHANGE, function() {
                var block = this.parentNode;
                var method = ((this.value === open) ? 'hide' : 'appear') + 'Variable';
                targets.forEach(function(type) {
                    block[method](type);
                });
                block.dispatchEvent(new enchant.Event(enchant.Event.METRICS_CHANGED));
            })
            .on(enchant.Event.TOUCH_END, function() {
                if (this.value === open) {
                    this.value = close;
                } else {
                    this.value = open;
                }
            });
    },
    /**
     [lang:ja]
     * ブロックを直列に接続できるように設定する.
     * {@link enchant.block.Block#setConnectTarget}で設定したタイプと同じタイプのブロックが下に接続できるようになる.
     * connectTargetを設定していない場合は, 引数にtypeを指定する必要がある.
     * ブロックに特別なReceptorを設定するため, iteratizeの呼び出し後にレイアウトを追加することはできない.
     * @param {String} [type] タイプ.
     [/lang]
     */
    iteratize: function(type) {
        if (this.connectable) {
            if (this._lastLine.length) {
                this.addBR();
            }
            var receptor = new enchant.block.Receptor(this.connector.type, this);
            var C_B_OFST = getBGAsset(this.edgeColor, 'C_B').height / 2;
            receptor.width = receptor._defaultWidth = C_B_OFST;
            receptor.height = receptor._defaultHeight = C_B_OFST;
            this._nextReceptor = receptor;
            this._addElement(receptor);
            this.iteratable = true;
        } else if (type) {
            this.setConnectTarget(type);
            this.iteratize();
        } else {
            throw new Error('Block.iteratize() should call after set connect target');
        }
    },
    /**
     [lang:ja]
     * ブロックをiteratableなブロックの末尾になるよう設定する.
     * このメソッドを呼び出してあるブロックの後ろにブロックを接続することができなくなる.
     * iteratableでないブロックで呼び出しても意味は無い.
     [/lang]
     */
    tail: function() {
        if (!this.iteratable || this._tail) {
            throw new Error('');
        }
        this._tail = true;
        var receptor = this._nextReceptor;
        this._removeElement(receptor);
    },
    /**
     [lang:ja]
     * ブロックを順不同に扱っても問題ないことを設定する.
     * ブロックの見た目に影響する.
     * iteratableでないブロックで呼び出しても何も起きない.
     * @type {Boolean}
     [/lang]
     */
    parallel: {
        get: function() {
            return this._parallel;
        },
        set: function(parallel) {
            this._parallel = parallel;
        }
    },
    /**
     [lang:ja]
     * 次のブロック.
     * iteratableなブロックでのみ取得できる.
     [/lang]
     * @type {enchant.block.Block}
     * @see enchant.block.Block#iteratize
     */
    next: {
        get: function() {
            if (this.iteratable && !this._tail && this._nextReceptor.received) {
                return this._nextReceptor.received.parentNode;
            } else {
                return null;
            }
        }
    },
    /**
     [lang:ja]
     * 前のブロック.
     * iteratableなブロックでのみ取得できる.
     [/lang]
     * @type {enchant.block.Block}
     * @see enchant.block.Block#iteratize
     */
    prev: {
        get: function() {
            if (this.iteratable && this.connector.connected) {
                return this.connector.connected.parentNode;
            } else {
                return null;
            }
        }
    },
    /**
     [lang:ja]
     * 変数の値をリスト化した値.
     * @type {Array.<*>}
     [/lang]
     * @private
     */
    value: {
        get: function() {
            var ret = [];
            var line, element;
            var val;
            for (var i = 0, l = this._layout.length; i < l; i++) {
                line = this._layout[i];
                for (var j = 0, ll = line.length; j < ll; j++) {
                    element = line[j];
                    if (element === this._nextReceptor) {
                        continue;
                    } else if (element instanceof enchant.block.Receptor) {
                        if (element.received) {
                            ret.push(element.received.parentNode.mappedValue);
                        } else {
                            ret.push(null);
                        }
                    } else if (typeof (val = element.value) !== 'undefined') {
                        ret.push(val);
                    }
                }
            }
            return ret;
        }
    },
    /**
     [lang:ja]
     * 自身とその後に続くブロックの{@link enchant.block.Block#value}のリスト.
     * iteratableでないブロックの場合は空の配列となる.
     * @type {Array.<*>}
     [/lang]
     * @private
     */
    mappedValue: {
        get: function() {
            return this.getIterated().map(function(block) {
                return block.value;
            });
        }
    },
    /**
     [lang:ja]
     * 変数のフォームを表示する.
     * @param {String} name 変数名.
     [/lang]
     */
    appearVariable: function(name) {
        var element = this._variables[name];
        if (element && !element.parentNode) {
            this.addChild(element);
        }
        if (element instanceof enchant.block.Receptor) {
            _manager.registerReceptor(element);
        }
    },
    /**
     [lang:ja]
     * 変数のフォームを非表示にする.
     * @param {String} name 変数名.
     [/lang]
     */
    hideVariable: function(name) {
        var element = this._variables[name];
        if (element && element.parentNode) {
            this.removeChild(element);
        }
        if (element instanceof enchant.block.Receptor) {
            _manager.unregisterReceptor(element);
        }
    },
    /**
     [lang:ja]
     * 変数名から値を取得する.
     * addLabel, addTextForm, addSelectForm, addSliderFormで追加した変数はそれぞれの要素が持つ値の文字列,
     * addReceptor, addMultipleReceptorで追加した変数はReceptorに接続されているブロックの生成結果のリストが返される.
     * @param {String} name 変数名.
     * @return {String|Array.<string>} 変数の値.
     [/lang]
     */
    getSentence: function(name) {
        var element = this._variables[name];
        var sentence = '';
        if (element) {
            if (element instanceof enchant.block.Receptor) {
                if (element.received) {
                    sentence = element.received.parentNode.getCompiledData();
                }
            } else {
                sentence = element.value;
            }
        }
        return sentence;
    },
    /**
     [lang:ja]
     * ブロックの生成結果を返す.
     * iteratableなブロックなら呼び出し元インスタンスから末尾までの生成結果のリストを,
     * iteratableでないブロックなら自身の生成結果をそのまま返す.
     * @return {String|Array.<string>} 生成結果.
     [/lang]
     * @private
     */
    getCompiledData: function() {
        if (typeof this.compile === 'function') {
            if (this.iteratable) {
                return this.getIterated().map(function(block) {
                    return block.compile();
                });
            } else {
                return this.compile();
            }
        }
    },
    /**
     [lang:ja]
     * {@link enchant.block.Block#ancestor}を更新する.
     [/lang]
     * @private
     */
    updateAncestor: function() {
        var block = this;
        var parent;
        while (block) {
            parent = block.parentNode;
            if (parent instanceof enchant.block.Receptor) {
                block = parent.parentNode;
            } else {
                break;
            }
        }
        this.ancestor = block;
    },
    /**
     [lang:ja]
     * ブロックの接続順と同じ順番の配列を返す.
     * iteratableでないブロックからは空の配列が返る.
     * @return {Array.<enchant.block.Block} ブロックの配列.
     [/lang]
     * @see enchant.block.Block#iteratize
     */
    getIterated: function() {
        var ret = [];
        var block = this;
        if (this.iteratable) {
            while (block) {
                ret.push(block);
                block = block.next;
            }
        }
        return ret;
    },
    /**
     [lang:ja]
     * ブロックのサイズを取得する.
     * iteratableなブロックの場合は後に続くブロックも含んだサイズを返す.
     * @return {Object} width,heightを保持したオブジェクト.
     [/lang]
     * @see enchant.block.Block#iteratize
     */
    getMetrics: function() {
        var w = 0;
        var C_B_OFST = getBGAsset(this.edgeColor, 'C_B').height / 2;
        var h = C_B_OFST;
        if (this.iteratable) {
            this.getIterated().forEach(function(block) {
                if (w < block.width) {
                    w = block.width;
                }
                h += block.height - C_B_OFST;
            });
        } else {
            w = this.width;
            h = this.height - C_B_OFST;
        }
        return {
            width: w,
            height: h
        };
    },
    _addVariable: function(name, entity) {
        if (entity instanceof enchant.Entity) {
            this._variables[name] = entity;
        } else {
            this._variables[name] = new enchant.block.BlockVariable(name);
        }
        return this._variables[name];
    },
    _removeVariable: function(name) {
        delete this._variables[name];
    },
    _addElement: function(element, name, serializable) {
        if (this.iteratable) {
            throw new Error('Block.iteratize() should call at last');
        }
        this.addChild(element);
        this._lastLine.push(element);
        if (name) {
            this._addVariable(name, element);
        }
        if (element instanceof enchant.block.Receptor) {
            this._receptors.push(element);
            element.addEventListener(enchant.Event.CONNECTION_CHANGED, function() {
                this._fitSize();
            });
            element._setDefaultSize();
        } else if (element instanceof enchant.widget.input.Input) {
            if (!element._listeners[enchant.Event.CHANGE]) {
                element._listeners[enchant.Event.CHANGE] = [];
            }
            element.__onchange = function() {
                if (this.parentNode) {
                    this.parentNode.dispatchEvent(new enchant.Event(enchant.Event.METRICS_CHANGED));
                }
            };
            element._listeners[enchant.Event.CHANGE].push(element.__onchange);
        }
        if (serializable) {
            element.serializable = true;
        } else {
            element.serializable = false;
        }
        return element;
    },
    _removeElement: function(element, name) {
        this.removeChild(element);
        var line, k;
        for (var i = 0, l = this._layout.length; i < l; i++) {
            line = this._layout[i];
            k = line.indexOf(element);
            if (k !== -1) {
                line.splice(k, 1);
                break;
            }
        }
        if (name) {
            this._removeVariable(name);
        }
        if (element instanceof enchant.block.Receptor) {
            k = this._receptors.indexOf(element);
            if (k !== -1) {
                this._receptors.splice(k, 1);
            }
            _manager.unregisterReceptor(element);
            element.clearEventListener(enchant.Event.CONNECTION_CHANGED);
            if (element === this._nextReceptor) {
                this._nextReceptor = null;
            }
        } else if (element instanceof enchant.widget.input.Input) {
            element.removeEventListener(enchant.Event.CHANGE, element.__onchange);
            delete element.__onchange;
        }
    },
    _onmetricschange: function(e) {
        this._resize();
        if (this.parentNode && this.parentNode instanceof enchant.block.Receptor) {
            this.parentNode._fitSize();
        }
        if (this.connectable && this.connector.connected) {
            this.connector.connected.parentNode.dispatchEvent(e);
        }
    },
    _resize: function() {
        var layout = this._layout;
        var maxWidth = 0;
        var currentHeight = 10;
        var i, j, l, ll, line, lineOffset, element, currentWidth, maxHeight;
        for (i = 0, l = layout.length; i < l; i++) {
            line = layout[i];
            currentWidth = 12;
            maxHeight = 0;
            lineOffset = 0;
            for (j = 0, ll = line.length; j < ll; j++) {
                element = line[j];
                if (!element.parentNode) {
                    continue;
                }
                lineOffset = 9;
                element.x = currentWidth;
                element.y = currentHeight;
                if (element === this._nextReceptor) {
                    continue;
                }
                currentWidth += element.width + 4;
                maxHeight = Math.max(maxHeight, element.height);
            }
            if (element instanceof enchant.block.MultipleReceptor) {
                currentWidth -= element.width;
            }
            maxWidth = Math.max(maxWidth, currentWidth);
            currentHeight += maxHeight + lineOffset;
        }
        var C_B_OFST = getBGAsset(this.edgeColor, 'C_B').height / 2;
        if (this._nextReceptor) {
            i--;
            this._nextReceptor.x = 0;
            this._nextReceptor.y = currentHeight - C_B_OFST;
        } else {
            currentHeight += 6;
        }
        line = layout[i - 1];
        for (j = 0, ll = line.length; j < ll; j++) {
            element = line[j];
            if (element instanceof enchant.block.Receptor) {
                currentHeight += 8;
                if (this._nextReceptor) {
                    this._nextReceptor.y += 8;
                }
                break;
            }
        }
        maxWidth += 12;
        var changed = (this.width !== maxWidth || this.height !== currentHeight);
        this.width = maxWidth;
        this.height = currentHeight;
        if (changed) {
            this.background._needUpdate = true;
        }
        if (this.scene) {
            this.background.refreshDraw();
        }
    },
    _lastLine: {
        get: function() {
            var layout = this._layout;
            return layout[layout.length - 1];
        }
    },
    _lastElement: {
        get: function() {
            var line = this._lastLine;
            return line[line.length - 1];
        }
    }
});

var _callStackCount = 0;
enchant.block.Block._inherited = function(SubClass) {
    enchant.Entity._inherited(SubClass);
    SubClass.prototype._$initialize = SubClass.prototype.initialize;
    SubClass.prototype.initialize = function() {
        _callStackCount++;
        SubClass.prototype._$initialize.apply(this, arguments);
        _callStackCount--;
        if (_callStackCount === 0) {
            this.dispatchEvent(new enchant.Event(enchant.Event.INITIALIZE_END));
        }
    };
};

/**
 [lang:ja]
 * シリアライズされたデータからブロックを生成する.
 * ブロックのコンストラクタがManagerにロードされている必要がある.
 * @param {Object} シリアライズされたデータ.
 * @return {enchant.block.Block} 生成したブロック.
 [/lang]
 * @static
 */
enchant.block.Block.createFromSerializedData = function(data) {
    var variable, child, next;
    var variables = data.variables;
    var Constructor = _manager.findConstructor(data.constructorName);
    var block = new Constructor();
    block.x = data.x;
    block.y = data.y;
    for (var name in block._variables) {
        variable = variables[name];
        if (block._variables[name] instanceof enchant.block.Receptor) {
            if (variable) {
                child = this.createFromSerializedData(variable);
                child.connector.connect(block._variables[name]);
            }
        } else if (variable != null) {
            block._variables[name].value = variable;
        }
    }
    if (block.iteratable && data.next !== null) {
        next = this.createFromSerializedData(data.next);
        next.connector.connect(block._nextReceptor);

    }
    return block;
};

function calcSize(block) {
    var ret = {
        width: 0,
        height: 0
    };
    (function calc(block, x, y) {
        var w = x + block.width;
        var h = y + block.height;
        if (w > ret.width) {
            ret.width = w;
        }
        if (h > ret.height) {
            ret.height = h;
        }
        var receptors = block._receptors;
        var receptor;
        for (var i = 0, l = receptors.length; i < l; i++) {
            receptor = receptors[i];
            if (receptor.received) {
                calc(receptor.received.parentNode, x + receptor.x, y + receptor.y);
            }
        }
    }(block, 0, 0));
    return ret;
}

/**
 [lang:ja]
 * ブロックの状態をSurfaceに書き写して返す.
 * @param {enchant.block.Block} 描画したいブロック.
 * @return {enchant.Surface} ブロックが描画されたSurface.
 [/lang]
 * @static
 */
enchant.block.Block.createBlockImageSurface = function(block) {
    var propNames = [ 'x', 'y', 'scaleX', 'scaleY', 'rotation', 'visible' ];
    var copy = function(from, to, propNames) {
        propNames.forEach(function(prop) {
            to[prop] = from[prop];
        });
    };
    var tmp = {};
    copy(block, tmp, propNames);
    block.x = 0;
    block.y = 0;
    block.scaleX = 1;
    block.scaleY = 1;
    block.rotation = 0;
    var isAppear = (block.scene instanceof enchant.Scene);
    if (!isAppear) {
        // for attach cvsCache
        block.visible = false;
        enchant.Core.instance.currentScene.addChild(block);
        block.visible = true;
    }
    var metrics = calcSize(block);
    var sf = new enchant.Surface(metrics.width, metrics.height);
    enchant.CanvasRenderer.instance.render(sf.context, block, new enchant.Event(enchant.Event.RENDER));
    if (!isAppear) {
        enchant.Core.instance.currentScene.removeChild(block);
    }
    copy(tmp, block, propNames);
    return sf;
};

/**
 * @scope enchant.block.InputSelectBox.prototype
 */
enchant.block.InputSelectBox = enchant.Class.create(enchant.widget.input.InputSelectBox, {
    /**
     * @name enchant.block.InputSelectBox
     * @class
     [lang:ja]
     * ブロックの選択入力フォームに使われるInputSelectBox.
     * @param {Object} option 選択肢とその値の連想配列.
     [/lang]
     * @constructs
     * @extends enchant.widget.input.InputSelectBox
     */
    initialize: function(opt) {
        enchant.widget.input.InputSelectBox.call(this, opt);
    },
    _serializeVariableNames: function(opt) {
        var ret = [];
        var varName;
        for (var prop in opt) {
            varName = opt[prop];
            if (varName instanceof Array) {
                for (var i = 0, l = varName.length; i < l; i++) {
                    ret.push(varName[i]);
                }
            } else {
                ret.push(varName);
            }
        }
        return ret;
    },
    /**
     [lang:ja]
     * 選択肢に応じてブロックの表示を変更するよう設定する.
     * @example
     * HogeFugaBlock = enchant.Class.create(enchant.block.Block, {
     *     initialize: function() {
     *         enchant.block.Block.call(this);
     *         //ほげを選択したとき, variable1をブロックに表示する.
     *         //ふがを選択したとき, variable2, variable3をブロックに表示する.
     *         this.addSelectForm({
     *             'ほげ': 'hoge',
     *             'ふが': 'fuga'
     *         }, 'hogeorfuga')
     *         .combo({
     *             'hoge': 'variable1',
     *             'fuga': 'variable2 variable3'
     *         });
     *         this.addTextForm('', 'variable1');
     *         this.addTextForm('', 'variable2');
     *         this.addTextForm('', 'variable3');
     *         ...
     *     }
     * });
     * @param {Object} option 値とその値のときに表示したい変数の名前.
     * @return {enchant.block.InputSelectBox} メソッドを呼び出したインスタンス.
     [/lang]
     */
    combo: function(opt) {
        var block = this.parentNode;
        var names = this._serializeVariableNames(opt);
        this._combo = opt;
        this.addEventListener(enchant.Event.CHANGE, function() {
            var i, l, varName, becomeEnable;
            for (i = 0, l = names.length; i < l; i++) {
                varName = names[i];
                block.hideVariable(varName);
            }
            becomeEnable = opt[this.selected];
            if (!(becomeEnable instanceof Array)) {
                becomeEnable = [ becomeEnable ];
            }
            for (i = 0, l = becomeEnable.length; i < l; i++) {
                varName = becomeEnable[i];
                block.appearVariable(varName);
            }
        });
        this.parentNode.addEventListener(enchant.Event.ADDED_TO_SCENE, (function(self) {
            return function() {
                self.dispatchEvent(new enchant.Event(enchant.Event.CHANGE));
            };
        }(this)));
        return this;
    }
});

/**
 * @scope enchant.block.InputTextBox.prototype
 */
enchant.block.InputTextBox = enchant.Class.create(enchant.widget.input.InputTextBox, {
    /**
     * @name enchant.block.InputTextBox
     * @class
     [lang:ja]
     * ブロックの自由入力フォームに使われるInputTextBox.
     * window.promptを使用する.
     [/lang]
     * @constructs
     * @extends enchant.widget.input.InputTextBox
     */
    initialize: function() {
        enchant.widget.input.InputTextBox.call(this);
        this.promptString = RES('general.InputTextBox.prompt');
    },
    /**
     [lang:ja]
     * window.promptの表示を設定する.
     * @param {String} str 設定する文字列.
     * @return {enchant.block.InputTextBox} メソッドを呼び出したインスタンス.
     [/lang]
     */
    prompt: function(str) {
        this.promptString = str;
        return this;
    }
});

/**
 * @scope enchant.block.InputSliderBox.prototype
 */
enchant.block.InputSliderBox = enchant.Class.create(enchant.block.InputTextBox, {
    /**
     * @name enchant.block.InputSliderBox
     * @class
     [lang:ja]
     * ブロックの数値入力フォームに使われるInputTextBox.
     * 入力に{@link enchant.widget.SlideBar}を使用する.
     * @param {Number} min SlideBarの最小値.
     * @param {Number} max SlideBarの最大値.
     * @param {Number} precision SlideBarの小数点以下の桁数.
     * @param {Number} value SlideBarの初期値.
     [/lang]
     * @constructs
     * @extends enchant.block.InputTextBox
     */
    initialize: function(min, max, precision, value) {
        enchant.block.InputTextBox.call(this);
        var slideBar = this.slideBar = new enchant.widget.SlideBar(min, max, precision, value);
        this.value = slideBar.value;
        var that = this;
        var waiting;
        slideBar.knob._listeners[enchant.Event.TOUCH_MOVE].push(function() {
            that.value = slideBar.value;
        });
        this.addEventListener(enchant.Event.CHANGE, function() {
            slideBar.value = this.value;
        });
        this._inputMethod = function(callback) {
            if (waiting) {
                return;
            }
            var inputBlur = function(e) {
                if (e.focus !== slideBar) {
                    if (slideBar.parentNode) {
                        slideBar.parentNode.removeChild(slideBar);
                    }
                    callback.call(this, this.value);
                    this.removeEventListener(enchant.Event.BLUR, inputBlur);
                    waiting = false;
                }
            };
            this.addEventListener(enchant.Event.BLUR, inputBlur);
            var slideBarBlur = function(e) {
                callback.call(that, this.value);
                this.removeEventListener(enchant.Event.BLUR, slideBarBlur);
                waiting = false;
            };
            slideBar.addEventListener(enchant.Event.BLUR, slideBarBlur);
            waiting = true;
        };
        this.addEventListener(enchant.Event.FOCUS, function() {
            if (slideBar.parentNode) {
                return;
            }
            slideBar.x = this._offsetX + this.width / 2 - slideBar.width / 2;
            slideBar.y = this._offsetY + this.height;
            this.scene.addChild(slideBar);
        });
        slideBar.addEventListener(enchant.Event.BLUR, function() {
            this.parentNode.removeChild(this);
        });
    },
    /**
     [lang:ja]
     * InputTextBoxの最小値と最大値を設定する.
     * @see enchant.widget.SlideBar#min
     * @see enchant.widget.SlideBar#max
     * @param {Number} min SlideBarの最小値.
     * @param {Number} max SlideBarの最大値.
     * @param {Number} [value] 範囲更新後にセットする値.
     * @return {enchant.block.InputSelectBox} メソッドを呼び出したインスタンス.
     [/lang]
     */
    range: function(min, max, value) {
        this.slideBar._min = min;
        this.slideBar._max = max;
        this.slideBar._updateKnobPosition();
        if (typeof value === 'number') {
            this.slideBar.value = this.value = value;
        }
        return this;
    },
    /**
     [lang:ja]
     * InputTextBoxの精度を設定する.
     * @see enchant.widget.SlideBar#precision
     * @param {Number} precision SlideBarの小数点以下の桁数.
     * @return {enchant.block.InputSelectBox} メソッドを呼び出したインスタンス.
     [/lang]
     */
    precision: function(prec) {
        this.slideBar.precision = prec;
        return this;
    }
});

enchant.block.Block.selector = function(obj, expression) {
    var ret = [];
    if (obj instanceof Array) {
        queue = obj.slice();
    } else {
        queue = [ obj ];
    }
    while (queue.length) {
        obj = queue.shift();
        if (compare(obj, expression)) {
            ret.push(obj);
        }
        for (var prop in obj) {
            if (typeof obj[prop] === 'object' && obj[prop] !== null) {
                queue.push(obj[prop]);
            }
        }
    }
    return ret;
};

var compare = function(obj, expression) {
    var expr;
    for (var prop in expression) {
        expr = expression[prop];
        if (typeof obj[prop] === 'undefined') {
            return false;
        }
        if (typeof expr === 'object') {
            if (!compare(obj[prop], expr)) {
                return false;
            }
        } else if (obj[prop] !== expr) {
            return false;
        }
    }
    return true;
};

var revertKeyValue = function(obj) {
    var ret = {};
    for (var prop in obj) {
        ret[obj[prop]] = prop;
    }
    return ret;
};

})();

} else {
    throw 'require enchant.widget';
}
