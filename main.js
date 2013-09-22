enchant();
enchant.block._env.blockColor = 'black';
enchant.block._env.blockLabelColor = '#ffffff';
enchant.block._env.blockFillColor = '#202020';
enchant.block._env.blockLabelFont = '24px helvetica';
enchant.block._env.useDropdown = false;
enchant.widget._env.font = '24px helvetica';
enchant.widget.input._env.inputTextWidth = 128;
enchant.widget.input._env.inputTextHeight = 36;
enchant.block.blocks.behavior.StartPinBlock.MIN_X = -768;
enchant.block.blocks.behavior.StartPinBlock.MAX_X = 1152;
enchant.block.blocks.behavior.StartPinBlock.MIN_Y = -1024;
enchant.block.blocks.behavior.StartPinBlock.MAX_Y = 1536;

enchant.block.dropdown.assets = [ 'images/dropdown.9.png' ];

enchant.block.blocks.puppet.SignBoardBlock.DEFAULT_COLOR = '#ffffff';

enchant.ENV.SOUND_ENABLED_ON_MOBILE_SAFARI = true;

if (/Eagle/.test(navigator.userAgent)) {
    (function(getMetrics) {
        var ctx = enchant.Surface._staticCanvas2DContext;
        enchant.Label.prototype.getMetrics = function(text) {
            var ret = getMetrics.call(this, text);
            ctx.save();
            ctx.font = this.font;
            ret.width = ctx.measureText(text || this._text).width;
            ctx.restore();
            return ret;
        };
    }(enchant.Label.prototype.getMetrics));
}

function moveModuleAssets(module, base) {
    var assets = module.assets;
    var obj = {};
    assets.forEach(function(path) {
        obj[path] = base + path;
    });
    module.assets = obj;
}

moveModuleAssets(enchant.widget, 'images/widget/');

var bgGroup, closeTextView;

function load(str) {
    if (enchant.block.Manager.instance) {
        var core = enchant.Core.instance;
        var manager = enchant.block.Manager.instance;
        var group = manager.targetGroup;
        var loadingScene = core.loadingScene;
        var lastScene, modal;
        if (core._scenes.indexOf(loadingScene) === -1) {
            lastScene = core.popScene();
            core.pushScene(loadingScene);
            modal = true;
        }
        enchant.Deferred.next(function() {
            var d = new enchant.Deferred();
            setTimeout(function() {
                d.call();
            }, 34);
            return d;
        })
        .next(function() {
            manager.clear();
            manager.deserialize(JSON.parse(str));
            var stickers = enchant.block.blocks.moon.StickerBlock.collection.slice();
            var centerX = core.width / 2;
            var centerY = core.height / 2;
            var oX = (core.width * group.scaleX - core.width) / 2;
            var oY = (core.height * group.scaleY - core.height) / 2;
            var cx = stickers
                .map(function(b) {
                    return b.x + b.width / 2;
                })
                .reduce(function(a, b) {
                    return a + b;
                }, 0) / stickers.length || centerX;
            var cy = stickers
                .map(function(b) {
                    return b.y + b.height / 2;
                })
                .reduce(function(a, b) {
                    return a + b;
                }, 0) / stickers.length || centerY;
            group.x = Math.max(-core.width, Math.min(0, centerX - cx - oX));
            group.y = Math.max(-core.height, Math.min(0, centerY - cy - oY));
            bgGroup.x = group.x;
            bgGroup.y = group.y;
            if (modal) {
                core.replaceScene(lastScene);
                closeTextView();
                enchant.Core.instance.currentScene._layers.Canvas._visible = true;
            }
        });
    } else {
        localStorage.mbSerializedData = str;
    }
    return true;
}

function compile() {
    var manager = enchant.block.Manager.instance;
    var group = manager.targetGroup;
    var blockScript = manager.compile(group, function(block) {
        return (block instanceof enchant.block.blocks.moon.StickerBlock ||
            block instanceof enchant.block.blocks.puppet.PuppetBlock ||
            block instanceof enchant.block.blocks.puppet.SignBoardBlock ||
            block instanceof enchant.block.blocks.game.TimerBoardBlock ||
            block instanceof enchant.block.blocks.game.ScoreBoardBlock ||
            block instanceof enchant.block.blocks.javascript.BlackBlock);
    });

    if (blockScript.indexOf('importJS') !== -1) {
        return blockScript;
    } else {
        return js_beautify('importJS([' +
                '"lib/MOON.js",' +
                '"lib/enchant.js",' +
                '"lib/ui.enchant.js",' +
                '"lib/color.enchant.js",' +
                '"lib/stylus.enchant.js",' +
                '"lib/puppet.enchant.js",' +
                '"lib/moon.puppet.enchant.js"' +
            '], function() {' +
                'enchant(); enchant.puppet.prepareTheatre({ assets:' +
                    JSON.stringify(searchImagePath().concat(searchSEPath())) +
                '});' +
                blockScript +
            "});");
    }
}

