const fs = require("node:fs");
const path = require("node:path");

const emptyReturnValue = (fnCheck) => (_value, key, label, _postOptions) => {
    fnCheck("", key, label);
    return "";
}
module.exports = function fileAdapter(preOptions){
    const user_file = preOptions.user_file;
    const ignoreErrors = preOptions.ignoreErrors;
    return function(fnCheck){
        if(!user_file || !(typeof user_file === "string")){
            if(ignoreErrors){
                return emptyReturnValue(fnCheck);
            }
            throw new Error("--user_file not provided or invalid");
        }
        const path_user_file = path.resolve(user_file);
        if(!fs.existsSync(path_user_file)){
            if(ignoreErrors){
                return emptyReturnValue(fnCheck);
            }
            throw new Error(`${path_user_file} not found`);
        }

        const fileContent = require(path.resolve(path_user_file));
        return function(value, key, label, _postOptions){
            fnCheck(fileContent[value], key, label);
            return fileContent[value];
        }
    }
}