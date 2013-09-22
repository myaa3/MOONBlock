enchant.block.blocks.puppet = {
    desc: {
        blockCategory: RES('blocks.categories.puppet')
    }
};

enchant.ENV.IMAGE_PROPERTIES = {
    BEAR: {
        path: 'chara1.png',
        name: RES('blocks.puppetImages.bear'),
        w: 32, h: 32
    },
    ICON: {
        path: 'icon0.png',
        name: RES('blocks.puppetImages.icon'),
        w: 16, h: 16
    },
    CHILD: {
        path: 'chara0.png',
        name: RES('blocks.puppetImages.child'),
        w: 32, h: 32
    },
    PIG: {
        path: 'chara2.png',
        name: RES('blocks.puppetImages.pig'),
        w: 32, h: 32
    },
    TANK: {
        path: 'chara3.png',
        name: RES('blocks.puppetImages.tank'),
        w: 32, h: 32
    },
    CAR: {
        path: 'chara4.png',
        name: RES('blocks.puppetImages.car'),
        w: 32, h: 32
    },
    KNIGHT: {
        path: 'chara5.png',
        name: RES('blocks.puppetImages.knight'),
        w: 32, h: 32
    },
    MONSTER: {
        path: 'chara6.png',
        name: RES('blocks.puppetImages.monster'),
        w: 32, h: 32
    },
    PLANE: {
        path: 'starship.png',
        name: RES('blocks.puppetImages.plane'),
        w: 24, h: 24
    },
    STARSHIP: {
        path: 'enemy01.png',
        name: RES('blocks.puppetImages.starship'),
        w: 16, h: 16
    },
    EXPLOSION: {
        path: 'effect0.gif',
        name: RES('blocks.puppetImages.explosion'),
        w: 16, h: 16
    }
};

enchant.ENV.BG_IMAGE_DICTIONARY = pairsToOption([
    [ 'blocks.bgImages.default', null ],
    [ 'blocks.bgImages.beach', 'beach.png' ],
    [ 'blocks.bgImages.desert', 'desert.png' ],
    [ 'blocks.bgImages.sky', 'sky.png' ],
    [ 'blocks.bgImages.hollywood', 'hollywood.png' ],
    [ 'blocks.bgImages.eclipse', 'eclipse.png' ],
    [ 'blocks.bgImages.space', 'spacebg.png' ],
    [ 'blocks.bgImages.table', 'table.png' ],
    [ 'blocks.bgImages.rpg', 'rpg.png' ],
    [ 'blocks.bgImages.race', 'race.png' ],
    [ 'blocks.bgImages.black', 'black.png' ],
    [ 'blocks.bgImages.blockg', 'blockg.png' ],
    [ 'blocks.bgImages.actiong', 'actiong.png' ]
]);

enchant.ENV.SE_DICTIONARY = pairsToOption([
    [ 'blocks.ses.coin', 'coin.wav' ],
    [ 'blocks.ses.alarm', 'alarm.wav' ],
    // [ 'blocks.ses.alarml', 'alarm_long.wav' ],
    [ 'blocks.ses.correct', 'correct.wav' ],
    [ 'blocks.ses.incorrect', 'incorrect.wav' ],
    [ 'blocks.ses.explosion', 'explosion.wav' ],
    [ 'blocks.ses.bounce', 'bounce.wav' ],
    [ 'blocks.ses.break', 'break.wav' ],
    [ 'blocks.ses.gameover', 'gameover.wav' ],
    [ 'blocks.ses.jingle', 'jingle.wav' ]
]);

var getImageNameList = function() {
    var ret = [];
    for (var prop in enchant.ENV.IMAGE_PROPERTIES) {
        ret.push(enchant.ENV.IMAGE_PROPERTIES[prop].name);
    }
    return ret;
};

var getImageSelectOption = function() {
    var ret = {};
    var prop;
    for (var key in enchant.ENV.IMAGE_PROPERTIES) {
        prop = enchant.ENV.IMAGE_PROPERTIES[key];
        ret[prop.name] = prop.path;
    }
    return ret;
};

enchant.puppet.ImageThumb = enchant.Class.create(enchant.Sprite, {
    initialize: function(imageProp) {
        enchant.Sprite.call(this, 48, 48);
        this.image = enchant.puppet.ImageThumbSurface.getSurface(imageProp);
        this.value = imageProp.path;
    }
});

enchant.puppet.ImageThumbSurface = enchant.Class.create(enchant.Surface, {
    initialize: function(imageProp) {
        var core = enchant.Core.instance;
        var sf = core.assets[imageProp.path];
        var sx = 48 / imageProp.w;
        var sy = 48 / imageProp.h;
        var w = Math.floor(sf.width * sx);
        var h = Math.floor(sf.height * sy);
        enchant.Surface.call(this, w, h);
        this.context.clearRect(0, 0, w, h);
        this.drawBackground(this.context, 6);
        this.draw(sf, 0, 0, sf.width, sf.height, 0, 0, w, h);
    },
    drawBackground: function(ctx, s) {
        for (var y = 0, i = 0, l = this.height; y < l; y += s, i++) {
            for (var x = 0, j = 0, ll = this.width; x < ll; x += s, j++) {
                ctx.fillStyle = ((i + j) % 2 === 0) ? '#aaaaaa' : '#555555';
                ctx.fillRect(x, y, s, s);
            }
        }
    }
});
enchant.puppet.ImageThumbSurface.instances = {};
enchant.puppet.ImageThumbSurface.getSurface = function(imageProp) {
    var name = imageProp.name;
    if (!this.instances[name]) {
        this.instances[name] = new enchant.puppet.ImageThumbSurface(imageProp);
    }
    return this.instances[name];
};

enchant.puppet.getImagePropertyByPath = function(path) {
    var prop;
    if (path === 'LABEL') {
        return {
            path: 'LABEL',
            name: RES('blocks.SignBoardBlock.name'),
            w: null, h: null
        };
    }
    for (var key in enchant.ENV.IMAGE_PROPERTIES) {
        prop = enchant.ENV.IMAGE_PROPERTIES[key];
        if (prop.path === path) {
            return prop;
        }
    }
    return null;
};

enchant.puppet.getImageThumbs = function() {
    var ret = [];
    for (var prop in enchant.ENV.IMAGE_PROPERTIES) {
        ret.push(this.getImageThumb(enchant.ENV.IMAGE_PROPERTIES[prop]));
    }
    return ret;
};

enchant.puppet.getImageThumb = function(prop) {
    return new enchant.puppet.ImageThumb(prop);
};

enchant.block.Block.prototype.addPuppetNameSelectForm = function(name) {
    function update() {
        var o = {};
        enchant.block.PuppetBlockPrototype.collection
            .filter(function(b) { return b.parentNode === enchant.block.Manager.instance.targetGroup; })
            .forEach(function(b) { var s = b.getSentence('name'); o[s] = s; });
        this.replaceOptions(o);
        var selecting = this._pulldown.getOptionById(this.selected);
        if (selecting) {
            selecting.activeColor = true;
        }
    }

    var form = this.addSelectForm({}, name);
    form.addEventListener(enchant.Event.TOUCH_END, update);
    setTimeout(update.bind(form), 34);
    setTimeout(function() {
        form.dispatchEvent(new enchant.Event(enchant.Event.CHANGE));
    }, 34);
    return form;
};

