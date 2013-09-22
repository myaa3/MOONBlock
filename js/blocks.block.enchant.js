
if (enchant.block) {

(function() {

enchant.block.blocks.control = {
    desc: {
        blockCategory: RES('blocks.categories.control')
    }
};

enchant.block.blocks.control.IfBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this, '#45ad52');
        this.setConnectTarget('evalable');
        this.addLabel(RES('blocks.IfBlock.name'));
        this.addReceptor('expression', 'condition');
        this.addLabel(RES('blocks.IfBlock.then'));
        this.addFoldButton('+', '-', [ 'thenLabel', 'thenDo' ]);
        this.addBR();
        this.addLabel(RES('blocks.IfBlock.do'), 'thenLabel');
        this.addMultipleReceptor('evalable', 'thenDo');
        this.addBR();
        this.iteratize();
        this.script = 'if (<% condition %>) {\n<% thenDo(\n) %>\n}';
    }
});

enchant.block.blocks.control.RepeatBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this, '#45ad52');
        this.setConnectTarget('evalable');
        this.addLabel(RES('blocks.RepeatBlock.name'));
        this.addSliderForm(10, 'limit')
            .range(0, 30);
        this.addFoldButton('+', '-', [ 'thenLabel', 'thenDo' ]);
        this.addBR();
        this.addLabel(RES('blocks.RepeatBlock.do'), 'thenLabel');
        this.addMultipleReceptor('evalable', 'thenDo');
        this.addBR();
        this.iteratize();
    },
    getCounterVariableName: function() {
        return (function char(c, n) {
            var dn = n % 18;
            // [i-z]\{1,}
            c = String.fromCharCode(105 + dn) + c;
            if (n / 18 >= 1) {
                return char(c, Math.floor(n / 18 - 1));
            } else {
                return c;
            }
        }('', this.getNestLevel()));
    },
    getNestLevel: function() {
        (function count(from, Constructor, n) {
            var receptors = from._receptors;
            if (from instanceof Constructor) {
                from.nest = n;
                n += 1;
            }
            receptors.forEach(function(receptor) {
                var block;
                if (receptor.received) {
                    block = receptor.received.parentNode;
                    block.getIterated().forEach(function(block) {
                        count(block, Constructor, n);
                    });
                }
            });
        }(this.ancestor, this.getConstructor(), 0));
        return this.nest;
    },
    script: {
        get: function() {
            return 'for (var $i = 0; $i < <% limit %>; $i++) {\n<% thenDo(\n) %>\n}'
                .replace(/\$i/g, this.getCounterVariableName());
        }
    }
});

enchant.block.blocks.control.SetTimeoutBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this, '#3399cc');
        this.setConnectTarget('evalable');
        this.addLabel(RES('blocks.SetTimeoutBlock.name'));
        this.addSliderForm(1, 'time')
            .range(0, 30)
            .precision(1);
        this.addLabel(RES('blocks.SetTimeoutBlock.label'));
        this.addFoldButton('+', '-', [ 'thenDo' ]);
        this.addBR();
        this.addMultipleReceptor('evalable', 'thenDo');
        this.addBR();
        this.iteratize();
        this.script = 'setTimeout((function() {' +
            '<% thenDo(\n) %>' +
            '}).bind(this), <% time %> * 1000);';
    }
});

enchant.block.blocks.control.SetIntervalBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this, '#3399cc');
        this.setConnectTarget('evalable');
        this.addLabel(RES('blocks.SetIntervalBlock.name'));
        this.addSliderForm(1, 'time')
            .range(0, 30)
            .precision(1);
        this.addLabel(RES('blocks.SetIntervalBlock.label1'));
        this.addSliderForm(2, 'times')
            .range(2, 30);
        this.addLabel(RES('blocks.SetIntervalBlock.label2'));
        this.addFoldButton('+', '-', [ 'thenDo' ]);
        this.addBR();
        this.addMultipleReceptor('evalable', 'thenDo');
        this.addBR();
        this.iteratize();
        this.script = '(function(self, times) {' +
            'var t = 0;' +
            'var _id = setInterval((function() {' +
                '<% thenDo(\n) %>' +
                't++;' +
                'if (t >= times) {' +
                'clearInterval(_id);' +
                 '}' +
            '}).bind(self), <% time %> * 1000);' +
            'return _id;' +
        '}(this, <% times %>));';
    }
});

enchant.block.blocks.logic = {
    desc: {
        blockCategory: RES('blocks.categories.logic')
    }
};

