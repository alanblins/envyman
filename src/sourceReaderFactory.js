const fileAdapterCreate = require("./sourceAdapters/fileAdapter");
const valueAdapterCreate = require("./sourceAdapters/valueAdapter");
const aes256AdapterCreate = require("./sourceAdapters/aes256Adapter");
const envVarAdapterCreate = require("./sourceAdapters/envVarAdapter");

function sourceReaderCreate(argv) {
    const fileAdapter = fileAdapterCreate({
        user_file: argv.user_file,
        ignoreErrors: argv.ignoreErrors,
    });
    const valueAdapter = valueAdapterCreate({
        ignoreErrors: argv.ignoreErrors,
    });
    const aes256Adapter = aes256AdapterCreate({
        passphrase: argv.passphrase,
        ignoreErrors: argv.ignoreErrors,
    });
    const envVarAdapter = envVarAdapterCreate({
        ignoreErrors: argv.ignoreErrors,
    });

    const adapters = {
        fileAdapter,
        valueAdapter,
        aes256Adapter,
        envVarAdapter,
    };
    return adapters;
}

module.exports = sourceReaderCreate;