enchant.block.PuppetBlockPrototype = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.apply(this, arguments);
    },
    _toSeqName: function() {
        if (this._variables.name.value === '' || this._variables.name.value.match(new RegExp('^(?:' + getImageNameList().join('|') + ')\\d*$'))) {
            this._variables.name.value = enchant.block.PuppetBlockPrototype._getSeqName(this);
        }
    }
});
enchant.block.PuppetBlockPrototype._getSeqName = function(instance) {
    var manager = enchant.block.Manager.instance;
    var targetGroup = manager.targetGroup;
    var path = instance.getSentence('image');
    var list = this.collection
        .filter(function(b) {
            return b.parentNode === targetGroup &&
                b.getSentence('image') === path &&
                b !== instance;
        })
        .map(function(b) {
            return parseInt(b.getSentence('name').match(/\d+$/), 10) || 1;
        })
        .sort(function(a, b) {
            return b - a;
        });
    for (var i = 1, l = list.length; i <= l; i++) {
        if (list.indexOf(i) === -1) {
            break;
        }
    }
    var name = enchant.puppet.getImagePropertyByPath(path).name;
    if (i > 1) {
        name += i;
    }
    return name;
};

enchant.block.blocks.puppet.PuppetBlock = enchant.Class.create(enchant.block.PuppetBlockPrototype, {
    initialize: function() {
        enchant.block.PuppetBlockPrototype.call(this, '#ffa500');

        this.addLabel(RES('blocks.PuppetBlock.name'));
        this.addTextForm('', 'name')
            .prompt(RES('blocks.PuppetBlock.prompt'));
        this.addFoldButton('+', '-', [ 'image', 'behavior' ]);
        this.addBR();

        var imageSelect = new enchant.block.dropdown.InputPuppetIconSelectBox();
        imageSelect.minWidth = imageSelect.minHeight = 48;
        this._addElement(imageSelect, 'image', true)
            .on(enchant.Event.TOUCH_START, function() {
                imageSelect.frame = this._frame;
            }.bind(this))
            .on(enchant.Event.CHANGE, function() {
                this.parentNode._toSeqName();
            });
        this.addMultipleReceptor('behavior', 'behavior')
            .parallel();

        this.script = 'Puppet.create("<% name %>", {\n' +
            'filename: "<% image %>",' +
            'w: $$width$$, ' +
            'h: $$height$$, ' +
            'behavior: [ <% behavior %> ]' +
            '});';

        this._listeners[enchant.Event.ADDED_TO_SCENE].push(function() {
            if (this.parentNode === enchant.block.Manager.instance.targetGroup) {
                this._toSeqName();
            }
        });

        function update() {
            var val;
            try {
                val = JSON.parse(this.findFrameDefinition()) || 0;
            } catch (e) {
                val = 0;
            }
            imageSelect.frame = this._frame = val;
        }

        this.addEventListener(enchant.Event.METRICS_CHANGED, update);
        setTimeout(update.bind(this), 4);
    },
    compile: function() {
        var script = enchant.block.Block.prototype.compile.call(this);
        var path = this.getSentence('image');
        var imageProp = enchant.puppet.getImagePropertyByPath(path);
        var w = imageProp.w;
        var h = imageProp.h;
        return script
            .replace('$$width$$', w)
            .replace('$$height$$', h);
    },
    findFrameDefinition: function() {
        function findFromFrameBlock(block) {
            return block instanceof enchant.block.blocks.behavior.FrameBlock &&
                block.getSentence('prop') === 'frame' &&
                block.getSentence('value');
        }
        function findFromFrameSequenceBlock(block) {
            return block instanceof enchant.block.blocks.behavior.FrameSequenceBlock &&
                block.getFrameSequence();
        }
        function findFromListenerBlock(block) {
            return block instanceof enchant.block.blocks.listener.ListenerBlock &&
                block.getSentence('eventType') === 'init' &&
                block._variables.handler.received &&
                find(block._variables.handler.received.parentNode.getIterated(), [ findFromAssignBlock ]);
        }
        function findFromAssignBlock(block) {
            return block instanceof enchant.block.blocks.variable.AssignBlock &&
                block.getSentence('a') === 'this.frame' &&
                block.getSentence('op') === '=' &&
                block.getSentence('b');
        }
        function find(blocks, funcs) {
            var block, result;
            for (var i = blocks.length - 1; i >= 0; i--) {
                block = blocks[i];
                for (var j = 0, ll = funcs.length; j < ll; j++) {
                    result = funcs[j](block);
                    if (result) {
                        return result;
                    }
                }
            }
            return null;
        }
        var receptor = this._variables.behavior;
        if (receptor.received) {
            return find(receptor.received.parentNode.getIterated(), [
                findFromFrameBlock,
                findFromFrameSequenceBlock,
                findFromListenerBlock
            ]);
        } else {
            return null;
        }
    }
});

enchant.block.blocks.puppet.SignBoardBlock = enchant.Class.create(enchant.block.PuppetBlockPrototype, {
    initialize: function() {
        enchant.block.PuppetBlockPrototype.call(this, '#ffa500');

        this._variables.image = { value: 'LABEL' };

        this.addLabel(RES('blocks.SignBoardBlock.name'));
        this.addTextForm('', 'name')
            .prompt(RES('blocks.SignBoardBlock.prompt.name'));
        this.addFoldButton('+', '-', [ 'sizeLabel', 'fontSize', 'textLabel', 'text', 'behavior' ]);
        this.addBR();
        this.addLabel(RES('blocks.SignBoardBlock.size'), 'sizeLabel');
        this.addSliderForm(12, 'fontSize')
            .range(6, 128, 12);
        this.addLabel(RES('blocks.SignBoardBlock.content'), 'textLabel');
        this.addTextForm('', 'text')
            .prompt(RES('blocks.SignBoardBlock.prompt.content'));
        this.addBR();

        this.addMultipleReceptor('behavior', 'behavior')
            .parallel();

        this._listeners[enchant.Event.ADDED_TO_SCENE].push(function() {
            if (this.parentNode === enchant.block.Manager.instance.targetGroup) {
                this._toSeqName();
            }
        });
    },
    script: {
        get: function() {
            var text = this.getSentence('text');
            var f = this.getSentence('fontSize') + 'px monospace';
            var label = new enchant.Label(text);
            label.font = f;
            var metrics = label.getMetrics();
            return 'SignBoard.create("<% name %>", {\n' +
                'w: ' + metrics.width + ',' +
                'h: ' + metrics.height + ',' +
                't: "' + text + '",' +
                'f: "' + f + '",' +
                'color: "' + enchant.block.blocks.puppet.SignBoardBlock.DEFAULT_COLOR + '",' +
                'behavior: [ <% behavior %> ]' +
                '});';
        }
    }
});
enchant.block.blocks.puppet.SignBoardBlock.DEFAULT_COLOR = '#000000';

enchant.block.blocks.puppet.NewPuppetBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this, '#3399cc');
        this.setConnectTarget('evalable');
        this.addLabel(RES('blocks.NewPuppetBlock.name'));
        this.addPuppetNameSelectForm('name');
        this.addFoldButton('+', '-', [ 'behavior' ]);
        this.addBR();
        this.addMultipleReceptor('behavior', 'behavior')
            .parallel();
        this.addBR();
        this.iteratize();
        this.script = 'var Constructor = enchant.puppet.Actor.constructors["<% name %>"];' +
            'if (Constructor) {' +
            'var x = this.x + this.width / 2 - Constructor.definition.w / 2;' +
            'var y = this.y + this.height / 2 - Constructor.definition.h / 2;' +
            'var puppet = new Constructor(x, y);' +
            'puppet.addBehavior(<% behavior %>);' +
            '}';
    }
});

