# envyman
Generate multiple .env files based on configuration file.

# How it works
The `envyman` CLI reads the env configuration json file and create multiple .env files to multiple folders specified on the config file. It can easily change the environment variables values per environment just changing the commands. The config file can be committed safely to git and the some environment variables can be encrypted or use external values not available on repository.

# Motivation
- As .env file may contain passwords, it is not good practice to commit. 
- As it is not saved on git, developers must copy manually whenever a new and updated environment variables
- In a mono repo project, there are many other env files to manage which also contains duplicated environment variables
- Update or adding new environment increases manual tasks for developers and hard to keep tracking as the project grows.
- lack of faster way to rewrite the .env files to multiple environments variables per environment for testing purpose
- lack of faster way to get secrets for environment variables
- lack of faster way to update environment variables that is different per developer's machine such as SDK paths

# Features
- Add one environment variable and copy to multiple .env to many package folders
- Change the values of environment variables by environment with only 1 parameter
- Add encrypted passwords into the configuration env file and decrypt it when generating to .env files
- Fill environment variables based on specific values per user
- If one environment variable is missing for environment it fails
- Extends environment variables from other environment variables to avoid duplication
- check if it is missing environment variables for specific workspaces

# Instalation
```shell
npm i -g envyman
```

# Use
There are a couple of examples at `examples/monorepo` folder.

## Change values per environments(workspaces)
Generate .env files with local environment values
```
envyman --workspace local --file ./envs.json
```

Generate .env files with stage environment values
```
envyman --workspace stage --file ./envs.json
```

## Change environment variables values per user config
Never commit the user file

Generate .env files with loal environment values with user values
```
envyman --workspace local --file ./env_user_file.json --user_file ./ignoreFiles/user_file.json
```

## Encrypt and decrypt passwords
Encrypt passwords.
```
envyman --encrypt aes256-gcm <password> <passphrase>
```

Decrypt it
```
envyman --workspace local --file ./envs_passwords.json  --passphrase <passphrase>
```

Examples:
Entryp the password
```
envyman --encrypt aes256-gcm mysuperPassword Passphr4seTOdecrypt
```
Save the encrypted password on json file to look like `examples/monorepo/envs_passwords.json`

Generate .env files with local environment values and the passphrase to decrypt the passwords
```
envyman --workspace local --file ./envs_passwords.json  --passphrase Passphr4seTOdecrypt
```
The .env file will look like this
```
DATABASE_URL=http://localhost:2000
DATABASE_PASS=mysuperPassword
```

## Generate .env file except the ones that contains passwords and user files
Generate with the command without the user_file parameter and passphrase. Add the ignore-files to not stop it.
```
envyman --workspace local --file ./envs_passwords.json 
```
It will generate a .env like this
```
DATABASE_URL=http://localhost:2000
DATABASE_PASS=<passphrase not provided>
```

## Dry run --dry-run
See the output of the .env without generate them
```
envyman --workspace local --file ./envs.json --dry-run
```
Output:
```
# packages\app\
SERVER_URL=http://localhost:1000
# packages\database\
DATABASE_URL=http://localhost:2000
```

## Extends workspaces
Add a new workspace that extends all environment variables from another workspace. 
At the json configuration add the property `extends`:
```
"extends":{ 
    "stage-qa": "stage"
},
```
Example is in `examples/monorepo/envs_extends.json`.