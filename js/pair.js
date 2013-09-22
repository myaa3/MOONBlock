function pairsToOption(pairs) {
    var ret = {};
    var i, l, pair, prop, value;
    for (i = 0, l = pairs.length; i < l; i++) {
        pair = pairs[i];
        prop = RES(pair[0]);
        value = pair[1];
        ret[prop] = value;
    }
    return ret;
}
