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
``
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



