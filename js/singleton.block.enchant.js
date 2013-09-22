(function() {

enchant.Event.SINGLETON_BLOCK_CREATED = 'singletonblockcreated';

enchant.Event.SINGLETON_BLOCK_DELETED = 'singletonblockdeleted';

enchant.block.SingletonBlockPrototype = enchant.Class.create(enchant.block.Block, {
    initialize: function() {
        enchant.block.Block.call(this);
        enchant.block.SingletonBlockPrototype.singletonize(this);
    }
});

enchant.block.SingletonBlockPrototype.singletonize = function(block) {
    var manager = enchant.block.Manager.instance;
    block.addEventListener(enchant.Event.ADDED_TO_SCENE, function() {
        enchant.block.kit.ActionKitBar.collection.forEach(function(bar) {
            var categoryName = manager.findCategoryNameByConstructor(block.getConstructor());
            if (categoryName) {
                bar.box[categoryName].hideItem(this.constructorName);
            }
        }, this);
        var evt = new enchant.Event(enchant.Event.SINGLETON_BLOCK_CREATED);
        evt.block = this;
        enchant.Core.instance.dispatchEvent(evt);
    });
    block.addEventListener(enchant.Event.REMOVED_FROM_SCENE, function() {
        enchant.block.kit.ActionKitBar.collection.forEach(function(bar) {
            var categoryName = manager.findCategoryNameByConstructor(block.getConstructor());
            if (categoryName) {
                bar.box[categoryName].appearItem(this.constructorName);
            }
        }, this);
        var evt = new enchant.Event(enchant.Event.SINGLETON_BLOCK_DELETED);
        evt.block = this;
        enchant.Core.instance.dispatchEvent(evt);
    });
};

}());
