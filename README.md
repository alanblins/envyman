# envyman
Generate multiple .env files based on configuration file.

# Example
Create this file:

envs.json
```
{
    "projectFolder": "./",
    "environment_variables": [
        {
            "name": "Server URL",
            "description": "Url of the web server",
            "key": "SERVER_URL",
            "source": "value",
            "workspaces":{
                "stage": "https://stage.myserver.com",
                "local": "http://localhost:1000"
            },
            "paths": ["packages/app"]
        },
        {
            "name": "Database URL",
            "description": "Url of the database",
            "key": "DATABASE_URL",
            "source": "value",
            "workspaces":{
                "stage": "https://database.myserver.com",
                "local": "http://localhost:2000"
            },
            "paths": ["packages/database"]
        }
    ]
}
```

Run the command below:
```
envyman --workspace local --file ./envs.json
```
It will create the following .env files

packages/app/.env
```
SERVER_URL=http://localhost:1000
```
packages/database/.env
```
DATABASE_URL=http://localhost:2000
```

Run the command with a different workspace:
```
envyman --workspace stage --file ./envs.json
```

It will create the following .env files

packages/app/.env
```
SERVER_URL=https://stage.myserver.com
```
packages/database/.env
```
DATABASE_URL=https://database.myserver.com
```

# Overview
The `envyman` CLI creates multiple .env files from a json file that contains all environment variables, with their values, description, destinations and values per environment. It helps developers switch easily the .env files with differenet values per environment. 

# Features
- Update the .env files with different values per environment 
- Copy duplicated environment variables to other .env files. Useful for monorepo project that contains similar .env files
- Change environment variables values by environment with only 1 parameter
- Add encrypted passwords into the json file and decrypt it when generating to .env files
- Fill environment variables based on specific values per user
- If one environment variable is missing for environment it fails
- Extends environment variables from other environment variables to avoid duplication
- Check if it is missing environment variables for specific workspaces


# Motivation
- As .env file may contain passwords, it is not good practice to commit. 
- As it is not saved on git, developers must copy manually whenever a new and updated environment variables
- In a mono repo project, there are many other env files to manage which also contains duplicated environment variables
- Update or adding new environment increases manual tasks for developers and hard to keep tracking as the project grows.
- Lack of faster way to rewrite the .env files to multiple environments variables per environment for testing purpose
- Lack of faster way to get secrets for environment variables
- Lack of faster way to update environment variables that is different per developer's machine such as SDK paths

# Instalation
```shell
npm i -g envyman
```

# Use
```
envyman --workspace [workspace] --file [path of the file with environment variables]
```

## Configuration file
```
{
    "projectFolder": "./", //folder destination of .env files
    "environment_variables": [
        {
            "name": "Server URL", //(optional) environment variable's name
            "description": "Url of the web server", //(optional) environment variable's description
            "key": "SERVER_URL",//(required) the key of environment variable 
            "source": "value", //(required) value | user_file | env_var | aes256-gcm
            "workspaces":{ //(required) values of environment variable per environment.
                "stage": "https://stage.myserver.com",
                "local": "http://localhost:1000"
                "any_other_workspace": "https://other.myserver.com"
            },
            "paths": ["packages/app", "packages/app2"] //(optional) subdirectories destination of .env files. If not provided it will create .env file into projectFolder.
        }
    ]
}
```

## Source - how to read the environment variables
### value
It will add the value into .env
```
"projectFolder": "./", 
"environment_variables": [
        {
            "key": "SERVER_URL",
            "source": "value", 
            "workspaces":{ 
                "stage": "https://stage.myserver.com",
                "local": "http://localhost:1000"
            }
        }
]
```
Output on .env
```
SERVER_URL=http://localhost:1000
```

### user_file
It will replace the values from an external file. This external file should never be committed as may contain specific values per developer.

user_file.json
```
{
    "SDK_PATH": "/User/user123/sdk"
}
```

envs.json
```
"projectFolder": "./", 
"environment_variables": [
        {
            "key": "SDK",
            "source": "user_file", 
            "workspaces":{ 
                "stage": "SDK_PATH",
                "local": "SDK_PATH"
            }
        }
]

```

Run `envyman` with --user_file parameter
```
envyman --workspace local --file ./envs.json --user_file ./user_file.json
```
Output
```
SDK=/User/user123/sdk
```

