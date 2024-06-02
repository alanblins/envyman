module.exports = function secretManagerAdapter(_preOptions){
    return function(_value, _key, _label, _options){
        throw new Error("not implemented");
    }
}