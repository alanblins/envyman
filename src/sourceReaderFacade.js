function checkValue(value, key, workspace, ignoreErrors) {
    if (value === undefined && !ignoreErrors) {
        throw new Error(
            `the key '${key}' was not found on workspace '${workspace}'.`
        );
    }
}

function sourceReaderFacade(adapters, source) {
    if (source === "user_file") {
        return adapters.fileAdapter(checkValue);
    }
    if (source === "aes256-gcm") {
        return adapters.aes256Adapter(checkValue);
    }
    if (source === "env_var") {
        return adapters.envVarAdapter(checkValue);
    }
    return adapters.valueAdapter(checkValue);
}

module.exports = sourceReaderFacade;
