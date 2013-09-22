var RAD2DEG = 180 / Math.PI;

enchant.block.moon = {
    assets: [
        'images/menu.9.png',
        'images/slidebarbg.png',
        'images/slidebarknob.png',
        'images/button/run_off.png',
        'images/button/run_on.png',
        'images/button/done_off.png',
        'images/button/done_on.png',
        'images/button/type_off.png',
        'images/button/type_on.png',
        'images/button/code_off.png',
        'images/button/code_on.png',
        'images/button/edit_off.png',
        'images/button/edit_on.png',
        'images/button/particle_red.png',
        'images/button/particle_blue.png'
    ]
};

enchant.Event.COLOR_CHANGED = 'colorchanged';

enchant.block.moon.MoonKnob = enchant.Class.create(enchant.Sprite, {
    initialize: function() {
        var sf = enchant.Core.instance.assets['images/slidebarknob.png'];
        enchant.Sprite.call(this, sf.width, sf.height);
        this.image = sf;
        this.radius = sf.width / 2;
    }
});

enchant.block.moon.MSlideBar = enchant.Class.create(enchant.widget.EntityGroup, {
    initialize: function(min, max, velocity, precision, value) {
        var sf = enchant.Core.instance.assets['images/slidebarbg.png'];
        enchant.widget.EntityGroup.call(this, sf.width, sf.height);
        enchant.widget.focus.toFocusTarget(this);
        enchant.widget.input.enableStopTouchPropagation(this);
        this.label = new enchant.Label('' + value);
        this.label.textAlign = 'center';
        this.label.font = '24px helvetica';
        this.label.color = '#ffffff';
        this.label.width = 106;
        this.label.height = 35;
        this.label.alignHorizontalCenterIn(this);
        this.label.y = 30;
        this.addChild(this.label);
        this.knob = new enchant.block.moon.MoonKnob();
        this.radius = 158;
        this.color = '#50a0ff';
        this.knob.color = '#50a0ff';
        this._min = min;
        this._max = max;
        this._precision = precision;
        this._velocity = velocity;
        this._wrap = 0;
        this._rad(0);
        this._hold = false;
        this.value = value;
        this.addChild(this.knob);
        this.addEventListener(enchant.Event.TOUCH_START, this._ontouchstart);
        this.addEventListener(enchant.Event.TOUCH_MOVE, this._ontouchmove);
        this.background = sf;
    },
    value: {
        get: function() {
            var val = (this._wrap + (this.posRad / Math.PI / 2)) * this._velocity;
            var shift = Math.pow(10, this._precision);
            return Math.round(Math.min(this._max, Math.max(this._min, val)) * shift) / shift;
        },
        set: function(val) {
            val = Math.min(this._max, Math.max(this._min, val));
            this._wrap = (val / this._velocity) | 0;
            this._rad(val % this._velocity / this._velocity * Math.PI * 2);
        }
    },
    _ontouchstart: function(e) {
        var x = e.localX;
        var y = e.localY;
        var knob = this.knob;
        var r = knob.radius;
        var xx = knob.x + r - x;
        var yy = knob.y + r - y;
        if (xx * xx + yy * yy < r * r) {
            this._hold = true;
        } else {
            this._hold = false;
        }
    },
    _ontouchmove: function(e) {
        if (this._hold) {
            var knob = this.knob;
            var r = knob.radius;
            var x = e.localX;
            var y = e.localY;
            knob.x = x - r;
            knob.y = y - r;
            var radius = this.radius;
            x -= this.width / 2;
            y -= this.height / 2;
            var rad = Math.atan(y / x);
            if (x >= 0) {
                rad += Math.PI;
            } else if (y > 0) {
                rad += Math.PI * 2;
            }
            var d = this.posRad - rad;
            if (d < -5) {
                this._wrap--;
            } else if (5 < d) {
                this._wrap++;
            }
            this._rad(rad);
        }
    },
    _rad: function(rad) {
        var radius = this.radius;
        var knobRad = this.knob.radius;
        this.posRad = rad;
        rad += Math.PI;
        this.knob.x = radius * Math.cos(rad) + this.width / 2 - knobRad;
        this.knob.y = radius * Math.sin(rad) + this.height / 2 - knobRad + 8;
        this.label.text = '' + this.value;
    }
});

