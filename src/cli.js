#!/usr/bin/env node
const colors = require("colors/safe");
const path = require("node:path");
const sourceReaderFactory = require("./sourceReaderFactory");
const {
    clearEnvFiles,
    writeEnvs,
    dryOutput,
    encryptAes256Secrets
} = require("./envFileUtils");

const argv = require("yargs/yargs")(process.argv.slice(2))
.usage(
    "Usage: $0 envyman --workspace [stage | local] --file [path of file]" 
)
.array("encrypt")
.describe(
    "file",
    "file that contains all environment variables in json format."
)
.describe(
    "dry-run",
    "won't create .env files. Shows output with environment variabesl and theirs paths"
)
.describe(
    "user_file",
    "file per user that wil repalce environment variables values."
)
.describe(
    "workspace",
    "workspace equivalent of environments ex: stage, prod, prod-performance"
)
.describe(
"encrypt",
"[--encrypt aes256-gcm <password to encrypt> <passphrase>] encrypt the password"
)
.describe(
"passphrase",
"[--passphrase <passphrase>] decrypt the encrypted passwords for file env"
)
.describe(
"ignore-errors",
"[--ignore-errors ignore errors such as missing user_files, secrets, etc"
)
.check((argv)=>{
    const encrypt = argv.encrypt || [];
    if(encrypt.length > 0 && encrypt.length !==3){
        throw new Error("argument encrypt missing parameters")
    }
    if(encrypt.length > 0 && encrypt[0] !=="aes256-gcm"){
        throw new Error("encrypt method not found")
    }
    return true;
})
.check((argv) =>{
    if(argv.workspace && !argv.file){
        throw new Error("missing --file argument");
    }
    return true;
})
.check((argv)=>{
    if(argv.dryRun){
        const missingMessage = [];
        if(!argv.file){
            missingMessage.push("missing --file argument");
        }
        if(!argv.workspace){
            missingMessage.push("missing --workspace argument");
        }
        if(missingMessage.length){
            throw new Error(missingMessage.join(", "));
        }
    }
    return true;
})
.fail( function(msg, err, yargs){
    if(err){
        console.error(colors.red(msg));
        process.exit(1);
    }

})
.parse();

try{
    if((argv.encrypt || []).length){
        const pass = argv.encrypt[1];
        const passphrase = argv.encrypt[2];
        const encryptedvalue = encryptAes256Secrets({
            pass,
            passphrase
        });
        console.log(encryptedvalue);
        process.exit(0);
    }

    const jsonEnvs = require(path.resolve(argv.file));
    const workspace = argv.workspace;
    const projectFolder = jsonEnvs.projectFolder;
    const dry = argv.dryRun;
    const extendsValue = jsonEnvs["extends"] || {};
    const environmentVariables = filterSources(
        sort(argv.sort, jsonEnvs.environment_variables)
    );
    checkWorkspaceExist(jsonEnvs.environment_variables, workspace);
    if(!argv.clearOnly){
        const adapters = sourceReaderFactory(argv);

        if(dry){
            dryOutput(
                projectFolder,
                adapters,
                workspace,
                environmentVariables,
                extendsValue
            );
        }else{
            clearEnvFiles(projectFolder, environmentVariables)
            writeEnvs(
                projectFolder,
                adapters,
                workspace,
                environmentVariables,
                extendsValue
            )
        }
    }else{
        clearEnvFiles(projectFolder, environmentVariables)
    }
}catch(error){
    console.log(colors.red(error.message));
}

function filterSources(environment_variables){
    return environment_variables.filter( v=> 
        ["user_file", "aes256-gcm", "value", "envVar"].includes(v.source)
    );
}

function sort(isSort, environmentVariables){
    return environmentVariables.sort( (a,b)=>
        isSort ? a.key.localeCompare(b.key) : 0
    );
}

function checkWorkspaceExist(environment_variables, workspace){
    if(environment_variables.every((v)=> v.workspaces[workspace] === undefined)) {
        throw new Error(`The workspace ${workspace} was not found`);
    }
}