enchant.block.blocks.puppet.AddBehaviorBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this, '#3399cc');
        this.setConnectTarget('evalable');
        this.addLabel(RES('blocks.AddBehaviorBlock.name'));
        this.addFoldButton('+', '-', [ 'behavior' ]);
        this.addBR();
        this.addMultipleReceptor('behavior', 'behavior')
            .parallel();
        this.iteratize();
        this.script = 'if (typeof this.addBehavior === "function") {' +
            'this.addBehavior(<% behavior %>);' +
            '}';
    }
});

enchant.block.blocks.behavior = {
    desc: {
        blockCategory: RES('blocks.categories.behavior')
    }
};

enchant.block.blocks.behavior.DisplayBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this);
        this.setConnectTarget('behavior');
        this.addLabel(RES('blocks.DisplayBlock.name'));
        this.addSelectForm(pairsToOption([
            [ 'blocks.DisplayBlock.opt.standAlone', 'standAlone' ],
            [ 'blocks.DisplayBlock.opt.randomSetup', 'randomSetup' ],
            [ 'blocks.DisplayBlock.opt.randomAppearTop', 'randomAppearTop' ],
            [ 'blocks.DisplayBlock.opt.randomAppearBottom', 'randomAppearBottom' ],
            [ 'blocks.DisplayBlock.opt.randomAppearLeft', 'randomAppearLeft' ],
            [ 'blocks.DisplayBlock.opt.randomAppearRight', 'randomAppearRight' ]
        ]), 'appeartype')
        .combo({
            'randomSetup': [ 'initialLabel', 'initial' ],
            'randomAppearTop': [ 'intervalLabel', 'interval' ],
            'randomAppearBottom': [ 'intervalLabel', 'interval' ],
            'randomAppearRight': [ 'intervalLabel', 'interval' ],
            'randomAppearLeft': [ 'intervalLabel', 'interval' ]
        });
        this.addLabel(RES('blocks.DisplayBlock.opt.interval'), 'intervalLabel');
        this.addSliderForm(30, 'interval')
            .range(1, 100, 30);
        this.addLabel(RES('blocks.DisplayBlock.opt.initial'), 'initialLabel');
        this.addSliderForm(10, 'initial')
            .range(1, 100, 10);
        this.addBR();
        this.iteratize();
        this.parallel = true;
        this.script = '"<% appeartype %>",' +
            '{' +
                'sceneStart: function() {' +
                    'this.interval = <% interval %>;' +
                    'this.initialNumber = <% initial %>;' +
                '}}';

    }
});

enchant.block.blocks.behavior.MoveBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function () {
        enchant.block.Block.call(this);
        this.setConnectTarget('behavior');
        this.addLabel(RES('blocks.MoveBlock.name'));
        this.addSelectForm(pairsToOption([
            [ 'blocks.MoveBlock.opt.zigzag', 'zigzag' ],
            [ 'blocks.MoveBlock.opt.tapMove', 'tapMove' ],
            [ 'blocks.MoveBlock.opt.tapChase', 'tapChase' ],
            [ 'blocks.MoveBlock.opt.move', 'move' ],
            [ 'blocks.MoveBlock.opt.moveRandomDir', 'moveRandomDir' ],
            [ 'blocks.MoveBlock.opt.moveby', 'moveby' ]
        ]), 'type')
        .combo({
            'zigzag': 'zigzagdirection',
            'tapMove': 'tapdirection',
            'tapChase': 'tapdirection',
            'move': 'movedirection',
            'moveby': [ 'dx', 'dy' ]
        });
        this.addSelectForm(pairsToOption([
            [ 'blocks.opt.dir.horizontal', 'X' ],
            [ 'blocks.opt.dir.vertical', 'Y' ],
        ]), 'zigzagdirection');
        this.addSelectForm(pairsToOption([
            [ 'blocks.opt.dir.horizontal', 'X' ],
            [ 'blocks.opt.dir.vertical', 'Y' ],
            [ 'blocks.opt.dir.all', '' ]
        ]), 'tapdirection');
        this.addSelectForm(pairsToOption([
            [ 'blocks.opt.dir.left', 'Left' ],
            [ 'blocks.opt.dir.right', 'Right' ],
            [ 'blocks.opt.dir.up', 'Up' ],
            [ 'blocks.opt.dir.down', 'Down' ],
            [ 'blocks.opt.dir.rightUp', 'Right", "moveUp' ],
            [ 'blocks.opt.dir.rightDown', 'Right", "moveDown' ],
            [ 'blocks.opt.dir.leftUp', 'Left", "moveUp' ],
            [ 'blocks.opt.dir.leftDown', 'Left", "moveDown' ]
        ]), 'movedirection');
        this.addSliderForm(0, 'dx')
            .range(-320, 320, 0)
            .precision(0);
        this.addSliderForm(0, 'dy')
            .range(-320, 320, 0)
            .precision(0);
        this.addBR();
        this.iteratize();
        this.parallel = true;
    },
    script: {
        get: function() {
            var type = this.getSentence('type');
            if (type === 'moveby') {
                return '{ init: function() { this.moveBy(<% dx %>, <% dy %>); } }';
            } else {
                var dir = this._variables['type']._combo[type];
                return '"<% type %><% ' + dir + ' %>"';
            }
        }
    }
});

enchant.block.blocks.behavior.SpecialBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this);
        this.setConnectTarget('behavior');
        this.addLabel(RES('blocks.SpecialBlock.name'));
        this.addSelectForm(pairsToOption([
            [ 'blocks.SpecialBlock.opt.biggerdir', 'biggerdir' ],
            [ 'blocks.SpecialBlock.opt.smallerdir', 'smallerdir' ],
            [ 'blocks.SpecialBlock.opt.rot', 'rot' ],
            [ 'blocks.SpecialBlock.opt.die', 'die' ]
        ]), 'type')
        .combo({
            'biggerdir': 'biggerdir',
            'smallerdir': 'smallerdir',
            'rot': 'rotdir'
        });
        this.addSelectForm(pairsToOption([
            [ 'blocks.opt.dir.horizontal', 'X' ],
            [ 'blocks.opt.dir.vertical', 'Y' ],
            [ 'blocks.opt.dir.all', '' ]
        ]), 'biggerdir');
        this.addSelectForm(pairsToOption([
            [ 'blocks.opt.dir.horizontal', 'X' ],
            [ 'blocks.opt.dir.vertical', 'Y' ],
            [ 'blocks.opt.dir.all', '' ]
        ]), 'smallerdir');
        this.addSelectForm(pairsToOption([
            [ 'blocks.opt.rot.cw', '5' ],
            [ 'blocks.opt.rot.ccw', '-5' ]
        ]), 'rotdir');
        this.addBR();
        this.iteratize();
        this.parallel = true;
    },
    script: {
        get: function() {
            var type = this.getSentence('type');
            switch (type) {
                case 'biggerdir':
                case 'smallerdir':
                    return '"' + type.replace('dir', '') + '<% ' + type + ' %>"';
                case 'rot':
                    return '{ enterframe: function() { this.rotation += <% rotdir %> } }';
                case 'die':
                    return '"die"';
            }
        }
    }
});

enchant.block.blocks.behavior.FrameBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this);
        this.setConnectTarget('behavior');
        this.addSelectForm(pairsToOption([
            [ 'blocks.FrameBlock.opt.frame', 'frame' ],
            [ 'blocks.FrameBlock.opt.speed', 'speed' ]
        ]), 'prop')
        .on(enchant.Event.CHANGE, function() {
            var str;
            switch (this.value) {
                case 'frame':
                    str = RES('blocks.FrameBlock.prompt.frame');
                    break;
                case 'speed':
                    str = RES('blocks.FrameBlock.prompt.speed');
                    break;
            }
            this.parentNode._variables.value.promptString = str;
        });
        this.addLabel(' = ');
        this.addTextForm('', 'value')
            .prompt(RES('blocks.FrameBlock.prompt.frame'));
        this.addBR();
        this.iteratize();
        this.parallel = true;
        this.script = '{ init: function() {' +
            'this.<% prop %> = <% value %>;' +
            '}}';
    }
});

