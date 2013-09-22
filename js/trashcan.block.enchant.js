/**
 * trashcan.block.enchant.js
 * @version 0.1.0
 * @require enchant.js v0.6.2+
 * @require widget.enchant.js v0.2.0+
 * @author Ubiquitous Entertainment Inc.
 *
 * @description
[lang:ja]
 * block.enchant.jsのエディタに簡単にゴミ箱機能を追加するためのプラグイン.
[/lang]
 */
enchant.block.trashcan = {
    assets: [ 'images/trashcan.png' ]
};

/**
 * @scope enchant.block.TrashCan.prototype
 */
enchant.block.TrashCan = enchant.Class.create(enchant.Sprite, {
    /**
     * @name enchant.block.TrashCan
     * @class
     [lang:ja]
     * ブロックを投げ込むことができるゴミ箱.
     [/lang]
     * @constructs
     * @extends enchant.Sprite
     */
    initialize: function() {
        var core = enchant.Core.instance;
        var manager = enchant.block.Manager.instance;
        enchant.Sprite.call(this, 64, 64);
        this.image = core.assets['images/trashcan.png'];
        this.empty();
        manager.registerDragTarget(this);
        this.addEventListener('blockreceived', function(e) {
            this.store(e.block);
        });
    },
    /**
     [lang:ja]
     * ゴミ箱に保持しているブロックをシリアライズする.
     * @return {Object[]} ブロックのシリアライズ結果のリスト.
     [/lang]
     */
    serialize: function() {
        return this._storedBlocks.map(function(block) {
            return block._getSerializationSource();
        });
    },
    /**
     [lang:ja]
     * シリアライズされたデータからブロックを復元してゴミ箱に追加する.
     * @param {Object[]} blocks ブロックのシリアライズ結果のリスト.
     [/lang]
     */
    deserialize: function(blocks) {
        blocks.forEach(function(data) {
            this.store(enchant.block.Block.createFromSerializedData(data));
        }, this);
    },
    /**
     [lang:ja]
     * ゴミ箱にブロックを追加する.
     * 編集画面から自動的に削除される.
     * @param {enchant.maeda.Block} block ゴミ箱に追加するブロック.
     [/lang]
     */
    store: function(block) {
        if (block.parentNode) {
            block.parentNode.removeChild(block);
        }
        this._storedBlocks.push(block);
    },
    /**
     [lang:ja]
     * ゴミ箱からブロックを削除する.
     * 編集画面に自動的に追加される.
     * @param {enchant.maeda.Block} block ゴミ箱から削除するブロック.
     [/lang]
     */
    restore: function(block) {
        var i = this._storedBlocks.indexOf(block);
        if (i !== -1) {
            enchant.block.Manager.instance.targetGroup.addChild(block);
            this._storedBlocks.splice(i, 1);
        }
    },
    _setStore: function(array) {
        this._storedBlocks = array;
    },
    /**
     [lang:ja]
     * ゴミ箱を空にする.
     * 保持しているブロックを全て削除する.
     [/lang]
     */
    empty: function() {
        this._setStore([]);
    }
});