### env_var
If there is already an exported environment variable on the machine, you reuse it
```
export HTTP_PROXY=https://someproxy.com
```
env.json
```
{
    "projectFolder": "./",
    "environment_variables": [
        {
            "name": "http proxy",
            "description": "http proxy",
            "key": "MY_HTTP_PROXY",
            "source": "env_var",
            "workspaces":{
                "stage": "HTTP_PROXY",
                "local": "HTTP_PROXY"
            },
            "paths": ["packages/app", "packages/database"]
        }
    ]
}
```
Output .env
```
MY_HTTP_PROXY=https://someproxy.com
```

### aes256-gcm
Decrypt the environment variable's values encrypted with aes256-gcm

envs.json
```
{
    "projectFolder": "./",
    "environment_variables": [
        {
            "name": "Database passoword",
            "description": "Database passoword",
            "key": "DATABASE_PASS",
            "source": "aes256-gcm",
            "workspaces": {
                "stage": "6YGjXRxs4x4RCLxWWjbOsF4z6e6zMs9kfFqnXyxoRKuph+56l+HVICFe3Zo7/CtA7l2hWrhXHea/Mee24qNURa7rY+WcugWxUTIVZfqh7HVEqEJEFOga9kbWxOmGFMBI9OATg0NOb2JK8P5S7J9E",
                "local": "6YGjXRxs4x4RCLxWWjbOsF4z6e6zMs9kfFqnXyxoRKuph+56l+HVICFe3Zo7/CtA7l2hWrhXHea/Mee24qNURa7rY+WcugWxUTIVZfqh7HVEqEJEFOga9kbWxOmGFMBI9OATg0NOb2JK8P5S7J9E"
            },
            "paths": ["packages/database"]
        }
    ]
}

```

Run `envyman` with passphrase
```
envyman --workspace local --file ./envs.json  --passphrase Passphr4seTOdecrypt
```

Output .env
```
DATABASE_URL=http://localhost:2000
DATABASE_PASS=mysuperPassword
```


## Change values per environments(workspaces)
Generate .env files with local environment values
```
envyman --workspace local --file ./envs.json
```

Generate .env files with stage environment values
```
envyman --workspace stage --file ./envs.json
```

## Encrypt and decrypt passwords
Encrypt passwords.
```
envyman --encrypt aes256-gcm <password> <passphrase>
```

Decrypt it
```
envyman --workspace [workspace] --file [file with environment variables]  --passphrase <passphrase>
```
## Ignore errors
`envyman` stops when not found other configuration such as `user_file` of `passphrase`. Add the `ignore-errors` to ignore these errors it.
```
envyman --workspace [workspace] --file [file with environment variables] --ignore-errors
```
It will generate a .env like this
```
DATABASE_URL=http://localhost:2000
DATABASE_PASS=<passphrase not provided>
```

## Dry run
See the output of the .env without create .env files
```
envyman --workspace [workspace] --file [file with environment variables] --dry-run
```

Output:
```
# packages/app/
SERVER_URL=http://localhost:1000
# packages/database/
DATABASE_URL=http://localhost:2000
```

## Extends workspaces
Add a new workspace that extends all environment variables from another workspace with the property `extends`:
```
{
    "projectFolder": "./",
    "extends":{
        "stage-qa": "stage" //stage-qa will extend stage
    },
    "environment_variables": [
        {
            "name": "Server URL",
            "description": "Url of the web server",
            "key": "SERVER_URL",
            "source": "value",
            "workspaces":{
                "stage": "https://stage.myserver.com",
                "local": "http://localhost:1000"
            },
            "paths": ["packages/app"]

        },
        {
            "name": "Database URL",
            "description": "Url of the database",
            "key": "DATABASE_URL",
            "source": "value",
            "workspaces":{
                "stage-qa": "https://database-qa.myserver.com",
                "stage": "https://database.myserver.com",
                "local": "http://localhost:2000"
            },
            "paths": ["packages/database"]
        }
    ]
}
```
Run `envy` for `stage-qa`
```
envyman --workspace stage-qa --file ./envs.json
```
Output:
packages/app/.env
```
SERVER_URL=https://stage.myserver.com
```
packages/database/.env
```
DATABASE_URL=https://database-qa.myserver.com
```


### Encrypt the password
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

## Examples:
There are full examples at [examples](https://github.com/alanblins/envyman/blob/master/examples/monorepo/README.md) folder.