enchant.block.blocks.behavior.StartPinBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this);
        var desc = RES('blocks.StartPinBlock.name') + ': ';
        var suffix = RES('blocks.StartPinBlock.suffix');
        this.setConnectTarget('behavior');
        this.addLabel(desc + 0 + suffix, 'desc');
        this.addBlank(24, 8);
        this.addFoldButton('+', '-', [ 'add', 'startPin' ]);
        this.addBR();
        this.addLabel(RES('blocks.StartPinBlock.add'), 'add')
            .on(enchant.Event.TOUCH_END, function() {
                this.parentNode.addXYBlock();
            });
        this.addMultipleReceptor('startPin', 'startPin')
            .parallel();
        this.iteratize();
        this.parallel = true;
        this._variables.__startPin = this._createPinVariable();
        this.addEventListener(enchant.Event.METRICS_CHANGED, function() {
            var num = JSON.parse('[' + this.getSentence('startPin') + ']').length;
            this._variables.desc.value = (desc + num + suffix);
        });
        this.script = '"standAlone", {' +
            'sceneStart: function() {' +
                'this.startPin = [ <% startPin(,) %> ];' +
            '}}';
    },
    addXYBlock: function() {
        new enchant.block.XYBlock().connector.connect(this._getLastReceptor());
    },
    _createPinVariable: function() {
        return new (enchant.Class.create(enchant.EventTarget, {
            initialize: function(name, block) {
                enchant.EventTarget.call(this);
                this.name = name;
                this.block = block;
            },
            value: {
                get: function() {
                    return this._value;
                },
                set: function(value) {
                    this._value = value;
                    var r = this.block._getLastReceptor();
                    value.forEach(function(pin) {
                        var block = new enchant.block.XYBlock(pin[0], pin[1]);
                        block.connector.connect(r);
                        r = block._nextReceptor;
                    }, this);
                }
            }
        }))('__startPin', this);
    },
    _getSerializationSource: function() {
        var o = enchant.block.Block.prototype._getSerializationSource.call(this);
        var r = this._variables.startPin;
        var pins = null;
        if (r.received) {
            pins = r.received.parentNode.getIterated().map(function(block) {
                return block.pin();
            });
        }
        o.variables.startPin = null;
        o.variables.__startPin = pins;
        return o;
    },
    _getLastReceptor: function() {
        var r = this._variables.startPin;
        while (r.received) {
            r = r.received.parentNode._nextReceptor;
        }
        return r;
    }
});
enchant.block.blocks.behavior.StartPinBlock.MIN_X = -640;
enchant.block.blocks.behavior.StartPinBlock.MAX_X = 960;
enchant.block.blocks.behavior.StartPinBlock.MIN_Y = -640;
enchant.block.blocks.behavior.StartPinBlock.MAX_Y = 960;

enchant.block.XYBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function(x, y) {
        var StartPinBlock = enchant.block.blocks.behavior.StartPinBlock;
        var core = enchant.Core.instance,
            w = core.width * 2, h = core.height * 2;
        enchant.block.Block.call(this, '#af40af');
        this.setConnectTarget('startPin');
        this.addLabel('x:');
        this.addSliderForm(0, 'x')
            .range(StartPinBlock.MIN_X, StartPinBlock.MAX_X, 0);
        this.addLabel('y:');
        this.addSliderForm(0, 'y')
            .range(StartPinBlock.MIN_Y, StartPinBlock.MAX_Y, 0);
        this.iteratize();
        this.parallel = true;
        this.script = '[ <% x %>, <% y %> ]';
        if (typeof x === 'number' &&
            typeof y === 'number') {
            this._variables.x.value = x;
            this._variables.y.value = y;
        }
    },
    _getSerializationSource: function() {
        return null;
    },
    pin: function() {
        return [
            parseInt(this._variables.x.value, 10),
            parseInt(this._variables.y.value, 10)
        ];
    }
});

enchant.block.blocks.behavior.CollisionBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this);
        this.setConnectTarget('behavior');
        this.addLabel(RES('blocks.CollisionBlock.name'));
        this.addPuppetNameSelectForm('className');
        this.addLabel(RES('blocks.CollisionBlock.whenHit'));
        this.addSelectForm(pairsToOption([
            [ 'blocks.CollisionBlock.opt.t', '"hitAndDie", ' ],
            [ 'blocks.CollisionBlock.opt.f', '' ]
        ]), 'whenHit');
        this.addLabel(RES('blocks.CollisionBlock.score'));
        this.addSliderForm(0, 'score')
            .range(-50, 50, 0)
            .precision(0);
        this.addBR();
        this.iteratize();
        this.parallel = true;
        this.script = '<% whenHit %>' +
            '{ init: function() {' +
                'this.collision.push("<% className %>");' +
            '}},' +
            '{ hit: function() {'+
                'enchant.puppet.Theatre.instance.score += parseFloat(<% score %>) || 0;' +
            '}}';
    }
});

enchant.block.blocks.behavior.HitpointBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this);
        this.setConnectTarget('behavior');
        this.addLabel(RES('blocks.HitpointBlock.name'));
        this.addSelectForm(pairsToOption([
            [ 'blocks.HitpointBlock.opt.inc', 'inc' ],
            [ 'blocks.HitpointBlock.opt.dec', 'dec' ],
            [ 'blocks.HitpointBlock.opt.set', 'set' ]
        ]), 'type');
        this.addSliderForm(0, 'value')
            .range(0, 50)
            .precision(0);
        this.iteratize();
        this.parallel = true;
    },
    script: {
        get: function() {
            var sign = '';
            switch (this.getSentence('type')) {
                case 'dec':
                    sign = '-';
                case 'inc':
                    return '{' +
                        'init: function() {' +
                            'this.addBehavior(enchant.puppet.Actor.getHPBehavior(' + sign + '<% value %>));' +
                        '}' +
                    '}';
                case 'set':
                default:
                    return '{' +
                        'init: function() {' +
                            'this.HP = <%value%>;' +
                        '}' +
                    '}';
            }
        }
    }
});

enchant.block.blocks.listener = {
    desc: {
        blockCategory: RES('blocks.categories.listener')
    }
};

enchant.block.blocks.listener.ListenerBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this);
        this.setConnectTarget('behavior');
        var defaults = enchant.block.blocks.listener.ListenerBlock.DEFAULT_OPTIONS;

        function update() {
            this.replaceOptions(mixObjects(
                enchant.block.blocks.control.SignalBlock.getSignalProperties(),
                revertKeyValue(defaults)
            ));
        }

        this.addLabel(RES('blocks.ListenerBlock.name'));

        this.addSelectForm(defaults, 'eventType')
            .on(enchant.Event.TOUCH_END, update);
        setTimeout(update.bind(this._variables.eventType), 34);

        this.addLabel(RES('blocks.ListenerBlock.then'));
        this.addFoldButton('+', '-', [ 'handler' ]);
        this.addBR();
        this.addBlank(20, 0);
        this.addMultipleReceptor('evalable', 'handler');
        this.addBR();
        this.iteratize();
        this.parallel = true;
        this.script = '{' +
        '<% eventType %>: function(event) {' +
            '<% handler(\n) %>' +
        '}}';
    }
});
enchant.block.blocks.listener.ListenerBlock.DEFAULT_OPTIONS = pairsToOption([
    [ 'blocks.ListenerBlock.opt.enterframe', 'enterframe' ],
    [ 'blocks.ListenerBlock.opt.touchend', 'touchend' ],
    [ 'blocks.ListenerBlock.opt.sceneTouchend', 'sceneTouchend' ],
    [ 'blocks.ListenerBlock.opt.hit', 'hit' ],
    [ 'blocks.ListenerBlock.opt.init', 'init' ],
    [ 'blocks.ListenerBlock.opt.actordie', 'actordie' ],
    [ 'blocks.ListenerBlock.opt.actordieall', 'actordieall' ]
]);

