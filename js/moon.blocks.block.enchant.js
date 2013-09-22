enchant.block.blocks.moon = {
    desc: {
        blockCategory: 'MOON'
    }
};

enchant.block.blocks.moon.EndBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this, '#3399cc');
        this.setConnectTarget('evalable');
        this.addLabel(RES('blocks.EndBlock.name'));
        this.iteratize();
        this.tail();
        this.script = 'enchant.puppet.stopTheatre();';
    }
});

enchant.block.EndableBlockPrototype = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.apply(this, arguments);
        this.addEventListener(enchant.Event.INITIALIZE_END, function() {
            var end = new enchant.block.blocks.moon.EndBlock();
            end.disableManage();
            setTimeout(function() {
                this._nextReceptor.addChild(end);
            }.bind(this), 34);
            this._listeners[enchant.Event.ADDED_TO_SCENE].push(function() {
                enchant.block.Manager.instance.unregisterReceptor(this._nextReceptor);
            });
            end.disableManage();
        });
    }
});

enchant.block.blocks.moon.SearchBlock = enchant.Class.create(enchant.block.EndableBlockPrototype, {
    initialize: function() {
        enchant.block.EndableBlockPrototype.call(this, '#3399cc');
        this.setConnectTarget('evalable');
        this.addLabel(RES('blocks.SearchBlock.name'));
        this.addSelectForm(pairsToOption([
            [ 'blocks.opt.link.web', 'Web' ],
            [ 'blocks.opt.link.page', 'Page' ],
        ]), 'type');
        this.addTextForm('', 'str');
        this.iteratize();
        this.script = 'MOON.search<% type %>("<% str %>");' +
            'enchant.puppet.stopTheatre();';
    }
});

enchant.block.blocks.moon.LinkBlock = enchant.Class.create(enchant.block.EndableBlockPrototype, {
    initialize: function() {
        enchant.block.EndableBlockPrototype.call(this, '#3399cc');
        this.setConnectTarget('evalable');
        this.addLabel(RES('blocks.LinkBlock.name'));
        this.addBlank(64, 0);
        var thumb = new enchant.Sprite(64, 96);
        thumb.backgroundColor = '#ffffff';
        thumb.x = 172;
        thumb.y = 10;
        thumb.addEventListener('touchend', function() {
            var block = thumb.parentNode;
            if (window.MOON) {
                window.MOON.openNotebook(function(pageId) {
                    block._variables.link.value = pageId;
                });
            } else {
                block._variables.link.value = window.prompt(RES('blocks.LinkBlock.prompt.page'));
            }
        });
        thumb.visible = false;
        this.addChild(thumb);
        this.addBR();
        this.addSelectForm(pairsToOption([
            [ 'blocks.opt.link.web', 'Url' ],
            [ 'blocks.opt.link.page', 'Page' ],
        ]), 'type')
        .on('change', function() {
            var block = this.parentNode;
            if (this.value === 'Url') {
                thumb.visible = false;
                block._variables.link.visible = true;
            } else {
                thumb.visible = true;
                block._variables.link.visible = false;
            }
            block._variables.link.value = '';
            thumb.image = null;
        });
        this.addBR();
        this.addTextForm('', 'link')
            .prompt(RES('blocks.LinkBlock.prompt.web'))
            .on('change', function() {
                var pageId;
                var block = this.parentNode;
                if (block.getSentence('type') === 'Page') {
                    if (window.MOON) {
                        pageId = this.value;
                        if (pageId) {
                            setTimeout(function() {
                                var canvas = window.MOON.getPageThumbnail(pageId);
                                var w = canvas.width;
                                var h = canvas.height;
                                var sf = new enchant.Surface(w, h);
                                var ctx = sf._element.getContext('2d');
                                ctx.drawImage(canvas, 0, 0, w, h, 0, 0, thumb.width, thumb.height);
                                thumb.image = sf;
                            }, 34);
                        }
                    }
                }
            });
        var link = this._variables.link;
        link.width = link.minWidth = 236;
        this.iteratize();
    },
    script: {
        get: function() {
            return 'MOON.open<% type %>("<% link %>");enchant.puppet.stopTheatre();';
        }
    }
});
enchant.block.blocks.moon.LinkBlock.getSpecifiedLinkRef = function(type) {
    return this.collection
        .filter(function(b) {
            return b.getSentence('type') === type;
        })
        .map(function(b) {
            return b.getSentence('link');
        });
};

enchant.block.blocks.moon.PenBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this, '#3399cc');
        this.setConnectTarget('evalable');
        this.addLabel(RES('blocks.PenBlock.name'));
        this.addSelectForm(pairsToOption([
            [ 'blocks.PenBlock.opt.thickness', 'thick' ],
            [ 'blocks.PenBlock.opt.color', 'color' ]
        ]), 'type')
        .combo({
            'thick': 'thick',
            'color': 'color'
        });
        this.addSliderForm(0, 'thick')
            .range(2, 40)
            .precision(1);
        this.addColorForm('color');
        this.iteratize();

        setTimeout(function() {
            new enchant.block.blocks.moon.EndBlock().connector.connect(this._nextReceptor);
        }.bind(this), 34);
    },
    script: {
        get: function() {
            if (this.getSentence('type') == 'color') {
                return 'MOON.setPenColor(<% color %>);';
            } else if (this.getSentence('type') == 'thick') {
                return 'MOON.setPenWidth("" + <% thick %>);';
            }
        }
    }
});

