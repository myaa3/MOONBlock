enchant();

enchant.puppet.Theatre.create({
    showScore: false,
    assets: {
        'clear.png': 'clear.png',
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
    }
});

window.addEventListener('message', function(e) {
    var theatre = enchant.puppet.Theatre.instance;
    var data = JSON.parse(e.data);
    if (data.type == 'puppet') {
        enchant.puppet.Actor.clear();
        try {
            eval(data.code);
            if (!(theatre.currentScene instanceof enchant.LoadingScene)) {
                enchant.puppet.Theatre._execSceneStartEvent();
            }
            setTimeout(function() {
                theatre.rootScene._dispatchExitframe();
            }, 10);
        } catch (e) {
            var origin = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
            parent.postMessage(JSON.stringify({
                type: 'error',
                line: e.line,
                message: e.message,
                stack: e.stack
            }), origin);
        }
    }
    //game.start();
});
