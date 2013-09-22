(function() {

var pascalTriangle = function(n) {
    return (function pasc(iteration, array) {
        var ret;
        if (iteration) {
            ret = [ 1 ];
            array.reduce(function(a, b) {
                ret.push(a + b);
                return b;
            });
            return pasc(iteration - 1, ret.concat(1));
        } else {
            return array;
        }
    }(Math.abs(n | 0), [ 1 ]));
};

var getGaussianMatrix = function(size) {
    var pasc = pascalTriangle(size - 1);
    var mat = [];
    var y, x, i;

    for (y = 0; y < size; y++) {
        for (x = 0; x < size; x++) {
            mat.push(pasc[y] * pasc[x]);
        }
    }
    var matSum = mat.reduce(function(a, b) {
        return a + b;
    });
    return mat.map(function(n) {
        return n / matSum;
    });
};

var writePixelData = function(imageData, x, y, pixel) {
    var data = imageData.data;
    var i = (y * imageData.width + x) * 4;
    data[i] = pixel[0];
    data[i + 1] = pixel[1];
    data[i + 2] = pixel[2];
    data[i + 3] = pixel[3];
};

var readPixelData = function(imageData, x, y) {
    var data = imageData.data;
    var i = (y * imageData.width + x) * 4;
    return [
        data[i],
        data[i + 1],
        data[i + 2],
        data[i + 3]
    ];
};

var comparePixelData = function(p1, p2) {
    return !(p1[0] !== p2[0] ||
        p1[1] !== p2[1] ||
        p1[2] !== p2[2] ||
        p1[3] !== p2[3]);
};

enchant.Surface.prototype.fillPixel = function(x, y, color) {
    var width = this.width;
    var height = this.height;
    var imageData = this.context.getImageData(0, 0, width, height);
    var data = imageData.data;
    var toReplace = readPixelData(imageData, x, y);
    var searchNewPoint = function(x, y, leftX, rightX) {
        var inFillArea = false;
        while (leftX <= rightX || inFillArea) {
            if (leftX < width && comparePixelData(readPixelData(imageData, leftX, y), toReplace)) {
                inFillArea = true;
            } else if (inFillArea == true) {
                searchLine(leftX - 1, y);
                inFillArea = false;
            }
            leftX++;
        }
    };
    var searchLine = function(x, y) {
        var leftX = x;
        var rightX = x;
        if (!comparePixelData(readPixelData(imageData, x, y), toReplace)) {
            return;
        }
        while (rightX < width - 1 && comparePixelData(readPixelData(imageData, rightX + 1, y), toReplace)) {
            rightX++;
            writePixelData(imageData, rightX, y, color);
        }
        while (0 < leftX && comparePixelData(readPixelData(imageData, leftX - 1, y), toReplace)) {
            leftX--;
            writePixelData(imageData, leftX, y, color);
        }
        writePixelData(imageData, x, y, color);
        if (y + 1 <= height - 1) {
            searchNewPoint(x, y + 1, leftX, rightX);
        }
        if (0 <= y - 1) {
            searchNewPoint(x, y - 1, leftX, rightX);
        }
    };
    searchLine(x, y);
    this.context.putImageData(imageData, 0, 0);
};

enchant.Surface.prototype.getAlphaMask = function() {
    var width = this.width;
    var height = this.height;
    var sf = new enchant.Surface(width, height);
    var imageData = this.context.getImageData(0, 0, width, height);
    var data = imageData.data;
    var a;
    for (var i = 0, l = data.length; i < l; i += 4) {
        a = data[i + 3];
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = a * 255;
    }
    sf.context.putImageData(imageData, 0, 0);
    return sf;
};

enchant.Surface.prototype.getPadded = function(spWidth, spHeight, padWidth, padHeight) {
    var fRows = Math.floor(this.width / spWidth);
    var fCols = Math.floor(this.height / spHeight);
    var sf = new Surface(this.width + fRows * padWidth * 2, this.height + fCols * padHeight * 2);
    var img = this._element;
    var ctx = sf.context;
    var ox, oy;
    var px, py;
    for (var y = 0; y < fCols; y++) {
        oy = y * spHeight;
        py = oy + 2 * y * padHeight + padHeight;
        for (var x = 0; x < fRows; x++) {
            ox = x * spWidth;
            px = ox + 2 * x * padWidth + padWidth;
            ctx.drawImage(img, ox, oy, spWidth, spHeight, px, py, spWidth, spHeight);
        }
    }
    return sf;
};

enchant.Surface.prototype.getBlured = function(blurSize) {
    var width = this.width;
    var height = this.height;
    var sf = new Surface(width, height);
    var imageData = this.context.getImageData(0, 0, width, height);
    var data = imageData.data;
    var destImageData = this.context.createImageData(width, height)
    var destData = destImageData.data;
    var size = Math.floor(blurSize) * 2 + 1;
    var mat = getGaussianMatrix(size);

    var me = Math.floor(blurSize);
    var ms = -me;

    var yw = 0;
    var mw, nw;
    var c, o;
    var y, x, i, j, n, m;
    var r, g, b, a;
    for (y = 0; y < height; y++) {
        for (x = 0; x < width; x++) {
            i = (yw + x) * 4;
            mw = 0;
            nw = ms * width;
            r = g = b = a = 0;
            for (n = ms; n <= me; n++) {
                for (m = ms; m <= me; m++) {
                    c = mw + m + me;
                    o = (nw + m) * 4;
                    if (0 <= x + m && x + m < width &&
                        0 <= y + n && y + n < height) {
                        r += data[i + o] * mat[c];
                        g += data[i + o + 1] * mat[c];
                        b += data[i + o + 2] * mat[c];
                        a += data[i + o + 3] * mat[c];
                    }
                }
                mw += size;
                nw += width;
            }
            destData[i] = r;
            destData[i + 1] = g;
            destData[i + 2] = b;
            destData[i + 3] = a;
        }
        yw += width;
    }

    sf.context.putImageData(destImageData, 0, 0);

    return sf;
};

}());
