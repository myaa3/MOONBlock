(function() {

var TextRenderer = enchant.Class.create({
    renderLines: function(ctx, lines, lineHeight) {
        var y = 0;
        for (var i = 0, l = lines.length; i < l; i++) {
            ctx.fillText(lines[i], 0, y);
            y += lineHeight;
        }
    },
    splitText: function(text, width, font) {
        var ctx = enchant.Surface._staticCanvas2DContext;
        ctx.save();

        ctx.font = font;

        var charWidth = ctx.measureText('@').width;

        var lines = text.split(/\r\n|\r|\n/)
            .map(function(line) {
                var ret = [];
                var seq = line;
                var i;
                do {
                    i = (function searchFoldPoint(_seq, pos, step, width) {
                        var subseq = _seq.slice(0, pos);
                        var w = ctx.measureText(subseq).width;
                        var diff = w - width;
                        if (diff > 0) {
                            return searchFoldPoint(_seq, pos - step, step >> 1 || 1, width);
                        } else if (Math.abs(diff) >= charWidth && seq !== subseq) {
                            return searchFoldPoint(_seq, pos + step, step >> 1 || 1, width);
                        } else {
                            return pos;
                        }
                    }(seq, seq.length, seq.length >> 1 , width));
                    ret.push(seq.slice(0, i));
                    seq = seq.slice(i);
                } while (seq.length);
                return ret;
            })
            .reduce(function(frag1, frag2) {
                return frag1.concat(frag2);
            });

        ctx.restore();

        return lines;
    }
});
TextRenderer.instance = new TextRenderer();

enchant.TextView = enchant.Class.create(enchant.Sprite, {
    initialize: function(width, height) {
        enchant.Sprite.call(this, width, height);
        enchant.widget.input.enableStopTouchPropagation(this);
        enchant.widget.focus.toFocusTarget(this);
        this.backgroundColor = '#ffffff';
        this.image = new enchant.TextViewSurface(width, height);
        var y = 0;
        this.addEventListener(enchant.Event.TOUCH_START, function(e) {
            y = e.y;
        });
        this.addEventListener(enchant.Event.TOUCH_MOVE, function(e) {
            var dy = y - e.y;
            y = e.y;
            this.scroll(-dy);
        });
    },
    value: {
        get: function() {
            return this._value;
        },
        set: function(value) {
            var oldValue = this._value;
            var e;
            if (value !== oldValue) {
                this._value = value;
                this.image.text = value;
                e = new enchant.Event(enchant.Event.CHANGE);
                e.oldValue = oldValue;
                this.dispatchEvent(e);
            }
        }
    },
    scroll: function(dy) {
        this.image.scroll(dy);
    }
});

enchant.TextViewSurface = enchant.Class.create(enchant.Surface, {
    initialize: function(width, height) {
        enchant.Surface.call(this, width, height);
        this.font = '16px monospace';
        this.text = '';
        this._scrollY = 0;
    },
    _update: function(lineHeight) {
        var ctx = this._element.getContext('2d');
        ctx.save();
        ctx.textBaseline = 'top';
        ctx.font = this.font;
        ctx.fillStyle = '#000000';
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.translate(0, this._scrollY % lineHeight);

        var lineNum = Math.ceil(this.height / lineHeight);
        var begin = Math.max(0, Math.min(this._lines.length - lineNum, ~~(-this._scrollY / lineHeight)));
        var end = begin + lineNum;
        TextRenderer.instance.renderLines(ctx, this._lines.slice(begin, end), lineHeight);

        ctx.restore();
    },
    text: {
        get: function() {
            return this._text;
        },
        set: function(text) {
            this._text = text;
            this._lines = TextRenderer.instance.splitText(text, this.width, this.font);
            this._update(24);
        }
    },
    scroll: function(dy) {
        if (this._scrollY + dy >= 0) {
            this._scrollY = 0;
        } else if (this._scrollY + dy <= -this._lines.length * 24 + this.height) {
            this._scrollY = -this._lines.length * 24 + this.height;
        } else {
            this._scrollY += dy;
        }
        this._update(24);
    }
});

}());
