module.exports = function adapter(preOptions){
    const ignoreErrors = preOptions.ignoreErrors;
    return function(fnCheck){
        return function (value, key, workspace, _options){
            fnCheck(value, key, workspace, ignoreErrors);
            return value;
        }
    }
}