enchant.block.moon.MSlideBox = enchant.Class.create(enchant.block.InputTextBox, {
    initialize: function(min, max, velocity, precision, value) {
        enchant.block.InputTextBox.call(this);
        this.slideBar = new enchant.block.moon.MSlideBar(min, max, velocity, precision, value);
        this.value = value;
        var that = this;
        this.slideBar.addEventListener(enchant.Event.TOUCH_END, function() {
            that.value = this.value;
        });
        this.addEventListener(enchant.Event.FOCUS, function() {
            var slideBar = this.slideBar;
            var scene = this.scene;
            if (!slideBar.parentNode) {
                slideBar.alignHorizontalCenterIn(scene).alignVerticalCenterIn(scene);
                scene.addChild(slideBar);
            }
        });
        this.addEventListener(enchant.Event.BLUR, function(e) {
            var slideBar = this.slideBar;
            if (e.focus !== slideBar && slideBar.parentNode) {
                slideBar.parentNode.removeChild(slideBar);
            }
        });
        this.slideBar.addEventListener(enchant.Event.BLUR, function() {
            if (this.parentNode) {
                this.parentNode.removeChild(this);
            }
        });
        this._inputMethod = function(callback) {
            callback(value);

        };
    },
    value: {
        get: function() {
            return this._value;
        },
        set: function(value) {
            var isValueChanged = (this._value !== value);
            this._value = ('' + value).replace(/\r|\n/g, '');
            this._input.text = this._value;
            this.width = this._input.width = Math.max(this.minWidth, this._input._boundWidth);
            this.height = this._input.height = Math.max(this.minHeight, this._input._boundHeight);
            if (isValueChanged) {
                this.dispatchEvent(new enchant.Event(enchant.Event.CHANGE));
                this.slideBar.value = value;
            }
        }
    },
    range: function(min, max, value) {
        var slideBar = this.slideBar;
        var d = Math.abs(max - min);
        slideBar._min = min;
        slideBar._max = max;
        slideBar._velocity = d / Math.round(Math.log(d * 2) * Math.LOG2E);
        if (typeof value !== 'number') {
            value = Math.min(min, Math.max(max, this.value));
        }
        this.value = value;
        return this;
    },
    precision: function(prec) {
        this.slideBar._precision = prec;
        return this;
    }
});

enchant.block.moon.HexButton = enchant.Class.create(enchant.widget.EntityGroup, {
    initialize: function(off, on, deco) {
        enchant.widget.EntityGroup.call(this, 76, 86);
        this.background = this._off = off;
        this._on = on;
        var lt = new enchant.Sprite(deco.width, deco.height);
        lt.x += 7;
        lt.y -= 1;
        lt.image = deco;
        this.addChild(lt);
        var rb = new enchant.Sprite(deco.width, deco.height);
        rb.image = deco;
        rb.alignRightIn(this).alignBottomIn(this);
        rb.x -= 6;
        rb.y += 2;
        this.addChild(rb);
        this.addEventListener(enchant.Event.TOUCH_START, function() {
            this.background = this._on;
        });
        this.addEventListener(enchant.Event.TOUCH_END, function() {
            this.background = this._off;
        });
    }
});

function createHexButtonSubClass(name, particleColor) {
    return enchant.Class.create(enchant.block.moon.HexButton, {
        initialize: function() {
            var core = enchant.Core.instance;
            var off = core.assets['images/button/' + name + '_off.png'];
            var on = core.assets['images/button/' + name + '_on.png'];
            var deco = core.assets['images/button/particle_' + particleColor + '.png'];
            enchant.block.moon.HexButton.call(this, off, on, deco);
        }
    });
}

