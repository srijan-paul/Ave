class Scope {
    constructor(parent) {
        this.elements = {};
        this.parent = (parent) ? parent : null;
    }

    find(name) {
        if (this.elements[name])
            return this.elements[name];
        return (this.parent == null) ? null : this.parent.find(name);
    }
}