enchant.block.blocks.moon.StickerBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function(imgPath) {
        enchant.block.Block.call(this, '#ffa500');
        enchant.block.SingletonBlockPrototype.singletonize(this);

        this.addLabel(RES('blocks.StickerBlock.name'));
        this.addTextForm(RES('blocks.StickerBlock.name').toLowerCase(), 'name');
        this.addFoldButton('+', '-', [
            'image', 'taptext', 'ontap',
            'attachtext', 'onattach',
            'detachtext', 'ondetach'
        ]);
        this.addBR();

        /*
        var thumb = enchant.block.blocks.moon.StickerBlock.getStaticThumb();
        var imageSelect = new enchant.Sprite(thumb.width, thumb.height);
        imageSelect.backgroundColor = '#000000';
        imageSelect.image = thumb;
        this._addElement(imageSelect, 'image', true);
        this.addBR();
        */

        this.addLabel(RES('blocks.StickerBlock.label.tap'), 'taptext');
        this.addBR();
        this.addBlank(20, 0);
        this.addMultipleReceptor('evalable', 'ontap');
        this.addBR();

        this.addLabel(RES('blocks.StickerBlock.label.attach'), 'attachtext');
        this.addBR();
        this.addBlank(20, 0);
        this.addMultipleReceptor('evalable', 'onattach');
        this.addBR();

        this.addLabel(RES('blocks.StickerBlock.label.detach'), 'detachtext');
        this.addBR();
        this.addBlank(20, 0);
        this.addMultipleReceptor('evalable', 'ondetach');
        this.addBR();

        this.script = 'StickerPuppet.create("<% name %>", {\n' +
            'behavior: [' +
                '{' +
                    'stickertap: function(event) {' +
                        '<% ontap(\n) %>' +
                    '},' +
                    'stickerattach: function(event) {' +
                        '<% onattach(\n) %>' +
                    '},' +
                    'stickerdetach: function(event) {' +
                        '<% ondetach(\n) %>' +
                    '}' +
                '}]' +
            '});';
    }
});
enchant.block.blocks.moon.StickerBlock.drawThumb = function(sf, cvs) {
    var s = Math.min(48 / cvs.width, 48 / cvs.height);
    var sw = cvs.width * s;
    var sh = cvs.height * s;
    var ctx = sf._element.getContext('2d');
    ctx.clearRect(0, 0, 48, 48);
    enchant.puppet.ImageThumbSurface.prototype.drawBackground.call(sf, ctx, 6);
    ctx.drawImage(cvs, 0, 0, cvs.width, cvs.height, (48 - sw) / 2, (48 - sh) / 2, sw, sh);
    return this._thumb;
};
enchant.block.blocks.moon.StickerBlock._thumb = null;
enchant.block.blocks.moon.StickerBlock.getStaticThumb = function() {
    if (!this._thumb) {
        this._thumb = new enchant.Surface(48, 48);
    }
    var cvs;
    if (window.__moon__) {
        cvs = MOON.getEditPaperThumbnail();
    } else {
        cvs = document.createElement('canvas');
    }
    this.drawThumb(this._thumb, cvs);
    return this._thumb;
};

enchant.block.blocks.listener.ListenerBlock.DEFAULT_OPTIONS[RES('blocks.ListenerBlock.opt.scenePendown')] = 'scenePendown';
enchant.block.blocks.listener.ListenerBlock.DEFAULT_OPTIONS[RES('blocks.ListenerBlock.opt.scenePenmove')] = 'scenePenmove';
enchant.block.blocks.listener.ListenerBlock.DEFAULT_OPTIONS[RES('blocks.ListenerBlock.opt.scenePenup')] = 'scenePenup';
enchant.block.blocks.listener.ListenerBlock.DEFAULT_OPTIONS[RES('blocks.ListenerBlock.opt.sceneEraserdown')] = 'sceneEraserdown';
enchant.block.blocks.listener.ListenerBlock.DEFAULT_OPTIONS[RES('blocks.ListenerBlock.opt.sceneErasermove')] = 'sceneErasermove';
enchant.block.blocks.listener.ListenerBlock.DEFAULT_OPTIONS[RES('blocks.ListenerBlock.opt.sceneEraserup')] = 'sceneEraserup';

enchant.block.blocks.javascript.BlackBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this, '#808080');
        this.setConnectTarget('evalable');
        this.addLabel(RES('blocks.BlackBlock.name'));
        this.addFoldButton('+', '-', [ 'container' ], 'fold');
        this.addBR();
        this.addBlank(2, 2);
        var textView = new TextView(512, 512);
        textView.value = '/* ' + RES('blocks.BlackBlock.comment') + ' */';
        this._addElement(textView, 'container', true);
        this.iteratize();
        this._variables.fold.value = '+';
        this.script = '<% container %>';
    }
});