enchant.block.moon.RunButton = createHexButtonSubClass('run', 'blue');
enchant.block.moon.DoneButton = createHexButtonSubClass('done', 'blue');
enchant.block.moon.TypeButton = createHexButtonSubClass('type', 'red');
enchant.block.moon.CodeButton = createHexButtonSubClass('code', 'red');
enchant.block.moon.EditButton = createHexButtonSubClass('edit', 'blue');

enchant.block.moon.RunButton = enchant.Class.create(enchant.block.moon.HexButton, {
    initialize: function() {
        var core = enchant.Core.instance;
        var off = core.assets['images/button/run_off.png'];
        var on = core.assets['images/button/run_on.png'];
        var deco = core.assets['images/button/particle_blue.png'];
        enchant.block.moon.HexButton.call(this, off, on, deco);
    }
});

enchant.block.moon.InputColorBox = enchant.Class.create(enchant.widget.input.Input, {
    initialize: function() {
        enchant.widget.input.Input.call(this);
        enchant.widget.focus.toFocusTarget(this, true);
        this.addEventListener(enchant.Event.FOCUS, this._onfocus);
        this.backgroundColor = '#ffffff';
        this._value = [ 255, 255, 255, 255 ];
    },
    value: {
        get: function() {
            return this._value;
        },
        set: function(value) {
            var isValueChanged = (this._value !== value);
            this._value = value;
            this.backgroundColor = new enchant.color.Color(value).toString();
            if (isValueChanged) {
                this.dispatchEvent(new enchant.Event(enchant.Event.CHANGE));
            }
        }
    },
    _onfocus: function() {
        if (this._focused) {
            return;
        }
        var colorPalette = enchant.block.moon.ColorPalette.getInstance();
        var scene = this.scene;
        colorPalette.alignHorizontalCenterIn(scene).alignVerticalCenterIn(scene);
        scene.addChild(colorPalette);
        var colorBox = this;
        var oncolorChanged = function() {
            var color = new enchant.color.Color(this.picked);
            colorBox.backgroundColor = color.toString();
            colorBox.value = color.rgba;
        };
        var oncolorboxblur =function(e) {
            if (e.focus !== colorPalette) {
                onpaletteblur.call(colorPalette);
            }
            this.removeEventListener(enchant.Event.BLUR, oncolorboxblur);
        };
        var onpaletteblur = function() {
            this.removeEventListener(enchant.Event.COLOR_CHANGED, oncolorChanged);
            this.parentNode.removeChild(this);
            this.removeEventListener(enchant.Event.BLUR, onpaletteblur);
        };
        colorPalette.addEventListener(enchant.Event.COLOR_CHANGED, oncolorChanged);
        this.addEventListener(enchant.Event.BLUR, oncolorboxblur);
        colorPalette.addEventListener(enchant.Event.BLUR, onpaletteblur);
    }
});