enchant.block.blocks.listener.TargetHitBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this);
        this.setConnectTarget('behavior');
        this.addLabel(RES('blocks.TargetHitBlock.name'));
        this.addPuppetNameSelectForm('className');
        this.addLabel(RES('blocks.TargetHitBlock.then'));
        this.addFoldButton('+', '-', [ 'handler' ]);
        this.addBR();
        this.addBlank(20, 0);
        this.addMultipleReceptor('evalable', 'handler');
        this.iteratize();
        this.parallel = true;
        this.script = '{' +
            'init: function() {' +
                'this.collision.push("<% className %>");' +
            '}}, {' +
            'hit: function(event) {' +
                'var other = event.other;' +
                'if (window.<% className %> && (other instanceof window.<% className %>)) {' +
                '<% handler(\n) %>' +
            '}}}';
    }
});

enchant.block.blocks.behavior.ColorBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this);
        this.setConnectTarget('behavior');
        this.addLabel(RES('blocks.ColorBlock.name'));
        this.addColorForm('color');
        this.iteratize();
        this.parallel = true;
    },
    script: {
        get: function() {
            if (this.ancestor.constructorName === 'SignBoardBlock') {
                var hex = '#' + this.getSentence('color').slice(0, 3).map(function(n) {
                    return n.toString(16);
                }).join('');
                return '{' +
                    'init: function() {' +
                        'this.color = "' + hex + '";' +
                    '}}';
            } else {
                return '{' +
                    'sceneStart: function() {' +
                        'var Constructor = enchant.puppet.Puppet.constructors[this.puppetName];' +
                        'Constructor.image = enchant.puppet.Theatre.instance.assets[this.filename].clone().clampColor([ 0, 0, 0 ], [ <% color %> ]);' +
                    '},' +
                    'init: function() {' +
                        'this.image = this.getConstructor().image;' +
                    '}}';
            }
        }
    }
});

enchant.block.InputColorBox = enchant.Class.create(enchant.widget.input.Input, {
    initialize: function() {
        enchant.widget.input.Input.call(this);
        enchant.widget.focus.toFocusTarget(this, true);
        this._value = [ 255, 255, 255 ];
        this.backgroundColor = '#ffffff';
        this.addEventListener(enchant.Event.FOCUS, function() {
            this._inputMethod(function(value) {
                this.value = value;
            });
        });
        this._colorPalette = new enchant.block.ColorPalette();
        enchant.widget.focus.toFocusTarget(this._colorPalette);
    },
    value: {
        get: function() {
            return this._value;
        },
        set: function(value) {
            this._value = value;
            this.backgroundColor = new enchant.color.Color(value).toString();
        }
    },
    _inputMethod: function(callback) {
        var colorPalette = this._colorPalette;
        colorPalette.target = this;
        var scene = this.scene;
        colorPalette.alignHorizontalCenterIn(scene).alignVerticalCenterIn(scene);
        scene.addChild(colorPalette);
        var colorBox = this;
        var update = function(e) {
            callback.call(colorBox, colorPalette.value);
        };
        colorPalette.addEventListener(enchant.Event.TOUCH_START, update);
        colorPalette.addEventListener(enchant.Event.TOUCH_MOVE, update);
        var endInput = function(e) {
            if (e.focus === colorPalette) {
                return;
            }
            callback.call(colorBox, colorPalette.value);
            colorPalette.removeEventListener(enchant.Event.TOUCH_START, update);
            colorPalette.parentNode.removeChild(colorPalette);
        };
        this.onblur = endInput;
        colorPalette.onblur = endInput;
    }
});

enchant.block.ColorPalette = enchant.Class.create(enchant.widget.EntityGroup, {
    initialize: function() {
        this.hsvPalette = new enchant.color.HsvPalette(256, 256);
        this.vSlider = new enchant.widget.SlideBar(0, 1, 3, 1);
        var w = Math.max(this.hsvPalette.width, this.vSlider.width);
        var h = this.hsvPalette.height + this.vSlider.height;
        enchant.widget.EntityGroup.call(this, w, h);
        enchant.widget.input.enableStopTouchPropagation(this);
        enchant.widget.input.disableStopTouchPropagation(this.vSlider);
        this.hsvPalette.alignHorizontalCenterIn(this);
        this.vSlider.alignHorizontalCenterIn(this).alignBottomOf(this.hsvPalette);
        this.addChild(this.hsvPalette);
        this.addChild(this.vSlider);
        this.value = [ 255, 255, 255 ];
        this.vSlider.addEventListener(enchant.Event.CHANGE, function() {
            this.parentNode.hsvPalette.V = this.value;
        });

        [ enchant.Event.TOUCH_START, enchant.Event.TOUCH_MOVE ]
            .forEach(function(type) {
                this.hsvPalette.addEventListener(type, function(e) {
                    this.parentNode.value = this.getColor(e.localX, e.localY);
                });
            }, this);
    },
});

enchant.block.Block.prototype.addColorForm = function(name) {
    var colorBox = new enchant.block.InputColorBox();
    this._addElement(colorBox, name, true);
};

enchant.block.blocks.game = {
    desc: {
        blockCategory: RES('blocks.categories.game')
    }
};

enchant.block.MutableSignBoardPrototype = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.apply(this, arguments);
    }
});

enchant.block.blocks.game.TimerBoardBlock = enchant.Class.create(enchant.block.MutableSignBoardPrototype, {
    initialize: function() {
        enchant.block.MutableSignBoardPrototype.call(this, '#ffa500');
        enchant.block.SingletonBlockPrototype.singletonize(this);

        this.addLabel(RES('blocks.TimerBoardBlock.name'));
        this.addSelectForm(pairsToOption([
            [ 'blocks.TimerBoardBlock.opt.countdown', 'countdown' ],
            [ 'blocks.TimerBoardBlock.opt.countup', 'countup' ]
        ]), 'countdir')
        .combo({
            'countdown': [ 'seconds', 'sec' ]
        });
        this.addFoldButton('+', '-', [ 'behavior' ]);
        this.addBR();
        this.addSliderForm(10, 'seconds')
            .range(10, 64);
        this.addLabel(RES('blocks.TimerBoardBlock.sec'), 'sec');
        this.addBR();
        this.addMultipleReceptor('behavior', 'behavior')
            .parallel();

        enchant.block.blocks.control.SignalBlock.setSignalPropertyListener(this, {
            timeup: RES('blocks.TimerBoardBlock.timeup')
        });

        this._customProperty = {
            timeLeft: RES('blocks.TimerBoardBlock.timeLeft')
        };
    },
    script: {
        get: function() {
            var countdown = this.getSentence('countdir') === 'countdown';
            var count = (countdown ? this.getSentence('seconds') : '0');
            return 'MutableSignBoard.create("TimerBoard", {' +
                't: "' + count + 'sec",' +
                'count: ' + count + ',' +
                'behavior: [' +
                '{ sceneStart: function() {' +
                    'this.startPin = [[ ' + (272 - count.length * 16) + ', 0 ]]; }},' +
                '{ init: function() {' +
                    'this.signalDispatched = false;' +
                    'this.count = ' + count + '; }},' +
                '{ enterframe: function() {' +
                    'var theatre = enchant.puppet.Theatre.instance;' +
                    'if (!this.startTime) {' +
                        'this.startTime = Date.now();' +
                    '}' +
                    'this.timeLeft = this.count ' + (countdown ? '-' : '+') + ' ~~((Date.now() - this.startTime) * 0.001);' +
                    'if (this.timeLeft >= 0) {' +
                        'this.text = this.timeLeft + "sec";' +
                        'this.x = theatre.width - this.width;' +
                    '} else if (!this.signalDispatched) {' +
                        'theatre.dispatchSignal(enchant.puppet.Actor, "timeup");' +
                        'this.signalDispatched = true;' +
                            '}}},' +
                '"standAlone", <% behavior %> ]' +
                '});';
        }
    }
});

