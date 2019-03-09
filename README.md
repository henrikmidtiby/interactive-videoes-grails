# TekVideo - grails 3.2.9 version of the readme

## Setting up Local Development Environment

### Requirements

  - Grails 3.2.9
  - PostgreSQL 10

This guide will assume a Linux system, but setup should be possible on both
Windows and Mac.

Installing the requirements on Linux (Ubuntu 18.04) can be done as shown below:


#### PostgreSQL

```
sudo apt install postgresql
```

#### Grails

```
curl -s https://get.sdkman.io | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"
sdk install grails 3.2.9
```

#### nvm

Install Node Version Manager (nvm), by following the guide on https://github.com/creationix/nvm
```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
export NVM_DIR="${XDG_CONFIG_HOME/:-$HOME/.}nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
command -v nvm
```

#### npm and some dependencies

```
nvm install --lts
npm install -g bower
npm install -g vulcanize
npm install -g bower-npm-resolver
```


### Getting the Code

Once the dependencies mentioned above are installed you should be able to
continue.

First clone and pull in sub-modules the project using:

```
git clone --recurse-submodules https://github.com/henrikmidtiby/tekvideo.sdu.dk.git
cd tekvideo.sdu.dk
git submodule init
git submodule update
```

This will download the code for `tekvideo.sdu.dk` and download additional
dependencies stored as submodules.



#### Building the frontend



```
cd tekvideo.sdu.dk/frontend
./build.sh
```



### Setting up the Database

The configuration for the development database is stored in `grails-
app/conf/application.groovy`. By default the server will require a user, with
the username `devuser` and the password `devpassword`. This user should own the
two database required for development, which are `tekvideo-dev` and `tekvideo-
test`. This setup can be created from the command-line using the following:

Start postgres from the CLI:

```
sudo -u postgres psql
```

Create user and associated databases.

```
CREATE USER tekvideo PASSWORD 'devpassword';
CREATE DATABASE "tekvideo-dev" OWNER tekvideo;
CREATE DATABASE "tekvideo-test" OWNER tekvideo;
```

Terminate the postgresql client
```
\q
```

Populate the database with content, by importing data dump from the server (tekvideo.sdu.dk).


```
sudo -u postgres psql tekvideo-dev < 2018-09-21psqldump-tekvideo3
```


### Ensure that the right java version is used

There is a conflict with java version 10, so this has to be avoided.
Here java 8 is installed and set as the default version to use.

```
sudo apt install openjdk-8-jdk
sudo update-alternatives --config java
```

### Run the development server

To run the development server, do the following:

```
cd tekvideo
grails run-app -https
```

# TekVideo - grails 2 version of the readme

## Contents

<!-- MarkdownTOC -->

- [Setting up Local Development Environment](#setting-up-local-development-environment)
    - [Requirements](#requirements)
    - [Getting the Code](#getting-the-code)
    - [Setting up the Database](#setting-up-the-database)
    - [Configuration](#configuration)
    - [Running the Development Server](#running-the-development-server)

<!-- /MarkdownTOC -->

## Setting up Local Development Environment

### Requirements

  - Grails 2.5.2
  - PostgreSQL 9.4.5

This guide will assume a Linux system, but setup should be possible on both
Windows and Mac.

Installing the requirements on Linux (Ubuntu 18.04) can be done as shown below:


#### PostgreSQL

```
sudo apt install postgresql
```

#### Grails

```
curl -s https://get.sdkman.io | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"
sdk install grails
```

### Getting the Code

Once the dependencies mentioned above are installed you should be able to
continue.

First clone and pull in sub-modules the project using:

```
git clone https://github.com/DanThrane/tekvideo.sdu.dk.git
cd tekvideo.sdu.dk
git submodule init
git submodule update
```

This will download the code for `tekvideo.sdu.dk` and download additional
dependencies stored as submodules.

### Setting up the Database

The configuration for the development database is stored in `grails-
app/conf/DataSource.groovy`. By default the server will require a user, with
the username `devuser` and the password `devpassword`. This user should own the
two database required for development, which are `tekvideo-dev` and `tekvideo-
test`. This setup can be created from the command-line using the following:

Start postgres from the CLI:

```
sudo -u postgres psql
```

Create user and associated databases.

```
CREATE USER devuser PASSWORD 'devpassword';
CREATE DATABASE "tekvideo-dev" OWNER devuser;
CREATE DATABASE "tekvideo-test" OWNER devuser;
```

Terminate the postgresql client
```
\q
```

At this point the database schema needs to be created. This project uses the
Grails plugin [database-migration](http://grails-plugins.github.io/grails-
database-migration/docs/manual/index.html) to handle database migrations. This
can also be used to create the schema.

```
cd tekvideo.sdu.dk
grails dbm-update
```

### Configuration

Some additional configuration is required for things which cannot be stored
inside of the repository (such as API tokens and passwords). The file is
loaded from `~/.grails/tekvideo-config.properties`. It should contain the
following values:

```
grails.mail.username=<USERNAME>
grails.mail.password=<PASSWORD>
apis.youtube.key=<YOUTUBE_API_KEY>
apis.vimeo.token=<VIMEO_API_KEY>
```

The e-mail used is assumed to be a GMail. To change this look at the
configuration in `grails-app/conf/Config.groovy`.

### Running the Development Server

```
cd tekvideo.sdu.dk
grails run-app
```

The first time you run the server, it will download any additional missing
dependencies, and create additional test-data for the server. Once this
process is done, you should receive the following message:

```
| Server running. Browse to http://localhost:8080/tekvideo
```

Simply point your browser to http://localhost:8080/tekvideo and you should be
presented with the application.

This process will create the following users which can be used for testing:

| Username |  Password  |      Role      |
|----------|------------|----------------|
| Teacher  | `password` | `ROLE_TEACHER` |
| Student  | `password` | `ROLE_STUDENT` |

These users are only created once, and only if run in development mode. The
behavior of the data bootstrap can be changed in 
`grails-app/conf/Bootstrap.groovy`.
