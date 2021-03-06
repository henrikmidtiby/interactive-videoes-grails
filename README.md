# Tekvideo

## Setting up Local Development Environment

This installation guide is targeting a system based on Ubuntu 18.04.

Install requirements using the package system.
```
sudo apt install postgresql zip openjdk-8-jdk
```


### Installed dependencies

Installing the grails framework (local for the standard user)
```
cd /home/henrik
curl -s https://get.sdkman.io | bash
source .sdkman/bin/sdkman-init.sh
sdk install grails 3.2.9
```

Installed node versioning manager (nvm).
```
cd /home/henrik
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
```

Logged out and in again, to be able to see the ´nvm´ command.

```
nvm install --lts
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


### Building the frontend

Building the frontend for tekvideo.sdu.dk
```
cd tekvideo_deployment/tekvideo.sdu.dk/frontend
./build.sh
```


### Installing postgresql



Test that postgreqsl works and create two databases.
```
sudo -i -u postgres
psql
```

For the production server, the following is used instead.
```
CREATE USER tekvideo PASSWORD 'devpassword';
CREATE DATABASE "tekvideo-dev" OWNER tekvideo;
CREATE DATABASE "tekvideo-test" OWNER tekvideo;
\q
```

Move database dump to the server from my laptop
```
scp /home/henrik/Nextcloud/2018-09-21psqldump-tekvideo3 henrik@10.0.0.188:/home/henrik
```

Put data into the database from the database dump.
```
sudo -u postgres psql tekvideo-dev < ~/2018-09-21psqldump-tekvideo3
```


### Run the development server


```
grails run-app -https
```

It is now possible to access the development server on the address
https://localhost:8443


### Ensure that the right java version is used

There is a conflict with java version 10, so this has to be avoided.
Here java 8 is installed and set as the default version to use.

```
sudo apt install openjdk-8-jdk
sudo update-alternatives --config java
```


## Different notes

### How to make a dump of the postgresql database

```
sudo -i -u postgres
pg_dump tekvideo-dev > 2019-08-26tekvideo_dev_dump.txt
```

# How to restore a dump

Connect to the database using the psql client.
```
sudo -i -u postgres
psql
```

Inside the psql command line, run the following commands.
```
\l
DROP DATABASE "tekvideo-dev";
CREATE DATABASE "tekvideo-dev" OWNER tekvideo;
\q
```

Return to the normal user, and issue the command
```
sudo -u postgres psql tekvideo-dev < 2019-08-26tekvideo-3-server-dump.txt
```



### Running manual queries on the postgresql database


Connect to the database using the psql client.
```
sudo -i -u postgres
psql
```

Inside the psql command line, run the following commands.
```
\c "tekvideo-dev"
SELECT * from written_exercise limit 2;
```

### Set state of the hibernate_sequence

Get the next value from the hibernate_sequence
and then set the next value to a fixed value.

```
SELECT nextval('hibernate_sequence');
SELECT setval('hibernate_sequence', 80000);
```


### Insert logging code in the grails application

```
log.error("Error message")
log.error(object.dump())
```
