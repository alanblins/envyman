const cryptoFn = require("../encryptions/aes-256-gcm");
module.exports = function adapter(preOptions){
    const passphrase = preOptions.passphrase;
    const ignoreErrors = preOptions.ignoreErrors;
    return function (fnCheck){
        return function (value, key, label, _options){
            fnCheck(value, key, label);
            if(!passphrase){
                if(ignoreErrors){
                    return "<passphrase not provided>";
                }
                throw new Error(
                    "the environment variable" +
                    key +
                    " has encrypted value. It needs --decrypt argument. Check envy-man --help"
                )
            }
            return cryptoFn.decrypt(
                value,
                passphrase
            )
        }
    }
};
