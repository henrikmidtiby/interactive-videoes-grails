# Setting up TekVideo webserver

## Original server used to host tekvideo.sdu.dk

The original webserver that can host the tekvideo site consists of the following elements.

 - apache webserver
 - tomcat java servlet
 - postgresql database

In addition were ssl certificates set up to enable serving using the https protocol.

The system was installed on an Ubuntu 14.04 server.

The site conflicts with Java 9 / 10 and therefore Java 8 (openjdk-8-jdk) is used.


## New server for hosting tekvideo.sdu.dk

To get rid of the old Ubuntu 14.04 server, I want to install a new server from scratch.
The server will be based on Ubuntu 18.04 and the following elements

 - nginx webserver / reverse proxy
 - tomcat java servlet
 - postgresql database

This document (is intended to) contain detailed information about setting 
up such a server.


## Online guides I have used for inspiration

 - How To Install Apache Tomcat 9 Server on Ubuntu 18.04 LTS & 16.04 LTS [http://yallalabs.com/linux/how-to-install-apache-tomcat-9-server-on-ubuntu-18-04-lts-16-04-lts/]
 - How to server flask application swith gunicorn and nginx on Ubuntu 18.04 [https://www.digitalocean.com/community/tutorials/how-to-serve-flask-applications-with-gunicorn-and-nginx-on-ubuntu-18-04]
 - How to install PostgreSQL on a Ubuntu VPS Running NGinx [https://hostadvice.com/how-to/how-to-install-postgresql-on-nginx-web-servers/]
 - Nginx + Apache tomcap configuration example [https://www.mkyong.com/nginx/nginx-apache-tomcat-configuration-example/]
 - How to install apache tomcat 9 on linux to deploy java webapps [https://www.thegeekstuff.com/2017/06/install-tomcat-linux/]


## Various notes

### Getting ssl certificates signed by sdu.dk

Create a csr file and mail it to Thomas Iversen (tek it).
```
# openssl req -new -newkey rsa:2048 -nodes -keyout tekvideo.sdu.dk.key -out tekvideo.sdu.dk.csr
Generating a 2048 bit RSA private key
................+++
.+++
writing new private key to 'tekvideo.sdu.dk.key'
-----
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [AU]:DK
State or Province Name (full name) [Some-State]:
Locality Name (eg, city) []:Odense
Organization Name (eg, company) [Internet Widgits Pty Ltd]:SDU                  
Organizational Unit Name (eg, section) []:TEK
Common Name (e.g. server FQDN or YOUR name) []:*.sdu.dk
Email Address []:hemi@mmmi.sdu.dk


Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []:
An optional company name []:
```


On the server, there is information about the placement of the certificates in the file
/etc/apache2/sites-available/000-default.conf
When updating the certificates, the following guide seems promising
https://www.digicert.com/csr-ssl-installation/apache-openssl.htm

Installation of new https certificates
Place the files (DigiCertCA.crt, star_sdu_dk.crt and star_sdu_dk.key) in the directory /etc/apache2/ssl. Effectively replacing the existing files.
If filenames have been updated, update references to them in the file /etc/apache2/sites-available/000-default.conf
Restart apache
apachectl configtest
apachectl stop
apachectl start





# Installation actions



## Install postgresql version 10.7

```
$ sudo apt install postgresql postgresql-contrib
```

Check 
```
$ sudo -i -u postgres
$ psql
```




## Install nginx

```
$ sudo apt install nginx
```

The nginx server is launched automatically and you should be able to see the site on the public address of the server.

### Configure nginx

Set the `server_name` to `tekvideo.tek.sdu.dk` in the file
```
$ sudo gvim /etc/nginx/sites-enabled/default
```

## Install tomcat


### Create tomcat user

[https://linuxize.com/post/how-to-install-tomcat-9-on-ubuntu-18-04/]

```
sudo mkdir /opt/tomcat
sudo groupadd tomcat
sudo useradd -s /bin/false -g tomcat -d /opt/tomcat tomcat
wget http://www-eu.apache.org/dist/tomcat/tomcat-9/v9.0.19/bin/apache-tomcat-9.0.19.tar.gz -P /tmp
sudo tar xf /tmp/apache-tomcat-9*.tar.gz -C /opt/tomcat
sudo ln -s /opt/tomcat/apache-tomcat-9.0.19/ /opt/tomcat/latest
sudo chown -RH tomcat: /opt/tomcat/latest
sudo sh -c 'chmod +x /opt/tomcat/latest/bin/*.sh'
sudo vi /etc/systemd/system/tomcat.service
sudo systemctl daemon-reload
sudo systemctl start tomcat
sudo systemctl status tomcat
sudo systemctl enable tomcat

cd /opt/tomcat/latest
sudo chown -R tomcat webapps/ work/ temp/ logs/
```

```
$ sudo apt install tomcat9
$ sudo apt install openjdk-8-jdk
$ sudo update-alternatives --config java
```


Test the tomcat installation by using the text based browser lynx.
```
lynx tekvideo.tek.sdu.dk
```



## Set up tekvideo deployment directory


```
$ mkdir tekvideo_deployment
$ cd tekvideo_deployment
$ vi deploy
```

Note that the deploy script takes a while to run.
Especially the buildFrontend takes several minutes.



## Experiments in a virtual server

Installed Ubuntu 18.04.2 server in Virtual Box.
Updated all installed packages.

Set network in virtual box to bridged, this allows the virtual machine to get an ip from the same range as the host machin.

Took a snapshot of the installation at this point.

### Tomcat 9

Install tomcat9 with openjdk 8 as java version.
```
sudo apt install openjdk-8-jdk
sudo update-alternatives --config java
sudo apt install tomcat9
sudo apt install tomcat9-examples
```

Try to deploy a test example
```
cd /usr/share/tomcat9-examples/examples
sudo jar cfM simple.war *
cp simple.war /var/lib/tomcat9/webapps
```

From the host computer, I could now connect to 
[http://192.168.123.34:8080/examples/] and see the tomcat examples in action.

Took a snapshot of the installation at this point.


### Nginx reverse proxy server

```
sudo apt install nginx
```

From the host computer, I could now connect to 
[http://192.168.123.34] and see the nginx welcome screen.


#### Connect to the tomcat server


Edit the file `/etc/nginx/sites-available/example`
and fill it with the following content.
```
sudo vi /etc/nginx/sites-available/example
```

Content
```
server {
    listen 80;
    listen [::]:80;
    server_name  example.com www.example.com 192.168.123.34;

    proxy_redirect           off;
    proxy_set_header         X-Real-IP $remote_addr;
    proxy_set_header         X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header         Host $http_host;

    location / {
            proxy_pass http://127.0.0.1:8080;
    }
}
```

From the host computer, I could now connect to 
[http://192.168.123.34] and see the tomcat welcome screen.

Took a snapshot of the installation at this point.


### Grails


```
cd
sudo apt install zip
curl -s https://get.sdkman.io | bash
source .sdkman/bin/sdkman-init.sh
sdk install grails 3.2.9
```


### PostgreSQL

```
sudo apt install postgresql 
```

Test that postgreqsl works and create two databases.
```
sudo -i -u postgres
psql
```

Create user and associated databases, this is used for the local development server.
```
CREATE USER tekvideo PASSWORD 'devpassword';
CREATE DATABASE "tekvideo-dev" OWNER tekvideo;
CREATE DATABASE "tekvideo-test" OWNER tekvideo;
```

For the production server, the following is used instead.
```
CREATE USER tekvideo PASSWORD 'secretpassword';
CREATE DATABASE "tekvideo-3" OWNER tekvideo;
```
And the real value of the 'secretpassword' is stored in a 
configuration file outside of the git repository
(/home/dathr12/.grails/tekvideo-config.properties)

A suitable password can be generated with the following command
```
python3 -c "import secrets; print(secrets.token_hex(32))"
```


Terminate the postgresql client
```
\q
```

Populate the database with content, by importing data dump from the server (tekvideo.sdu.dk).

```
# For the development server
sudo -u postgres psql tekvideo-dev < 2018-09-21psqldump-tekvideo3
# For the production server
sudo -u postgres psql tekvideo-3 < ~/2018-09-21psqldump-tekvideo3
```


### Tekvideo deployment script

Created a new ssh key for github and added it to github.
```
ssh-keygen -t rsa -b 4096 -C "henrikmidtiby@gmail.com"
```

Cloned the git repository recursively
```
git clone --recursive git@github.com:henrikmidtiby/tekvideo_deployment.git
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

Create the file `/home/henrik/.grails/tekvideo-config.properties'.
```
dataSource.username=tekvideo
#dataSource.password=secretpassword
```

Point to the grails settings file (which contains the password for the database).
```
grails.config.locations = ["/home/henrik/.grails/tekvideo-config.properties"]
```



Building the frontend for tekvideo.sdu.dk
```
cd tekvideo_deployment/tekvideo.sdu.dk/frontend
./build.sh
```

#### Dev mode (not attempted this time)

Ran the server in development mode.
```
cd tekvideo_deployment/tekvideo.sdu.dk
grails -https -host=192.168.123.34 run-app
```

After accepting a warning about an insecure site, it was able to 
view the site in both firefox and chrome on the address
[192.168.123.34].

I cannot log into the site using the SDU SSO system at the moment, 
as the systems wants to connect to localhost and that somehow fails.


#### Production


Had to manually delete the ROOT and ROOT.war content of `/var/lib/tomcat9/webapps/`.

```
cd tekvideo_deployment
./deploy
```

After accepting a warning about an insecure site, it was able to 
view the site in both firefox and chrome on the address
[192.168.123.34].

I cannot log into the site using the SDU SSO system at the moment, 
as the systems wants to connect to localhost and that somehow fails.


### Nginx - ssl certificates in place

Using this guide: [https://hostadvice.com/how-to/how-to-configure-nginx-to-use-self-signed-ssl-tls-certificate-on-ubuntu-18-04-vps-or-dedicated-server/].

Generate certificate and key file.
```
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/example.com.key -out /etc/ssl/certs/example.com.crt
```

Modify the nginx configuration file `/etc/nginx/sites-available/example`.
```
server {
    listen 443 ssl;
    listen [::]:443 ssl;

    ssl_certificate /etc/ssl/certs/example.com.crt;
    ssl_certificate_key /etc/ssl/private/example.com.key;

    server_name 192.168.123.34;

    proxy_redirect           off;
    proxy_set_header         X-Real-IP $remote_addr;
    proxy_set_header         X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header         Host $http_host;

    location / {
            proxy_pass http://127.0.0.1:8080;
    }
}


server {
    listen 80;
    listen [::]:80;

    server_name 192.168.123.34;

    proxy_redirect           off;
    proxy_set_header         X-Real-IP $remote_addr;
    proxy_set_header         X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header         Host $http_host;

    # Only forward this without https to make the single signon work.
    location /sso/index {
            proxy_pass http://127.0.0.1:8080;
    }

    location / {
	    return 302 https://$server_name$request_uri;
    }
}

```

Now requests to [http://192.168.123.34] are forwarded to [https://192.168.123.34].
Chromium currently displays a warning about an insecure site, which is caused by my use 
of self signed certificates.




## Observation from old server

something is targeting port 18080 on tekvideo.sdu.dk
Information in the /etc/apache2/sites-enabled/000-default.conf

This is redirected to 18443
/opt/tomcat/conf/server.xml



### Single Sign On



#### Site in virtual box
https://192.168.123.34/sso/index
https://sso.sdu.dk//login?service=https%3A%2F%2F192.168.123.34%2Flogin%2Fcas
https://192.168.123.34/login/cas?ticket=ST-143864-ckUPuWszgWMpGZsiNNijKyWUdbt6QjYQbuEzF9KqqKQkPxCCvu
Displays an "internal server error (500)".

#### Site on tekvideo.sdu.dk
https://tekvideo.sdu.dk/sso/index
https://sso.sdu.dk//login?service=https%3A%2F%2Ftekvideo.sdu.dk%2Flogin%2Fcas
https://tekvideo.sdu.dk/login/cas?ticket=ST-145279-egRzxRvesyDJ2bGrvz67kv9dGy3UwvTh4FmwDDKkj6ASkR3EYU
https://tekvideo.sdu.dk/sso/index
https://tekvideo.sdu.dk/
Site is now loaded and the user is logged in.




# Second attempt at a virtual server

Start: 18:30

Install required packages
```
sudo apt install openjdk-8-jdk tomcat9 nginx postgresql zip mc
```

Time: 18:55 

Installing the grails framework (local for the standard user)
```
cd /home/henrik
curl -s https://get.sdkman.io | bash
source .sdkman/bin/sdkman-init.sh
sdk install grails 3.2.9
```

Time: 18:58

Test that postgreqsl works and create two databases.
```
sudo -i -u postgres
psql
```

For the production server, the following is used instead.
```
CREATE USER tekvideo PASSWORD 'secretpassword';
CREATE DATABASE "tekvideo-3" OWNER tekvideo;
\q
```

A suitable password can be generated with the following command
```
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Move database dump to the server from my laptop
```
scp /home/henrik/Nextcloud/2018-09-21psqldump-tekvideo3 henrik@10.0.0.188:/home/henrik
```

Put data into the database from the database dump.
```
sudo -u postgres psql tekvideo-3 < ~/2018-09-21psqldump-tekvideo3
```

Time: 19:00

Clone the tekvideo deployment git repository
```
git clone --recursive https://github.com/henrikmidtiby/tekvideo_deployment.git
```

Building the frontend for tekvideo.sdu.dk
```
cd tekvideo_deployment/tekvideo.sdu.dk/frontend
./build.sh
```

Time: 19:08

Create the file `/home/henrik/.grails/tekvideo-config.properties', with the content:
```
dataSource.username=tekvideo
dataSource.password=secretpassword
```

Time: 19:15


Delete the default site for tomcat
```
cd /var/lib/tomcat9/webapps
sudo rm ROOT ROOT.war
```


```
cd ~/tekvideo_deployment
./deploy
```

Wait for a line in the logfile with the message
```
11-May-2019 17:55:17.203 INFO [Catalina-utility-2] 
org.apache.catalina.startup.HostConfig.deployWAR 
Deployment of web application archive 
[/var/lib/tomcat9/webapps/ROOT.war] has finished in [49,630] ms
```




### Nginx - ssl certificates in place


Generate certificate and key file.
```
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/example.com.key -out /etc/ssl/certs/example.com.crt
```

Modify the nginx configuration file `/etc/nginx/sites-available/example`.
```
server {
    listen 443 ssl;
    listen [::]:443 ssl;

    ssl_certificate /etc/ssl/certs/example.com.crt;
    ssl_certificate_key /etc/ssl/private/example.com.key;

    server_name 192.168.123.34;

    proxy_redirect           off;
    proxy_set_header         X-Real-IP $remote_addr;
    proxy_set_header         X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header         Host $http_host;

    location / {
            proxy_pass http://127.0.0.1:8080;
    }
}


server {
    listen 80;
    listen [::]:80;

    server_name 192.168.123.34;

    proxy_redirect           off;
    proxy_set_header         X-Real-IP $remote_addr;
    proxy_set_header         X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header         Host $http_host;

    # Only forward this without https to make the single signon work.
    location /sso/index {
            proxy_pass http://127.0.0.1:8080;
    }

    location / {
	    return 302 https://$server_name$request_uri;
    }
}

```

Activate the site
```
cd /etc/nginx/sites-enabled/
sudo rm default
sudo ln -s ../sites-available/tekvideo
sudo systemctl restart nginx.service
```

Now requests to [http://192.168.123.34] are forwarded to [https://192.168.123.34].
Chromium currently displays a warning about an insecure site, which is caused by my use 
of self signed certificates.




#### Some issues where a log of errors were thrown during deployment of the war archieve

[https://forum.forgerock.com/topic/unable-to-start-openam-application-after-deployment-on-apache-tomcat/]






# Installation on the server


Install required packages
```
sudo apt install openjdk-8-jdk tomcat9 nginx postgresql zip mc
```

Installing the grails framework (local for the standard user)
```
cd /home/henrik
curl -s https://get.sdkman.io | bash
source .sdkman/bin/sdkman-init.sh
sdk install grails 3.2.9
```



### Postgresql

Test that postgreqsl works and create two databases.
```
sudo -i -u postgres
psql
```

For the production server, the following is used instead.
```
CREATE USER tekvideo PASSWORD 'secretpassword';
CREATE DATABASE "tekvideo-3" OWNER tekvideo;
\q
```

A suitable password can be generated with the following command
```
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Move database dump to the server from my laptop
```
scp /home/henrik/Nextcloud/2018-09-21psqldump-tekvideo3 henrik@10.0.0.188:/home/henrik
```

Put data into the database from the database dump.
```
sudo -u postgres psql tekvideo-3 < ~/2018-09-21psqldump-tekvideo3
```



### Tekvideo deployment script

Created a new ssh key for github and added it to github.
```
ssh-keygen -t rsa -b 4096 -C "henrikmidtiby@gmail.com"
```

Cloned the git repository recursively
```
git clone --recursive git@github.com:henrikmidtiby/tekvideo_deployment.git
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

Create the file `/home/henrik/.grails/tekvideo-config.properties'.
```
dataSource.username=tekvideo
dataSource.password=secretpassword
```

Point to the grails settings file (which contains the password for the database).
```
grails.config.locations = ["/home/henrik/.grails/tekvideo-config.properties"]
```

Building the frontend for tekvideo.sdu.dk
```
cd tekvideo_deployment/tekvideo.sdu.dk/frontend
./build.sh
```


Delete the default site for tomcat
```
cd /var/lib/tomcat9/webapps
sudo rm -r ROOT 
```


```
cd ~/tekvideo_deployment
./deploy
```
This takes quite a while (~5 min) to complete, so consider to proceed with the ngnix setup.

Wait for a line in the logfile with the message
```
11-May-2019 17:55:17.203 INFO [Catalina-utility-2] 
org.apache.catalina.startup.HostConfig.deployWAR 
Deployment of web application archive 
[/var/lib/tomcat9/webapps/ROOT.war] has finished in [49,630] ms
```

Sometimes I see the following error, it is usually enough to run the 
deploy script again and then it works.
```
13-May-2019 07:55:39.171 SEVERE [Catalina-utility-1] org.apache.catalina.startup.HostConfig.deployWAR Error deploying web application archive [/var/lib/tomcat9/webapps/ROOT.war]
 java.lang.IllegalStateException: Error starting child
	at org.apache.catalina.core.ContainerBase.addChildInternal(ContainerBase.java:716)
```


### Nginx - ssl certificates in place


GGenerate certificate and key file.
```
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/example.com.key -out /etc/ssl/certs/example.com.crt
```
Answer the posed questions with the following answers:
```
-----
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [AU]:DK
State or Province Name (full name) [Some-State]:
Locality Name (eg, city) []:Odense
Organization Name (eg, company) [Internet Widgits Pty Ltd]:SDU
Organizational Unit Name (eg, section) []:
Common Name (e.g. server FQDN or YOUR name) []:Henrik Skov Midtiby
Email Address []:hemi@mmmi.sdu.dk
```


Modify the nginx configuration file.
```
sudo vi /etc/nginx/sites-available/tekvideo
```
Add the following to the file.
```
server {
    listen 443 ssl;
    listen [::]:443 ssl;

    ssl_certificate /etc/ssl/certs/example.com.crt;
    ssl_certificate_key /etc/ssl/private/example.com.key;

    server_name tekvideo.tek.sdu.dk;

    proxy_redirect           off;
    proxy_set_header         X-Real-IP $remote_addr;
    proxy_set_header         X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header         Host $http_host;

    location / {
            proxy_pass http://127.0.0.1:8080;
    }
}


server {
    listen 80;
    listen [::]:80;

    server_name tekvideo.tek.sdu.dk;

    proxy_redirect           off;
    proxy_set_header         X-Real-IP $remote_addr;
    proxy_set_header         X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header         Host $http_host;

    # Only forward this without https to make the single signon work.
    location /sso/index {
            proxy_pass http://127.0.0.1:8080;
    }

    location / {
	    return 302 https://$server_name$request_uri;
    }
}

```

Activate the site
```
cd /etc/nginx/sites-enabled/
sudo rm default
sudo ln -s ../sites-available/tekvideo
sudo systemctl restart nginx.service
```

Now requests to [http://tekvideo.tek.sdu.dk] are forwarded to [https://tekvideo.tek.sdu.dk].
Chromium currently displays a warning about an insecure site, which is caused by my use 
of self signed certificates.


### How to make a dump of the postgresql database

Dumping the database to a file.
```
sudo -u postgres pg_dump tekvideo-3 > 2019-05-13tekvideo.pqsldump.txt
```

Halt the tomcat server
```
sudo service tomcat9 stop
```

Deleting the dabase and recreating it again without any data in it.
```
sudo -i -u postgres
DROP DATABASE "tekvideo-3";
CREATE DATABASE "tekvideo-3" OWNER tekvideo;
```

Fill data into the database again
```
sudo -u postgres psql tekvideo-3 < 2019-05-13tekvideo.pqsldump.txt
```

Start the tomcat server
```
sudo service tomcat9 start
```



### How to get a proper ssl certificate



Generate certificate and key file.
```
sudo openssl req -new -newkey rsa:2048 -nodes -keyout tekvideo.sdu.dk.key -out tekvideo.sdu.dk.csr
```
Answer the posed questions with the following answers:
```
-----
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [AU]:DK
State or Province Name (full name) [Some-State]:
Locality Name (eg, city) []:Odense
Organization Name (eg, company) [Internet Widgits Pty Ltd]:SDU
Organizational Unit Name (eg, section) []:
Common Name (e.g. server FQDN or YOUR name) []:Henrik Skov Midtiby
Email Address []:hemi@mmmi.sdu.dk
```

Send the files `tekvideo.sdu.dk.key` and `tekvideo.sdu.dk.csr` to Thomas Iversen.
Then he will sign them and return a signed key `star_sdu_dk.cer`.
To convert the `cer` file to the `crt` format, use the following command
```
openssl pkcs7 -text -in star_sdu_dk.cer -print_certs -outform PEM -out star_sdu_dk.crt
```

Place the files `star_sdu_dk.crt` and `tekvideo.sdu.dk.key` in the directory `/etx/nginx/ssl` 
and update the references to the ssl certificates in `/etc/nginx/sites-available/tekvideo`.



### Setting up email notifications when there are packages to update on the server

I have followed this guide for setting up cron-apt.
[https://www.debuntu.org/how-to-email-notification-upon-available-package-updates-with-cron-apt/]

Install crop-apt using apt-get.
```
apt-get install cron-apt
```

Modify the configuration file:
```
sudo vi /etc/cron-apt/config.
```
So it contains the following

```
MAILTO="hemi@mmmi.sdu.dk"
MAILON="upgrade"
```

By default it now runs every night at 4.00.
This is specified in the file `/etc/cron.d/cron-apt`.

