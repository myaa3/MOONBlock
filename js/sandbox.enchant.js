
if (enchant) {

(function() {

enchant.sandbox = {};

enchant.sandbox.IframeItem = enchant.Class.create(enchant.widget.EntityGroup, {
    initialize: function(width, height, src) {
        var ifr = this._iframe = document.createElement('iframe');
        ifr.width = width;
        ifr.height = height;
        enchant.widget.EntityGroup.call(this, width, height);
        this._element = document.createElement('div');
        ifr.style[enchant.ENV.VENDOR_PREFIX + 'TransformOrigin'] = '0 0';
        ifr.style.border = '0px';
        ifr.style.margin = '0px';
        this._element.appendChild(ifr);

        var that = this;
        ifr.addEventListener('load', function() {
            that.dispatchEvent(new enchant.Event(enchant.Event.LOAD));
        });
        if (src) {
            this.src = src;
        }
    },
    _updateScale: function() {
        var sx = this._width / this._iframe.width;
        var sy = this._height / this._iframe.height;
        this._iframe.style[enchant.ENV.VENDOR_PREFIX + 'Transform'] =
            'scale(' + sx + ', ' + sy + ')';
    },
    width: {
        get: function() {
            return this._width;
        },
        set: function(width) {
            this._width = width;
            this._style.width = width + 'px';
            this._updateScale();
        }
    },
    height: {
        get: function() {
            return this._height;
        },
        set: function(height) {
            this._height = height;
            this._style.height = height + 'px';
            this._updateScale();
        }
    },
    src: {
        get: function() {
            return this._src;
        },
        set: function(src) {
            this._src = src;
            this._iframe.src = src;
        }
    },
    reload: function() {
        if (this._iframe.contentWindow) {
            this._iframe.contentWindow.location.reload(true);
        }
    },
    postMessage: function(message, origin) {
        if (this._iframe.contentWindow) {
            this._iframe.contentWindow.postMessage(message, origin);
        }
    }
});

})();

}