enchant.block.blocks.game.ScoreBoardBlock = enchant.Class.create(enchant.block.MutableSignBoardPrototype, {
    initialize: function() {
        enchant.block.MutableSignBoardPrototype.call(this, '#ffa500');
        enchant.block.SingletonBlockPrototype.singletonize(this);

        this.addLabel(RES('blocks.ScoreBoardBlock.name'));
        this.addFoldButton('+', '-', [ 'behavior' ]);
        this.addBR();
        this.addMultipleReceptor('behavior', 'behavior')
            .parallel();

        enchant.block.blocks.control.SignalBlock.setSignalPropertyListener(this, {
            scoreup: RES('blocks.ScoreBoardBlock.scoreup')
        });

        this.script = 'MutableSignBoard.create("ScoreBoard", {' +
            't: "SCORE:0",' +
            'score: 0,' +
            'behavior: [' +
            '{ sceneStart: function() {' +
                'this.startPin = [[ 0, 0 ]]; }},'+
            '{ init: function() {' +
                'enchant.puppet.Theatre.instance.score = 0; }},'+
            '{ enterframe: function() {' +
                'this.text = "SCORE:" + enchant.puppet.Theatre.instance.score; }},'+
            '"standAlone", <% behavior %> ]' +
            '});';
    }
});

enchant.block.blocks.game.ScoreBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this, '#3399cc');
        this.setConnectTarget('evalable');
        this.addLabel(RES('blocks.ScoreBlock.name'));
        this.addSliderForm(0, 'value')
            .range(-100, 100, 0)
            .precision(0);
        this.iteratize();
        this.script = 'enchant.puppet.Theatre.instance.score += <% value %>;';
    }
});

enchant.block.blocks.game.GameOverBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this, '#3399cc');
        this.setConnectTarget('evalable');
        this.addLabel(RES('blocks.GameOverBlock.name'));
        this.script = '(function() {' +
            'var theatre = enchant.puppet.Theatre.instance;' +
            'theatre.end(theatre.score, "score: " + theatre.score);' +
            '}());';
        this.iteratize();
        this.tail();
    }
});

enchant.block.blocks.game.GameClearBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this, '#3399cc');
        this.setConnectTarget('evalable');
        this.addLabel(RES('blocks.GameClearBlock.name'));
        this.script = '(function() {' +
            'var theatre = enchant.puppet.Theatre.instance;' +
            'theatre.end(theatre.score, "score: " + theatre.score, theatre.assets["clear.png"]);' +
            '}());';
        this.iteratize();
        this.tail();
    }
});

enchant.block.blocks.game.SEBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this, '#3399cc');
        this.setConnectTarget('evalable');
        this.addLabel(RES('blocks.SEBlock.name'));
        this.addSelectForm(enchant.ENV.SE_DICTIONARY, 'sesrc');
        this._playing = null;
        this.addLabel('\u25B6')
            .style({
                font: '32px selif',
                color: '#00ff00'
            })
            .on(enchant.Event.TOUCH_END, function() {
                this.parentNode.preview();
            });
        this.iteratize();
        this.script = 'enchant.Core.instance.assets["<% sesrc %>"].clone().play();';
    },
    preview: function() {
        if (this._playing) {
            this._playing.stop();
        }
        this._playing = enchant.Core.instance.assets[this.getSentence('sesrc')].clone();
        this._playing.play();
    }
});

enchant.block.blocks.game.BackgroundBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this, '#ffcc33');
        this.addLabel(RES('blocks.BackgroundBlock.name'));
        this.addSelectForm(enchant.ENV.BG_IMAGE_DICTIONARY, 'bgsrc');
        this.script = 'enchant.puppet.Theatre.changeScreen("<% bgsrc %>");';
    }
});

enchant.block.blocks.logic.PuppetExpressionBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this, '#15fd02');
        this.setConnectTarget('expression');
        this.addLabel(RES('blocks.PuppetExpressionBlock.name'));
        this.addSelectForm(pairsToOption([
            [ 'blocks.PuppetExpressionBlock.opt.f100', 'enchant.puppet.Theatre.instance.frame % 100 == 99' ],
            [ 'blocks.PuppetExpressionBlock.opt.f50', 'enchant.puppet.Theatre.instance.frame % 50 == 49' ],
            [ 'blocks.PuppetExpressionBlock.opt.f30', 'enchant.puppet.Theatre.instance.frame % 30 == 29' ],
            [ 'blocks.PuppetExpressionBlock.opt.f10', 'enchant.puppet.Theatre.instance.frame % 10 == 9' ]
        ]), 'condition');
        this.script = '<% condition %>';
    }
});

var revertKeyValue = function(obj) {
    var ret = {};
    for (var prop in obj) {
        ret[obj[prop]] = prop;
    }
    return ret;
};

enchant.block.PropertyBlockPrototype = enchant.Class.create(enchant.block.Block, {
    initialize: function(desc) {
        enchant.block.Block.call(this, '#15fd02');
        this.setConnectTarget('property');
        this.addLabel(desc);
        this.addSelectForm(this.getConstructor().propertyNames, 'name')
        .on(enchant.Event.CHANGE, function(e) {
            var name, Constructor, block, result;
            if (this.value === '$ADD') {
                name = prompt(RES('blocks.PropertyBlock.prompt'));
                if (name) {
                    this.value = name;
                } else {
                    this.value = e.oldValue;
                }
            } else {
                block = this.parentNode;
                Constructor = block.getConstructor();
                result = enchant.block.PropertyBlockPrototype.addPropertyName(Constructor, this.value);
                if (result) {
                    Constructor.collection.concat(block).forEach(function(block) {
                        block._variables.name.replaceOptions(revertKeyValue(Constructor.propertyNames));
                    });
                    this.value = this.value;
                }
            }
        });
        this.script = 'this.<% name %>';
    }
});
enchant.block.PropertyBlockPrototype.ADD_PROP = RES('blocks.PropertyBlock.add');
enchant.block.PropertyBlockPrototype.ADD_VALUE = '$ADD';
enchant.block.PropertyBlockPrototype.addPropertyName = function(Constructor, name) {
    if (Constructor.propertyNames[name]) {
        return false;
    }
    var d = delete Constructor.propertyNames[this.ADD_PROP];
    Constructor.propertyNames[name] = name;
    Constructor.propertyNames[this.ADD_PROP] = this.ADD_VALUE;
    return true;
};

