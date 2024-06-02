const fs = require("node:fs");
const path = require("node:path");
function checkExistFolder(folder) {
    if (!fs.existsSync(path.resolve(folder))) {
        throw new Error("folder: " + folder + " does not exist");
    }
}

function readJsonFile(json_file) {
    return require(path.resolve(json_file));
}

function readFile(file_path) {
    return fs.readFileSync(path.resolve(file_path), { encoding: "utf8" });
}

function writeFile(file_path, data) {
    fs.writeFileSync(path.resolve(file_path), data, { flag: "w" });
}

function appendFile(file_path, data) {
    fs.writeFileSync(path.resolve(file_path), data, { flag: "a" });
}

module.exports = { checkExistFolder, readJsonFile, writeFile, appendFile, readFile };
