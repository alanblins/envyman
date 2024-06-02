module.exports = function envVarAdapter(){
    return function (fnCheck){
        return function (value, key, label, _options){
            fnCheck(process.env[value], key, label);
            return process.env[value];
        };
    };
};