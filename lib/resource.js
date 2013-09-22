(function(root) {

    function parseDotPath(str) {
        return str.split('.');
    }

    function parseSlashPath(str) {
        return str.split('/');
    }

    function Dir(name) {
        this.name = name;
        this.children = {};
    }

    Dir.prototype.getChild = function(name) {
        return this.children[name] || null;
    };

    Dir.prototype.mkdir = function(name) {
        var dir = new Dir(name);
        this.children[name] = dir;
        return dir;
    };

    Dir.prototype.mkdirs = function(path) {
        return parseDotPath(path).reduce(function(parent, name) {
            return parent.getChild(name) || parent.mkdir(name);
        }, this);
    };

    Dir.prototype.addDataFromObject = function(object) {
        var child;
        for (var name in object) {
            child = object[name];
            if (typeof child === 'object') {
                (this.getChild(name) || this.mkdir(name))
                    .addDataFromObject(child);
            } else {
                this.children[name] = child;
            }
        }
    };

    function ResourceManager() {
        this.root = new Dir('root');
    }

    ResourceManager.prototype.addResource = function(path, obj) {
        this.root.mkdirs(path).addDataFromObject(obj);
    };

    ResourceManager.prototype.get = function(path) {
        try {
            return parseDotPath(path).reduce(function(parent, name) {
                return parent.getChild(name);
            }, this.root);
        } catch (e) {
            throw new Error('resource not found: ' + path);
        }
    };

    root.resource = {
        Dir: Dir,
        ResourceManager: ResourceManager
    };

}(this));