enchant.block.blocks.logic.AndBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this, '#15fd02');
        this.setConnectTarget('expression');
        this.addReceptor('expression property number string', 'a');
        this.addSelectForm({
            '&&': '&&',
            ' || ': '||',
            '>': '>',
            '<': '<',
            '>=': '>=',
            '<=': '<=',
            '==': '==',
            '!=': '!='
        }, 'op');
        this.addReceptor('expression property number string', 'b');
        this.addBlank(9, 1);
        this.script = '(<% a %> <% op %> <% b %>)';
    }
});

enchant.block.blocks.logic.NotBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this, '#15fd02');
        this.setConnectTarget('expression');
        this.addLabel('not');
        this.addReceptor('expression', 'a');
        this.script = '(!<% a %>)';
    }
});

enchant.block.blocks.variable = {
    desc: {
        blockCategory: RES('blocks.categories.variable')
    }
};

enchant.block.blocks.variable.AssignBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this, '#3399cc');
        this.setConnectTarget('evalable');
        this.addLabel(RES('blocks.AssignBlock.name'));
        this.addReceptor('property', 'a');
        this.addSelectForm({
            '=': '=',
            '+=': '+=',
            '-=': '-=',
            '*=': '*=',
            '/=': '/='
        }, 'op')
        this.addReceptor('property number string', 'b');
        this.addBlank(9, 1);
        this.iteratize();
        this.script = '<% a %> <% op %> <% b %>;';
    }
});

enchant.block.blocks.variable.ComputeBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this, '#15fd02');
        this.setConnectTarget('number');
        this.addLabel(RES('blocks.ComputeBlock.name'));
        this.addReceptor('property number string', 'a');
        this.addSelectForm({
            '+': '+',
            '-': '-',
            '*': '*',
            '/': '/'
        }, 'op')
        this.addReceptor('property number string', 'b');
        this.addBlank(9, 1);
        this.script = '<% a %> <% op %> <% b %>';
    }
});

enchant.block.blocks.variable.NumberBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this, '#15fd02');
        this.setConnectTarget('number');
        this.addLabel(RES('blocks.NumberBlock.name'));
        this.addSliderForm(0, 'value')
            .range(-1024, 1024, 0);
        this.addBlank(9, 1);
        this.script = '<% value %>';
    }
});

enchant.block.blocks.variable.RandomBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this, '#15fd02');
        this.setConnectTarget('number');
        this.addLabel(RES('blocks.RandomBlock.name'));
        this.addBR();
        this.addLabel(RES('blocks.RandomBlock.label1'));
        this.addSliderForm(0, 'min')
            .range(-1024, 1024, 0);
        this.addLabel(RES('blocks.RandomBlock.label2'));
        this.addSliderForm(10, 'max')
            .range(-1024, 1024, 10);
        this.addLabel(RES('blocks.RandomBlock.label3'));
        this.addBlank(9, 1);
    },
    script: {
        get: function() {
            var val1 = parseInt(this.getSentence('min'), 10);
            var val2 = parseInt(this.getSentence('max'), 10);
            var min, max;
            if (val1 < val2) {
                min = val1;
                max = val2;
            } else {
                min = val2;
                max = val2;
            }
            return 'Math.floor(Math.random() * ' + (max - min) + ' + ' + min + ')';
        }
    }
});

enchant.block.blocks.variable.ProbBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this, '#15fd02');
        this.setConnectTarget('expression');
        this.addLabel(RES('blocks.ProbBlock.name'));
        this.addSliderForm(0, 'value')
            .range(0, 100, 50);
        this.addLabel(RES('blocks.ProbBlock.suffix'));
        this.script = '(Math.random() * 100 >= <% value %>)';
    }
});

enchant.block.blocks.variable.StringBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this, '#15fd02');
        this.setConnectTarget('string');
        this.addLabel(RES('blocks.StringBlock.name'));
        this.addTextForm('', 'value')
            .prompt(RES('blocks.StringBlock.prompt'));
        this.addBlank(9, 1);
        this.script = '"<% value %>"';
    }
});

enchant.block.blocks.javascript = {
    desc: {
        blockCategory: 'JavaScript'
    }
};

enchant.block.blocks.javascript.EvalBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this, '#3399cc');
        this.setConnectTarget('evalable');
        this.addLabel(RES('blocks.EvalBlock.name'));
        this.addTextForm('', 'do')
            .prompt(RES('blocks.EvalBlock.prompt'));
        this.addBR();
        this.iteratize();
        this.script = '<% do %>';
    }
});

enchant.block.blocks.javascript.ExpressionBlock = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this, '#15fd02');
        this.setConnectTarget('expression');
        this.addLabel(RES('blocks.ExpressionBlock.name'));
        this.addTextForm('', 'condition')
            .prompt(RES('blocks.ExpressionBlock.prompt'));
        this.script = '<% condition %>';
    }
});

})();

}
