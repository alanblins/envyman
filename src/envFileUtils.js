const colors = require("colors/safe");
const os = require("os");
const path = require("node:path");
const sourceReaderFacade = require("./sourceReaderFacade");
const { checkExistFolder, appendFile, writeFile } = require("./fileUtils");
const aes256 = require("./encryptions/aes-256-gcm");
module.exports = {
    clearEnvFiles,
    appendEnv,
    writeEnvs,
    dryOutput,
    encryptAes256Secrets,
};
function clearEnvFiles(projectFolder, environmentVariables) {
    const paths = environmentVariables.flatMap((v) => v.paths);
    paths.filter(onlyUnique).forEach((s_path) => {
        const folder = path.join(projectFolder, s_path);
        checkExistFolder(folder);
        cleanEnv(folder);
    });
    if (environmentVariables.some((v) => !(v.paths && v.paths.length > 0))) {
        const folder = path.join(projectFolder);
        checkExistFolder(folder);
        cleanEnv(folder);
    }
}

function appendEnv(folder, value, key) {
    const data = `${key}=${value}` + os.EOL;
    const filePath = path.join(folder, ".env");
    appendFile(filePath, data);
}

function cleanEnv(folder) {
    writeFile(path.join(folder, ".env"), "");
}

function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
}

function addToEnv(value, key) {
    return function (folder) {
        checkExistFolder(folder);
        appendEnv(folder, value, key);
    };
}

function writeEnvs(
    projectFolder,
    adapters,
    workspace,
    environmentVariables,
    extendsValue
) {
    environmentVariables.forEach((variable) => {
        const workspace_extended = extendsValue[workspace];
        const temp_value =
            variable.workspaces[workspace] ??
            variable.workspaces[workspace_extended];
        const key = variable.key;
        const sourceAdapter = sourceReaderFacade(adapters, variable.source);
        const value = sourceAdapter(temp_value, key, workspace);
        const addToFolder = addToEnv(value, key);

        if (variable.paths && variable.paths.length > 0) {
            variable.paths.forEach((s_path) =>
                addToFolder(path.join(projectFolder, s_path))
            );
        } else {
            addToFolder(projectFolder);
        }
    });
}

function addDryValues(dryValues, value, key) {
    return function (folder) {
        dryValues[folder] = dryValues[folder] || [];
        dryValues[folder].push(
            `${colors.green(key)}=${colors.blue(value)}`
        );
    };
}
function dryOutput(
    projectFolder,
    adapters,
    workspace,
    environmentVariables,
    extendsValue
) {
    const dryValues = {};
    environmentVariables.forEach((variable) => {
        const workspace_extended = extendsValue[workspace];
        const temp_value =
            variable.workspaces[workspace] ??
            variable.workspaces[workspace_extended];
        const key = variable.key;
        const sourceAdapter = sourceReaderFacade(adapters, variable.source);
        const value = sourceAdapter(temp_value, key, workspace);
        const addToFolder = addDryValues(dryValues, value, key);
        if (variable.paths && variable.paths.length > 0) {
            variable.paths.forEach((s_path) => {
                const folder = path.join(projectFolder, s_path);
                checkExistFolder(folder);
                const s_path_clean = path.join(s_path, "./");
                addToFolder(s_path_clean);
            });
        } else {
            const folder = path.join(projectFolder);
            checkExistFolder(folder);
            addToFolder(folder);
        }
    });
    const sortAlph = (a, b) => a.localeCompare(b);
    const keys = Object.keys(dryValues).sort(sortAlph);
    keys.forEach((key) => {
        const values = dryValues[key].sort(sortAlph);
        console.log(`# ${key}`);
        values.forEach((value) => console.log(value));
    });
}

function encryptAes256Secrets({ pass, passphrase }) {
    return aes256.encrypt(pass, passphrase);
}