function abortByLoadError(e) {
    var message = 'シールが壊れています\n' + e.message;
    console.log(message);
    if (window.__moon__) {
        MOON.alert(message, function() {
            Editor.getInstance().finishEdit();
        });
    } else {
        alert(message);
    }
}

function removeDups(set) {
    var ret = [];
    return set.filter(function(elem) {
        var exists = (ret.indexOf(elem) !== -1);
        if (!exists) {
            ret.push(elem);
        }
        return !exists;
    });
}

function searchImagePath() {
    return removeDups([
        function searchStickerImagePath() {
            return enchant.puppet.STICKER_IMAGE_PROPERTIES
                .map(function(prop) {
                    return prop.path;
                });
        },
        function searchGameEndImagePath() {
            return []
                .concat(enchant.block.blocks.game.GameOverBlock.collection
                    .filter(function(block) {
                        return block.parentNode !== enchant.block.Manager.instance.targetGroup;
                    }).length ?
                [ 'end.png' ] : [])
                .concat(enchant.block.blocks.game.GameClearBlock.collection
                    .filter(function(block) {
                        return block.parentNode !== enchant.block.Manager.instance.targetGroup;
                    }).length ?
                [ 'clear.png' ] : []);
        },
        function searchPuppetBlockImagePath() {
            return enchant.block.blocks.puppet.PuppetBlock.collection
                .map(function(block) {
                    return block.getSentence('image');
                });
        },
        function searchMutableSignBoardImagePath() {
            return enchant.block.MutableSignBoardPrototype.collection.length ?
                [ 'font0.png' ] : [];
        },
        function searchBackgroundImagePath() {
            return enchant.block.blocks.game.BackgroundBlock.collection
                .map(function(block) {
                    return block.getSentence('bgsrc');
                })
                .filter(function(path) {
                    return path !== 'null';
                });
        }
    ]
        .map(function(searcher) {
            return searcher.call(null);
        })
        .reduce(function(a, b) {
            return a.concat(b);
        }, []));
}

function searchSEPath() {
    return removeDups(enchant.block.blocks.game.SEBlock.collection
        .map(function(block) {
            return block.getSentence('sesrc');
        }));
}

enchant.LoadingScene = enchant.Class.create(enchant.Scene, {
    initialize: function() {
        enchant.Scene.call(this);
        this.backgroundColor = '#000000';
        this.sp = new enchant.Sprite(this.width, this.height);
    },
    setImage: function(image) {
        var w = image.width,
            h = image.height,
            sf = new enchant.Surface(w, h),
            sp = this.sp;
        if (sp.parentNode) {
            this.removeChild(sp);
        }
        sp.width = w;
        sp.height = h;
        sf.context.drawImage(image, 0, 0);
        sp.image = sf;
        sp.x = (this.width - w) / 2;
        sp.y = (this.height - h) / 2;
        this.addChild(sp);
        this.sp = sp;
    }
});

var BG = enchant.Class.create(enchant.Surface, {
    initialize: function() {
        enchant.Surface.call(this, 48, 64);
        var w = this.width, h = this.height;
        var imageData = this.context.createImageData(w, h);
        var data = imageData.data;
        var i = 0;
        var hw = h + w;
        var hw2 = hw / 2;
        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
                data[i + 0] = data[i + 1] = data[i + 2] =
                    Math.max(((y + x) - hw2), 0) / hw2 * 255;
                data[i + 3] = 255;
                i += 4;
            }
        }
        this.context.putImageData(imageData, 0, 0);
    }
});

var entry = new enchant.Deferred();

