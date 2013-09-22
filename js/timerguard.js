(function() {
    [
        [ 'setTimeout', 'clearTimeout' ],
        [ 'setInterval', 'clearInterval' ]
    ].forEach(function(pair) {
        var set = pair[0], clear = pair[1],
            setter = window[set], idStore = [];
        window[set] = function() {
            var id = setter.apply(this, arguments);
            idStore.push(id);
            return id;
        };
        window[clear + 'All'] = function() {
            idStore.forEach(window[clear]);
            idStore = [];
        };
    });
}());
