module.exports = function envVarAdapter(){
    return function (fnCheck){
        return function (value, key, workspace, _options){
            fnCheck(process.env[value], key, workspace);
            return process.env[value];
        };
    };
};