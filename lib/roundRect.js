(function() {
    var ctx = document.createElement('canvas').getContext('2d');
    var ctxproto = Object.getPrototypeOf(ctx);
    ctxproto.roundRect = function(x, y, w, h, r) {
        var hx = x + w / 2;
        var hy = y + h / 2;
        var ex = x + w;
        var ey = y + h;
        this.moveTo(hx, y);
        this.arcTo(ex, y, ex, hy, r);
        this.arcTo(ex, ey, hx, ey, r);
        this.arcTo(x, ey, x, hy, r);
        this.arcTo(x, y, hx, y, r);
        this.lineTo(hx, y);
    };
}());