entry
.next(function(metrics) {
    var d = new enchant.Deferred();
    var core = new Core(metrics.width, metrics.height);
    var progress = new Image();
    progress.onload = function() {
        enchant.Core.instance.loadingScene.setImage(this);
        d.call(metrics);
    };
    progress.src = 'images/progress.png';
    return d;
})
.next(function(metrics) {
    var d = new enchant.Deferred();
    setTimeout(function() {
        d.call(metrics);
    }, 34);
    return d;
})
.next(function(metrics) {
    var width = metrics.width;
    var height = metrics.height;
    var core = enchant.Core.instance;
    core.preload({
        'alarm.wav': 'sound/se/alarm.wav',
        'coin.wav': 'sound/se/coin.wav',
        'alarm.wav': 'sound/se/alarm.wav',
        // 'alarm_long.wav': 'sound/se/alarm_long.wav',
        'correct.wav': 'sound/se/correct.wav',
        'incorrect.wav': 'sound/se/incorrect.wav',
        'explosion.wav': 'sound/se/explosion.wav',
        'bounce.wav': 'sound/se/bounce.wav',
        'break.wav': 'sound/se/break.wav',
        'gameover.wav': 'sound/se/gameover.wav',
        'jingle.wav': 'sound/se/jingle.wav'
    });
    core.onload = function() {
        function isAllowedRemoving(block) {
            return !(block instanceof enchant.block.blocks.moon.StickerBlock);
        }

        var uiMargin = 32;
        var code;
        var scene = new Scene();
        scene.backgroundColor = '#000000';
        bgGroup = new EntityGroup(width * 2, height * 2);
        bgGroup.background = new BG();
        var blockGroup = new Group();
        var rw = core.width * 2 - 2;
        var rh = core.height * 2 - 2;
        blockGroup.cvsRender = function(ctx) {
            ctx.strokeStyle = '#00ffff';
            ctx.strokeWidth = 3;
            ctx.strokeRect(1, 1, rw, rh);
        };
        scene.addChild(bgGroup);
        scene.addChild(blockGroup);

        var manager = new Manager(blockGroup, pairsToOption([
            [ 'blocks.categories.moon', enchant.block.blocks.moon ],
            [ 'blocks.categories.puppet', enchant.block.blocks.puppet ],
            [ 'blocks.categories.behavior', enchant.block.blocks.behavior ],
            [ 'blocks.categories.listener', enchant.block.blocks.listener ],
            [ 'blocks.categories.game', enchant.block.blocks.game ],
            [ 'blocks.categories.control', enchant.block.blocks.control ],
            [ 'blocks.categories.logic', enchant.block.blocks.logic ],
            [ 'blocks.categories.variable', enchant.block.blocks.variable ],
            [ 'blocks.categories.javascript', enchant.block.blocks.javascript ]
        ]));

        var textView;
        var codeButton = new CodeButton();
        codeButton.alignLeftIn(core, uiMargin).alignBottomIn(core, uiMargin);
        codeButton.addEventListener('touchend', function(e) {
            if (!textView) {
                textView = new TextView(640, 640);
                textView.alignHorizontalCenterIn(core).alignVerticalCenterIn(core);
                textView.addEventListener('blur', function() {
                    this.parentNode.removeChild(this);
                    scene.removeChild(editButton);
                    scene.addChild(codeButton);
                });
            }
            textView.value = compile();
            scene.addChild(textView);
            setTimeout(function() {
                textView.focus();
                scene.removeChild(codeButton);
                scene.addChild(editButton);
            }, 0);
        });
        scene.addChild(codeButton);

        var editButton = new EditButton();
        editButton.alignLeftIn(core, uiMargin).alignBottomIn(core, uiMargin);

        closeTextView = function() {
            if (textView && textView.parentNode) {
                textView.parentNode.removeChild(textView);
                scene.removeChild(editButton);
                scene.addChild(codeButton);
            }
        };

        var doneButton = new DoneButton();
        doneButton.alignRightIn(core, uiMargin).alignBottomIn(core, uiMargin);
        doneButton.addEventListener('touchend', function() {
            if (window.Editor) {
                Editor.getInstance().finishEdit();
            }
        });
        scene.addChild(doneButton);

        core.pushScene(scene);

        var akbar = new ActionKitBar();
//        akbar.box[RES('blocks.categories.game')].removeItem('BackgroundBlock');
        akbar.box.JavaScript.removeItem('BlackBlock');
        akbar.x = 8;
        akbar.y = uiMargin;
        manager.registerDragTarget(akbar);
        akbar.addEventListener('blockreceived', function(e) {
            var b = e.block;
            if (isAllowedRemoving(b)) {
                blockGroup.removeChild(e.block);
            }
        });
        scene.addChild(akbar);

        if (localStorage.mbSerializedData) {
            try {
                manager.deserialize(JSON.parse(localStorage.mbSerializedData));
            } catch (e) {
                // alert(RES('main.broken.data'));
                abortByLoadError(e);
                localStorage.clear();
            }
        } else {
            localStorage.mbSerializedData = '[]';
        }

        var scrollX, scrollY;
        scene.addEventListener('touchstart', function(e) {
            scrollX = e.x;
            scrollY = e.y;
        });
        scene.addEventListener('touchmove', function(e) {
            if (manager._dragging) {
                return;
            }
            var dx = e.x - scrollX;
            var dy = e.y - scrollY;
            var nx = blockGroup.x + dx;
            var ny = blockGroup.y + dy;
            blockGroup.x = Math.max(-core.width, Math.min(nx, 0));
            blockGroup.y = Math.max(-core.height, Math.min(ny, 0));
            bgGroup.x = blockGroup.x;
            bgGroup.y = blockGroup.y;
            scrollX = e.x;
            scrollY = e.y;
        });

        Entity.prototype.intersectPoint = function(screenX, screenY) {
            var left = this._offsetX, right = left + this.width,
                top = this._offsetY, bottom = top + this.height;
            return left < screenX && screenX < right &&
                top < screenY && screenY < bottom;
        };

        var _moveDragging = enchant.block.Manager.prototype.moveDragging;
        manager.moveDragging = function(e) {
            _moveDragging.call(this, e);
            if (!manager._dragging) {
                return;
            }
            var x = e.x;
            var y = e.y;
            if (isAllowedRemoving(manager._dragging)) {
                if (akbar.intersectPoint(x, y)) {
                    manager._dragging.opacity = 0.3;
                } else {
                    manager._dragging.opacity = 1;
                }
                ActionKitBox.collection.forEach(function(box) {
                    if (box._folded && !box._lidAnim) {
                        if (box.intersectPoint(x, y)) {
                            if (!box._lidOpen) {
                                box._lidAnim = true;
                                box.openLid()
                                    .then(function() {
                                        this._lidAnim = false;
                                        this._lidOpen = true;
                                    });
                            }
                        } else {
                            if (box._lidOpen) {
                                box._lidAnim = true;
                                box.closeLid()
                                    .then(function() {
                                        this._lidAnim = false;
                                        this._lidOpen = false;
                                    });
                            }
                        }
                    }
                });
            }
        };

        var _endDragging = enchant.block.Manager.prototype.endDragging;
        manager.endDragging = function(e) {
            _endDragging.call(this, e);
            ActionKitBox.collection.forEach(function(box) {
                if (box._folded) {
                    box._lidAnim = true;
                    box.closeLid()
                        .then(function() {
                            this._lidAnim = false;
                            this._lidOpen = false;
                        });
                }
            });
        };

        var scroll = 3000;
        var updateScaling = function(centerX, centerY, delta) {
            scroll += delta;
            scroll = Math.max(300, Math.min(3600, scroll));
            var lastScale = Math.floor((scroll - delta) / 300) / 10;
            var scale = Math.floor(scroll / 300) / 10;
            var localX, localY;
            if (scale !== blockGroup.scaleX) {
                localX = (centerX - blockGroup.x) / lastScale;
                localY = (centerY - blockGroup.y) / lastScale;
                blockGroup.x = centerX - localX * scale;
                blockGroup.y = centerY - localY * scale;
                bgGroup.x = blockGroup.x;
                bgGroup.y = blockGroup.y;
                blockGroup.scaleX = scale;
                blockGroup.scaleY = scale;
            }
        };
    };
    core.start();
});