enchant.block.moon.PaletteSurface = enchant.Class.create(enchant.Surface, {
    initialize: function(width, height) {
        enchant.Surface.call(this, width, height);
        this._imageData = this.context.createImageData(width, height);
        this._shadowRadius = width / 24 * 9;
        this._shadowCenterX = width / 2;
        this._shadowCenterY = height / 16 * 7;
        this._edgeColor = [ 255, 255, 255, 255 ];
        this._edgeLength = this._shadowRadius - 10;
        this._h = 180;
        this._redraw();
    },
    _redraw: function() {
        this._drawHueRing();
        this._drawSatLightPalette();
        this._drawSatLightFrame();
    },
    _drawHueRing: function() {
        var ctx = this.context;
        var width = this.width;
        var height = this.height;
        var hw = width / 2;
        var hh = height / 2;
        var len = hw * hh;
        var scx = this._shadowCenterX;
        var scy = this._shadowCenterY;
        var sl = Math.pow(this._shadowRadius, 2);
        var imageData = this._imageData;
        var data = imageData.data;
        var vy, vx, sx, sy, l, ll, i, h, rgb;
        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                sx = x - scx;
                sy = y - scy;
                ll = (sx * sx + sy * sy);
                vy = y - hh;
                vx = x - hw;
                l = (vy * vy + vx * vx) / len;
                if (l <= 1) {
                    i = (y * width + x) * 4;
                    h = Math.atan(-sy / sx);
                    if (sx < 0) {
                        h -= Math.PI;
                    }
                    h *= RAD2DEG;
                    if (ll > sl) {
                        rgb = enchant.color.Color.hsv2rgb(h, 0.9, 1.0);
                        data[i] = rgb[0];
                        data[i + 1] = rgb[1];
                        data[i + 2] = rgb[2];
                        data[i + 3] = 255;
                    }
                }
            }
        }
        ctx.putImageData(imageData, 0, 0);
    },
    _drawSatLightPalette: function() {
        var hsl2rgb = enchant.color.Color.hsl2rgb;
        var ctx = this.context;
        var imageData = this._imageData;
        var data = imageData.data;
        var edgeLength = this._edgeLength;
        var sx = this._shadowCenterX - edgeLength;
        var sy = this._shadowCenterY;
        var width = this.width;
        var i;
        var d = 1 / edgeLength;
        var h = this._h;
        var s = 1;
        var v = 1;
        var rgb = [];
        var x, y;
        for (var j = 0, l = edgeLength; j < l; j++) {
            y = j + sy;
            s = 1;
            for (var k = 0, ll = edgeLength; k < ll; k++) {
                x = k + sx;
                rgb = hsl2rgb(h, s, v);
                i = ((y - k) * width + x) * 4;
                data[i] = rgb[0];
                data[i + 1] = rgb[1];
                data[i + 2] = rgb[2];
                data[i + 3] = 255;
                rgb = hsl2rgb(h, s - d, v);
                i = ((y - k) * width + x + 1) * 4;
                data[i] = rgb[0];
                data[i + 1] = rgb[1];
                data[i + 2] = rgb[2];
                data[i + 3] = 255;
                s -= d;
            }
            v -= d;
            sx++;
        }
        ctx.putImageData(imageData, 0, 0);
    },
    _drawSatLightFrame: function() {
        var hsl2rgb = enchant.color.Color.hsl2rgb;
        var ctx = this.context;
        var imageData = this._imageData;
        var data = imageData.data;
        var edgeLength = this._edgeLength;
        var edgeColor = this._edgeColor;
        var sx = this._shadowCenterX - edgeLength - 2;
        var sy = this._shadowCenterY;
        var width = this.width;
        var x, y, i, j, k, l, ll;
        for (j = -2; j < 0; j++) {
            y = j + sy;
            for (k = -2, ll = edgeLength + 2; k < ll; k++) {
                x = k + sx;
                i = ((y - k) * width + x) * 4;
                data[i] = edgeColor[0];
                data[i + 1] = edgeColor[1];
                data[i + 2] = edgeColor[2];
                data[i + 3] = edgeColor[3];
                i = ((y - k) * width + x + 1) * 4;
                data[i] = edgeColor[0];
                data[i + 1] = edgeColor[1];
                data[i + 2] = edgeColor[2];
                data[i + 3] = edgeColor[3];
            }
            sx++;
        }
        for (j = 0, l = edgeLength; j < l; j++) {
            y = j + sy;
            for (k = -2, ll = 0; k < ll; k++) {
                x = k + sx;
                i = ((y - k) * width + x) * 4;
                data[i] = edgeColor[0];
                data[i + 1] = edgeColor[1];
                data[i + 2] = edgeColor[2];
                data[i + 3] = edgeColor[3];
                i = ((y - k) * width + x + 1) * 4;
                data[i] = edgeColor[0];
                data[i + 1] = edgeColor[1];
                data[i + 2] = edgeColor[2];
                data[i + 3] = edgeColor[3];
            }
            for (k = edgeLength, ll = edgeLength + 2; k < ll; k++) {
                x = k + sx;
                i = ((y - k) * width + x) * 4;
                data[i] = edgeColor[0];
                data[i + 1] = edgeColor[1];
                data[i + 2] = edgeColor[2];
                data[i + 3] = edgeColor[3];
                i = ((y - k) * width + x + 1) * 4;
                data[i] = edgeColor[0];
                data[i + 1] = edgeColor[1];
                data[i + 2] = edgeColor[2];
                data[i + 3] = edgeColor[3];
            }
            sx++;
        }
        for (j = edgeLength, l = edgeLength + 2; j < l; j++) {
            y = j + sy;
            for (k = -2, ll = edgeLength + 2; k < ll; k++) {
                x = k + sx;
                i = ((y - k) * width + x) * 4;
                data[i] = edgeColor[0];
                data[i + 1] = edgeColor[1];
                data[i + 2] = edgeColor[2];
                data[i + 3] = edgeColor[3];
                i = ((y - k) * width + x + 1) * 4;
                data[i] = edgeColor[0];
                data[i + 1] = edgeColor[1];
                data[i + 2] = edgeColor[2];
                data[i + 3] = edgeColor[3];
            }
            sx++;
        }
        ctx.putImageData(imageData, 0, 0);
    }
});