enchant.block.blocks.variable.PropertyBlock = enchant.Class.create(enchant.block.PropertyBlockPrototype, {
    initialize: function() {
        enchant.block.PropertyBlockPrototype.call(this, RES('blocks.PropertyBlock.self'));
        this._variables.name.on(enchant.Event.TOUCH_END, function() {
            var o = {};
            var block = this.parentNode;
            this.replaceOptions(mixObjects(
                // TODO スコープを考慮する
                block.ancestor._customProperty || {},
                revertKeyValue(enchant.block.blocks.variable.PropertyBlock.propertyNames)
            ));
        });
    }
});
enchant.block.blocks.variable.PropertyBlock.propertyNames = {
    x: 'x',
    y: 'y',
    scaleX: 'scaleX',
    scaleY: 'scaleY',
    rotation: 'rotation',
    frame: 'frame',
    age: 'age',
    HP: 'HP',
    text: 'text'
};
enchant.block.blocks.variable.PropertyBlock.propertyNames[enchant.block.PropertyBlockPrototype.ADD_PROP] =
    enchant.block.PropertyBlockPrototype.ADD_VALUE;

enchant.block.blocks.variable.OtherPropertyBlock = enchant.Class.create(enchant.block.PropertyBlockPrototype, {
    initialize: function() {
        enchant.block.PropertyBlockPrototype.call(this, RES('blocks.PropertyBlock.other'));
        this.connector.canConnect = function(receptor) {
            if (enchant.block.Connector.prototype.canConnect.call(this, receptor)) {
                var block = receptor.parentNode;
                while (block) {
                    if (block instanceof enchant.block.blocks.listener.TargetHitBlock) {
                        return true;
                    }
                    if (block.connector && block.connector.connected) {
                        block = block.connector.connected.parentNode;
                    } else {
                        break;
                    }
                }
            }
            return false;
        };
        this.script = 'other.<% name %>';
    }
});
enchant.block.blocks.variable.OtherPropertyBlock.propertyNames = enchant.block.blocks.variable.PropertyBlock.propertyNames;

enchant.block.blocks.variable.GlobalPropertyBlock = enchant.Class.create(enchant.block.PropertyBlockPrototype, {
    initialize: function() {
        enchant.block.PropertyBlockPrototype.call(this, RES('blocks.PropertyBlock.global'));
        this.script = 'window.<% name %>';
    }
});
enchant.block.blocks.variable.GlobalPropertyBlock.propertyNames = {
    score: 'enchant.puppet.Theatre.instance.score'
};
enchant.block.blocks.variable.GlobalPropertyBlock.propertyNames[enchant.block.PropertyBlockPrototype.ADD_PROP] =
    enchant.block.PropertyBlockPrototype.ADD_VALUE;

(function() {

var FRAME_SIZE = 48;

enchant.block.FrameSurface = enchant.Class.create(enchant.Surface, {
    initialize: function(imageProperty) {
        var path = imageProperty.path;
        var image = enchant.Core.instance.assets[path];
        var w = imageProperty.w;
        var h = imageProperty.h;
        var width = image.width;
        var height = image.height;
        enchant.Surface.call(this, width + 1, height + 1);
        var ctx = this.context;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        this.draw(image);
        var nx = Math.floor(width / w);
        var ny = Math.floor(height / h);
        ctx.fillStyle = '#000000';
        for (var y = 0; y <= ny; y++) {
            ctx.fillRect(0, y * h, width + 1, 1);
        }
        for (var x = 0; x <= nx; x++) {
            ctx.fillRect(x * w, 0, 1, height + 1);
        }
        enchant.block.FrameSurface.instances[path] = this;
    }
});
enchant.block.FrameSurface.instances = {};
enchant.block.FrameSurface.getInstance = function(imageProperty) {
    var instance = this.instances[imageProperty.path];
    if (!instance) {
        instance = new enchant.block.FrameSurface(imageProperty);
    }
    return instance;
};

enchant.block.FramePalette = enchant.Class.create(enchant.Sprite, {
    initialize: function(imageProperty) {
        enchant.Sprite.call(this, 32, 32);
        this._setImageProperty(imageProperty);
        this.addEventListener(enchant.Event.TOUCH_START, this._ontouchstart);
    },
    _ontouchstart: function(e) {
        var lx = (e.localX + (this.width * this.scaleX - this.width) / 2) / this.scaleX;
        var ly = (e.localY + (this.height * this.scaleY - this.height) / 2) / this.scaleY;
        var fx = Math.floor(lx / this.frameWidth);
        var fy = Math.floor(ly / this.frameHeight);
        var f = fy * ((this.width - 1) / this.frameWidth) + fx;
        e.frame = f;
    },
    _setImageProperty: function(imageProperty) {
        var sf = enchant.block.FrameSurface.getInstance(imageProperty);
        this.width = sf.width;
        this.height = sf.height;
        this.frameWidth = imageProperty.w;
        this.frameHeight = imageProperty.h;
        this.scaleX = FRAME_SIZE / imageProperty.w;
        this.scaleY = FRAME_SIZE / imageProperty.h;
        this.image = sf;
    }
});

enchant.block.FrameSequence = enchant.Class.create(enchant.Sprite, {
    initialize: function(imageProperty) {
        var w = imageProperty.w;
        var h = imageProperty.h;
        enchant.Sprite.call(this, FRAME_SIZE, FRAME_SIZE);
        this.image = new enchant.Surface(FRAME_SIZE, FRAME_SIZE);
        this._sequence = [ 0 ];
        this._setImageProperty(imageProperty);
        this.addEventListener(enchant.Event.TOUCH_START, this._ontouchstart);
    },
    _setImageProperty: function(imageProperty) {
        this._imageProperty = imageProperty;
        this.frameWidth = imageProperty.w;
        this.frameHeight = imageProperty.h;
        this._frameImage = enchant.Core.instance.assets[imageProperty.path];
        this._resize();
        this._draw();
    },
    _resize: function() {
        var w = FRAME_SIZE * this._sequence.length;
        var h = FRAME_SIZE;
        this.image._element.width = w;
        this.image._element.height = h;
        this.image.width = w;
        this.image.height = h;
        this.width = w;
        this.height = h;
    },
    _ontouchstart: function(e) {
        var lx = e.localX;
        var fx = Math.floor(lx / FRAME_SIZE);
        e.sequence = fx;
    },
    _draw: function() {
        var ctx = this.image.context;
        var w = this.frameWidth;
        var h = this.frameHeight;
        var sequence = this._sequence;
        var img = this._frameImage;
        var width = img.width;
        var height = img.height;
        var row = img.width / w | 0;
        var frame, fx, fy;
        var s = FRAME_SIZE;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, this.width, this.height);
        for (var i = 0, l = sequence.length; i < l; i++) {
            frame = sequence[i];
            fx = (frame % row | 0) * w;
            fy = (frame / row | 0) * h % height;
            this.image.draw(img, fx, fy, w, h, i * s, 0, s, s);
        }
    },
    value: {
        get: function() {
            return this._sequence;
        },
        set: function(seq) {
            this._sequence = seq;
            this._resize();
            this._draw();
        }
    },
    add: function(f) {
        var w = this.frameWidth;
        this._sequence.push(f);
        this._resize();
        this._draw();
    },
    remove: function(n) {
        var w = this.frameWidth;
        this._sequence.splice(n, 1);
        this._resize();
        this._draw();
    }
});

enchant.block.FrameSelector = enchant.Class.create(enchant.widget.EntityGroup, {
    initialize: function(imageProperty) {
        enchant.widget.EntityGroup.call(this);
        this.palette = new enchant.block.FramePalette(imageProperty);
        this.sequence = new enchant.block.FrameSequence(imageProperty);
        this.addEventListener(enchant.Event.TOUCH_START, function(e) {
            if (typeof e.frame === 'number') {
                this.sequence.add(e.frame);
            } else if (typeof e.sequence === 'number') {
                this.sequence.remove(e.sequence);
            }
            this.sequence.alignHorizontalCenterIn(this);
        });
        this.addChild(this.palette);
        this.addChild(this.sequence);
        this._setImageProperty(imageProperty);
    },
    _resize: function() {
        this.width = Math.max(this.palette.width, this.sequence.width);
        this.height = this.palette.height + this.sequence.height;
        this.palette.alignHorizontalCenterIn(this);
        this.sequence.alignHorizontalCenterIn(this).alignBottomOf(this.palette);
    },
    _setImageProperty: function(imageProperty) {
        this.palette._setImageProperty(imageProperty);
        this.sequence._setImageProperty(imageProperty);
        this._resize();
    },
    value: {
        get: function() {
            return this.sequence.value;
        },
        set: function(seq) {
            this.sequence.value = seq;
            this._resize();
        }
    }
});

enchant.block.InputFrameBox = enchant.Class.create(enchant.widget.input.Input, {
    initialize: function() {
        enchant.widget.input.Input.call(this);
        this._frameSelector = new enchant.block.FrameSelector(enchant.ENV.IMAGE_PROPERTIES.BEAR);
        enchant.widget.focus.toFocusTarget(this, true);
        enchant.widget.focus.toFocusTarget(this._frameSelector);
        this._frameSequence = new enchant.block.FrameSequence(enchant.ENV.IMAGE_PROPERTIES.BEAR);
        this.addChild(this._frameSequence);
        this._resize();
        this._waiting = false;
        this.addEventListener(enchant.Event.FOCUS, function() {
            if (this._waiting) {
                return;
            }
            this._waiting = true;
            this._inputMethod(function(val) {
                if (val.length) {
                    this.value = val;
                } else {
                    this.value = [ 0 ];
                }
                this._waiting = false;
            });
        });
    },
    _setImageProperty: function(imageProperty) {
        this._frameSelector._setImageProperty(imageProperty);
        this._frameSequence._setImageProperty(imageProperty);
    },
    value: {
        get: function() {
            return this._frameSequence.value;
        },
        set: function(val) {
            var oldValue = this._frameSequence.value;
            this._frameSequence.value = val;
            this._resize();
            var e = new enchant.Event(enchant.Event.CHANGE);
            e.oldValue = oldValue;
            this.dispatchEvent(e);
        }
    },
    _resize: function() {
        this.width = this._frameSequence.width;
        this.height = this._frameSequence.height;
    },
    _inputMethod: function(callback) {
        var scene = this.scene;
        var frameSelector = this._frameSelector;
        frameSelector.value = this.value;
        frameSelector.alignHorizontalCenterIn(scene).alignVerticalCenterIn(scene);
        frameSelector.target = this;
        var endInput = function(e) {
            if (e.focus === frameSelector) {
                return;
            }
            callback.call(frameSelector.target, frameSelector.value);
            frameSelector.target = null;
            scene.removeChild(frameSelector);
        };
        this.onblur = endInput;
        frameSelector.onblur = endInput;
        scene.addChild(frameSelector);
    }
});

}());