window.onload = function() {
    var width = document.documentElement.clientWidth;
    var height = document.documentElement.clientHeight;

    function createDefaultData(type, target) {
        return JSON.parse('[{"x":200,"y":280,"constructorName":"StickerBlock","variables":{"name":"' + RES('blocks.StickerBlock.name').toLowerCase() + '","fold":"-","imgPath":"chara1.png","image":null,"ontap":{"x":0,"y":0,"constructorName":"LinkBlock","variables":{"type":"' + type + '","link":"' + target + '"},"next":null},"onattach":{"x":0,"y":0,"constructorName":"EndBlock","variables":{},"next":null},"ondetach":{"x":0,"y":0,"constructorName":"EndBlock","variables":{},"next":null}}}]');
    }

    function createBlackBlockData(script) {
        return [{
            x: 200,
            y: 280,
            constructorName: 'BlackBlock',
            variables: {
                fold: '+',
                container: script
            },
            next: null
        }];
    }

    function isDefaultScript(script) {
        return (script.indexOf('\n') === script.lastIndexOf('\n')) &&
            (script.indexOf('location.replace("') === 0) &&
            (script.indexOf('");\n') === (script.length - 4));
    }

    if (window.Editor) {
        var editor = Editor.create('MOONBlock', '1');
        var isDefault, type, target, script;
        editor.saveText = function() {
            // dirty!!!!
            enchant.Core.instance.currentScene._layers.Canvas._visible = false;
            return compile();
        };
        editor.saveState = function() {
            var serialized = enchant.block.Manager.instance.serialize();
            this.manifest = new Manifest({
                name: 'MOONBlock',
                version: '1'
            });

            this.manifest.linked_pages = enchant.block.blocks.moon.LinkBlock.getSpecifiedLinkRef('Page');
            this.manifest.access_urls = enchant.block.blocks.moon.LinkBlock.getSpecifiedLinkRef('Url');

            var m = JSON.parse(this.manifest.serialize());
            m.blocks = serialized;
            m.block_images = enchant.puppet.STICKER_IMAGE_PROPERTIES;
            return JSON.stringify(m);
        };
        var errorOnLoadText = null;
        editor.loadText = function(str) {
            try {
                isDefault = isDefaultScript(str);
                if (isDefault) {
                    type = (str.match(/^location\.replace\("(....):\/\//)[1] === 'page') ? 'Page' : 'Url';
                    target = str.match(/^location\.replace\("(.*)"\);\n?$/)[1];
                    if (type === 'Page') {
                        target = target.slice(7);
                    }
                } else {
                    script = str;
                }
                errorOnLoadText = null;
            } catch (e) {
                errorOnLoadText = e;
            }
        };
        editor.loadState = function(jsonString) {
            enchant.puppet.resetPuppetDropdown();
            var err = errorOnLoadText;
            errorOnLoadText = null;
            if (err) {
                abortByLoadError(err);
            }
            try {
                var object = JSON.parse(jsonString);
                var blocks;
                if (isDefault) {
                    blocks = createDefaultData(type, target);
                } else if (object.blocks) {
                    blocks = object.blocks;
                } else {
                    blocks = createBlackBlockData(script);
                }
                var x = 0;
                object.linked_pages.forEach(function(pageId) {
                    this.addPageLink(pageId);
                }, this);
                object.access_urls.forEach(function(url) {
                    this.addAccessUrl(url);
                }, this);
                var sticker_images = object.block_images;
                var deferreds = [];
                if (sticker_images) {
                    sticker_images.forEach(function(property, i) {
                        enchant.puppet.STICKER_IMAGE_PROPERTIES.push(property);
                        if (!enchant.Core.instance.assets[property.path]) {
                            deferreds.push(enchant.Core.instance.load(property.absPath, property.path));
                        }
                    });
                }
                enchant.Deferred.parallel(deferreds)
                .next(function() {
                    load(JSON.stringify(blocks));
                })
                .error(function(e) {
                    abortByLoadError(e);
                });
            } catch (e) {
                abortByLoadError(e);
            }
        };
        enchant.puppet.assets
            .concat(enchant.ui.assets)
            .concat('start.png')
            .concat('end.png')
            .concat('clear.png')
            .forEach(function(path) {
                editor.addFileDependency(path, 'images/' + path);
            });

        [
            'alarm.wav', 'coin.wav', 'alarm.wav', 'alarm_long.wav', 'correct.wav', 'incorrect.wav',
            'explosion.wav', 'bounce.wav', 'break.wav', 'gameover.wav', 'jingle.wav'
        ].forEach(function(path) {
            editor.addFileDependency('sound/se/' + path, 'sound/se/' + path);
        });

        editor.addFileDependency('lib/MOON.js', 'lib/MOON.js');
        editor.addFileDependency('lib/enchant.js', 'lib/enchant.js');
        editor.addFileDependency('lib/ui.enchant.js', 'lib/ui.enchant.js');
        editor.addFileDependency('lib/color.enchant.js', 'lib/color.enchant.js');
        editor.addFileDependency('lib/stylus.enchant.js', 'lib/stylus.enchant.js');
        editor.addFileDependency('lib/puppet.enchant.js', 'lib/puppet.enchant.js');
        editor.addFileDependency('lib/moon.puppet.enchant.js','lib/moon.puppet.enchant.js');
    }

    entry.call({
        width: width,
        height: height
    });
};