var HUE = 1;
var SL = 2;

enchant.block.moon.PaletteSprite = enchant.Class.create(enchant.Sprite, {
    initialize: function(width, height) {
        enchant.Sprite.call(this, width, height);
        var image = this.image = new enchant.block.moon.PaletteSurface(width, height);
        this.addEventListener(enchant.Event.TOUCH_START, this._ontouchstart);
        this.addEventListener(enchant.Event.TOUCH_MOVE, this._ontouchmove);
        this.addEventListener(enchant.Event.TOUCH_END, this._ontouchend);
        this._touch = null;
        this._px = image._shadowCenterX;
        this._py = image._shadowCenterY;
        var h = this._h = 180;
        var s = this._s = 0.5;
        var l = this._l = 0.5;
        this.picked = enchant.color.Color.hsl2rgb(h, s, l);
        this._colorChanged = new enchant.Event(enchant.Event.COLOR_CHANGED);
    },
    _ontouchstart: function(e) {
        var image = this._image;
        var x = e.localX;
        var y = e.localY;
        var h, sl;
        this._touch = null;
        if (h = this._checkHueTouch(x, y)) {
            this._touch = HUE;
            this._h = h;
            this.picked = enchant.color.Color.hsl2rgb(this._h, this._s, this._l);
        } else if (sl = this._checkSatLightTouch(x, y)) {
            this._touch = SL;
            this._px = x;
            this._py = y;
            this._s = sl[0];
            this._l = sl[1];
            this.picked = enchant.color.Color.hsl2rgb(this._h, sl[0], sl[1]);
        }
    },
    _ontouchmove: function(e) {
        var x = e.localX;
        var y = e.localY;
        var h, sl;
        switch (this._touch) {
        case HUE:
            h = this._checkHueTouch(x, y);
            if (h) {
                this._h = h;
                this.picked = enchant.color.Color.hsl2rgb(this._h, this._s, this._l);
                this.dispatchEvent(this._colorChanged);
            }
            break;
        case SL:
            sl = this._checkSatLightTouch(x, y);
            if (sl) {
                this._px = x;
                this._py = y;
                this._s = sl[0];
                this._l = sl[1];
                this.picked = enchant.color.Color.hsl2rgb(this._h, sl[0], sl[1]);
                this.dispatchEvent(this._colorChanged);
            }
            break;
        default:
            break;
        }
    },
    _ontouchend: function(e) {
        var image = this._image;
        var x = e.localX;
        var y = e.localY;
        var h, sl;
        switch (this._touch) {
        case HUE:
            h = this._checkHueTouch(x, y);
            if (h) {
                this._h = image._h = h;
                image._drawSatLightPalette();
                this.picked = enchant.color.Color.hsl2rgb(this._h, this._s, this._l);
                this.dispatchEvent(this._colorChanged);
            }
            break;
        case SL:
            sl = this._checkSatLightTouch(x, y);
            if (sl) {
                this._px = x;
                this._py = y;
                this._s = sl[0];
                this._l = sl[1];
                this.picked = enchant.color.Color.hsl2rgb(this._h, sl[0], sl[1]);
                this.dispatchEvent(this._colorChanged);
            }
            break;
        default:
            break;
        }
    },
    _checkHueTouch: function(x, y) {
        var image = this.image;
        var rad = image._shadowRadius;
        var scx = image._shadowCenterX;
        var scy = image._shadowCenterY;
        var hw = image.width / 2;
        var hh = image.height / 2;
        var sx = x - scx;
        var sy = y - scy;
        var vx = x - hw;
        var vy = y - hh;
        var h;
        if (sx * sx + sy * sy > rad * rad &&
            vx * vx + vy * vy < hw * hh) {
            h = Math.atan(-sy / sx);
            if (sx < 0) {
                h -= Math.PI;
            }
            return h * RAD2DEG;
        } else {
            return false;
        }
    },
    _checkSatLightTouch: function(x, y) {
        var T = Math.sin(45 * Math.PI / 180);
        var image = this._image;
        var edgeLength = image._edgeLength;
        var ox = image._shadowCenterX - edgeLength;
        var oy = image._shadowCenterY;
        var tx = x - ox;
        var ty = y - oy;
        var txT = tx * T;
        var tyT = ty * T;
        edgeLength /= T;
        var s = (txT - tyT) / edgeLength;
        var l = (txT + tyT) / edgeLength;
        if (0 <= s && s <= 1 && 0 <= l && l <= 1) {
            return [ 1 - s, 1 - l ];
        } else {
            return false;
        }
    },
    cvsRender: function(ctx) {
        enchant.Sprite.prototype.cvsRender.call(this, ctx);
        var px = this._px;
        var py = this._py;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px - 1, py - 1, 3, 1);
        ctx.fillRect(px - 1, py + 1, 3, 1);
        ctx.fillRect(px - 1, py, 1, 1);
        ctx.fillRect(px + 1, py, 1, 1);
    }
});

