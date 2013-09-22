(function() {

    enchant.puppet.STICKER_IMAGE_PROPERTIES = [];

    enchant.puppet.resetPuppetDropdown = function() {
        enchant.puppet.STICKER_IMAGE_PROPERTIES = [];
        var dropDown = enchant.block.dropdown.InputPuppetIconSelectBox._dropdown;
        if (dropDown) {
            dropDown.tileElements.slice().forEach(function(element) {
                dropDown.removeChild(element);
            });
            dropDown.tileElements = enchant.puppet.getImageThumbs();
        }
    };

    enchant.puppet.StickerImageThumb = enchant.Class.create(enchant.Sprite, {
        initialize: function(imageProp) {
            enchant.Sprite.call(this, 48, 48);
            this.value = imageProp.path;
            var sf = this.image = new enchant.Surface(this.width, this.height);
            enchant.block.blocks.moon.StickerBlock.drawThumb(sf, enchant.Core.instance.assets[imageProp.path]._element);
        }
    });

    enchant.puppet.StickerPageButton = enchant.Class.create(enchant.Sprite, {
        initialize: function() {
            enchant.Sprite.call(this, 48, 48);
            var sf = new enchant.Surface(48, 48);
            var ctx = sf.context;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 48, 48);
            ctx.fillStyle = '#000000';
            ctx.fillRect(8, 21, 32, 6);
            ctx.fillRect(21, 8, 6, 32);
            this.image = sf;
            this.value = 'LABEL';
            this.addEventListener(enchant.Event.TOUCH_END, this._ontouchend);
        },
        _ontouchend: function(e) {
            var dropDown = enchant.block.dropdown.InputPuppetIconSelectBox.getDropDown();
            var target = dropDown.target;
            var val = target.value;
            MOON.openStickerPage(function(path) {
                if (path === null) {
                    target.value = val;
                    return;
                }
                var name = path.match(/images\/(sticker\d+)\.png$/)[1];
                var fileName = name + '.png';
                var image = new Image();
                image.onload = function() {
                    var w = image.width, h = image.height;
                    var sf = new enchant.Surface(w, h);
                    var ctx = sf._element.getContext('2d');
                    ctx.drawImage(image, 0, 0, w, h, 0, 0, w, h);
                    enchant.Core.instance.assets[fileName] = sf;
                    var imageProp = enchant.ENV.IMAGE_PROPERTIES[name] = {
                        absPath: 'file://' + path,
                        path: fileName,
                        name: name,
                        w: w, h: h
                    };
                    enchant.puppet.STICKER_IMAGE_PROPERTIES.push(imageProp);
                    dropDown._tileElements.push(new enchant.puppet.StickerImageThumb(imageProp));
                    dropDown._update();
                    target.value = fileName;
                };
                image.src = 'file://' + path;
            });
        }
    });

    var _orig_getImageThumbs = enchant.puppet.getImageThumbs;
    enchant.puppet.getImageThumbs = function() {
        var ret = _orig_getImageThumbs.apply(this, arguments);
        ret.unshift(new enchant.puppet.StickerPageButton());
        enchant.puppet.STICKER_IMAGE_PROPERTIES.forEach(function(prop) {
            ret.push(new enchant.puppet.StickerImageThumb(prop));
        });
        return ret;
    };

    var _orig_ImageThumb_initialize = enchant.puppet.ImageThumb.prototype.initialize;
    enchant.puppet.ImageThumb.prototype.initialize = function() {
        _orig_ImageThumb_initialize.apply(this, arguments);
    };

    var _orig_InputPuppetIconSelectBox_initialize = enchant.block.dropdown.InputPuppetIconSelectBox.prototype.initialize;
    enchant.block.dropdown.InputPuppetIconSelectBox.prototype.initialize = function() {
        _orig_InputPuppetIconSelectBox_initialize.apply(this, arguments);
        this.value = this.dropdown._tileElements[1].value;
    };

    var _orig_getImagePropertyByPath = enchant.puppet.getImagePropertyByPath;
    enchant.puppet.getImagePropertyByPath = function(path) {
        var ret = _orig_getImagePropertyByPath.call(this, path);
        var prop;
        if (ret === null) {
            for (var key in enchant.puppet.STICKER_IMAGE_PROPERTIES) {
                prop = enchant.puppet.STICKER_IMAGE_PROPERTIES[key];
                if (prop.path === path) {
                    return prop;
                }
            }
        }
        return ret;
    };

    enchant.block.blocks.puppet.PuppetBlock.prototype.getSentence = function(name) {
        var ret = enchant.block.Block.prototype.getSentence.call(this, name);
        var path;
        if (name === 'behavior') {
            path = this.getSentence('image');
            if (/.*sticker\d+\.png$/.test(path)) {
                if (ret) {
                    ret += ',';
                }
                ret += '{' +
                    'sceneStart: function() {' +
                        'var w, h, src, dest, ctx,' +
                        'Constructor = enchant.puppet.Puppet.constructors[this.puppetName],' +
                        'hw = Math.floor(Constructor.prototype.w / 2),' +
                        'hh = Math.floor(Constructor.prototype.h / 2);' +
                        'if (Constructor.image) {' +
                            'src = Constructor.image;' +
                        '} else {' +
                            'src = enchant.puppet.Theatre.instance.assets["' + path + '"];' +
                        '}' +
                        'w = src.width;' +
                        'h = src.height;' +
                        'dest = new enchant.Surface(hw, hh);' +
                        'ctx = dest._element.getContext("2d");' +
                        'ctx.drawImage(src._element, 0, 0, w, h, 0, 0, hw, hh);' +
                        'Constructor.image = dest;' +
                        'Constructor.definition.w = Constructor.prototype.w = hw;' +
                        'Constructor.definition.h = Constructor.prototype.h = hh;' +
                    '},' +
                    'init: function() {' +
                        'this.image = this.getConstructor().image;' +
                        '}' +
                '}';
            }
        }
        return ret;
    };

}());