enchant.block.blocks.behavior.FrameSequenceBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this);
        this.setConnectTarget('behavior');
        this._sequence = new enchant.block.InputFrameBox();
        this._addElement(this._sequence, 'sequence', true);
        this.addSelectForm(pairsToOption([
            [ 'blocks.FrameSequenceBlock.opt.veryfast', 0 ],
            [ 'blocks.FrameSequenceBlock.opt.fast', 1 ],
            [ 'blocks.FrameSequenceBlock.opt.normal', 2 ],
            [ 'blocks.FrameSequenceBlock.opt.slow', 3 ],
            [ 'blocks.FrameSequenceBlock.opt.veryslow', 4 ]
        ]), 'times');
        this._variables.times.value = '2';
        this.iteratize();
        this.parallel = true;
        this._listeners[enchant.Event.ADDED_TO_SCENE].push(this._onaddedtoscene);
        this.addEventListener(enchant.Event.REMOVED_FROM_SCENE, this._onremovedfromscene);
    },
    _onaddedtoscene: function() {
        if (this.ancestor instanceof enchant.block.PuppetBlockPrototype) {
            this._puppetBlock = this.ancestor;
            var sequenceBlock = this;
            this._onmetricschange = function() {
                var prop = enchant.puppet.getImagePropertyByPath(this.getSentence('image'));
                sequenceBlock._sequence._setImageProperty(prop);
            };
            this._puppetBlock.addEventListener(enchant.Event.METRICS_CHANGED, this._onmetricschange);
            this._onmetricschange.call(this._puppetBlock);
        }
    },
    _onremovedfromscene: function() {
        if (this._puppetBlock) {
            this._puppetBlock.removeEventListener(enchant.Event.METRICS_CHANGED, this._onmetricschange);
            this._puppetBlock = null;
        }
    },
    _getSequence: function(n) {
        var array = this.getSentence('sequence');
        var dup = function(array) {
            return array
                .map(function(n) {
                    return [ n, n ];
                })
                .reduce(function(a, b) {
                    return a.concat(b);
                });
        };
        var dupp = function(array, n) {
            if (n > 0) {
                return dupp(dup(array), n - 1);
            } else {
                return array;
            }
        };
        return JSON.stringify(dupp(array, n));
    },
    getFrameSequence: function() {
        return this._getSequence(parseInt(this.getSentence('times'), 10));
    },
    script: {
        get: function() {
            return '{ init: function() {' +
                'this.frame = ' + this.getFrameSequence() + ';' +
                '}}';
        }
    }
});

enchant.block.blocks.control.SignalBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this, '#3399cc');
        this.setConnectTarget('evalable');
        this.addLabel(RES('blocks.SignalBlock.name'));
        this.addTextForm('', 'name')
            .prompt(RES('blocks.SignalBlock.prompt'));
        this.iteratize();
        this.script = 'enchant.puppet.Theatre.instance.dispatchSignal(enchant.puppet.Actor, "<% name %>");';
    }
});
enchant.block.blocks.control.SignalBlock._properties = {};
enchant.block.blocks.control.SignalBlock.registerSignalProperty = function(key, value) {
    this._properties[key] = value;
};
enchant.block.blocks.control.SignalBlock.unregisterSignalProperty = function(key) {
    delete this._properties[key];
};
enchant.block.blocks.control.SignalBlock.setSignalPropertyListener = function(instance, properties) {
    instance.addEventListener(enchant.Event.ADDED_TO_SCENE, function() {
        if (this.getConstructor().collection.length === 0) {
            for (var name in properties) {
                enchant.block.blocks.control.SignalBlock.registerSignalProperty(name, properties[name]);
            }
        }
    });
    instance.addEventListener(enchant.Event.REMOVED_FROM_SCENE, function() {
        if (this.getConstructor().collection.length === 1) {
            for (var name in properties) {
                enchant.block.blocks.control.SignalBlock.unregisterSignalProperty(name);
            }
        }
    });
};
enchant.block.blocks.control.SignalBlock.getSignalProperties = function() {
    var ret = cloneObject(enchant.block.blocks.control.SignalBlock._properties);
    this.collection.forEach(function(block) {
        var name = block.getSentence('name');
        if (name) {
            ret[name] = name;
        }
    });
    return ret;
};

function mixObjects() {
    return Array.prototype.reduce.call(arguments, function(dest, obj) {
        return mixObject(obj, dest);
    }, {});
}