enchant.block.moon.ColorPalette = enchant.Class.create(enchant.widget.EntityGroup, {
    initialize: function() {
        var core = enchant.Core.instance;
        var w = 320, h = 400;
        enchant.widget.EntityGroup.call(this, w, h);
        enchant.widget.focus.toFocusTarget(this, false);
        enchant.widget.input.enableStopTouchPropagation(this);
        this.background = new enchant.widget.Ninepatch(w, h);
        this.background.src = core.assets['images/menu.9.png'];
        var palette = this.palette = new enchant.block.moon.PaletteSprite(256, 256);
        palette.alignHorizontalCenterIn(this).alignVerticalCenterIn(this);
        this.addChild(palette);
        this.picked = palette.picked;
        this.palette.addEventListener(enchant.Event.COLOR_CHANGED, function(e) {
            this.parentNode.picked = this.picked;
            this.parentNode.dispatchEvent(e);
        });
    },
    color: {
        get: function() {
            return this.palette.picked;
        }
    }
});
enchant.block.moon.ColorPalette.instance = null;
enchant.block.moon.ColorPalette.getInstance = function() {
    if (this.instance) {
        return this.instance;
    } else {
        return this.instance = new enchant.block.moon.ColorPalette();
    }
};

enchant.block.Block.prototype.addSliderForm = function(value, name) {
    var form = new enchant.block.moon.MSlideBox(-10, 10, 5, 0, value);
    return this._addElement(form, name, true);
};

enchant.block.Block.prototype.addColorForm = function(name) {
    var colorBox = new enchant.block.moon.InputColorBox();
    this._addElement(colorBox, name, true);
};
