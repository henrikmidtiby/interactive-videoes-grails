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

