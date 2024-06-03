# Example with monorepo project
## Basic configuration

local
```
envyman --workspace local --file ./envs.json
cat packages/app/.env
cat packages/database/.env
```

stage
```
envyman --workspace stage --file ./envs.json
cat packages/app/.env
cat packages/database/.env
```

## User file
```
envyman --workspace stage --file ./env_user_file.json --user_file ./ignoreFiles/user_file.json
cat packages/app/.env
cat packages/database/.env
```
## Decrypt with AES 256 GCM 
```
envyman --workspace stage --file ./envs_passwords.json --passphrase Passphr4seTOdecrypt
cat packages/app/.env
cat packages/database/.env
```
## Exported environment variable
```
envyman --workspace stage --file ./env_env_var.json
cat packages/app/.env
cat packages/database/.env
```
## Extends workspace
stage-qa will extends stage
```
envyman --workspace stage-qa --file ./envs_extends.json
cat packages/app/.env
cat packages/database/.env
```