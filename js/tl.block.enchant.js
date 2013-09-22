enchant.Timeline.prototype.resizeTo = function(w, h, time, easing) {
    return this.tween({
        width: w,
        height: h,
        time: time,
        easing: easing
    });
};

enchant.Timeline.prototype.zoomIn = function(zoom, time, easing) {
    var game = enchant.Game.instance;
    var that = this.node;
    var offsetX = (game.width - that.width * zoom) / 2;
    var offsetY = (game.height - that.height * zoom) / 2;
    var dx = -that._offsetX * zoom + offsetX;
    var dy = -that._offsetY * zoom + offsetY;
    return this.node.scene.tl
        .scaleTo(zoom, time)
        .and()
        .moveTo(dx, dy, time)
        .delay(1)
        .then(function() {
            that._inputMethod(function(val) {
                if (val !== null) {
                    this.value = val;
                }
            });
        });
};

enchant.Timeline.prototype.zoomOut = function(time, easing) {
    return this.node.scene.tl
        .scaleTo(1, time)
        .and()
        .moveTo(0, 0, time);
};
