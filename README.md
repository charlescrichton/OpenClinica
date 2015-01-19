# Welcome!

OpenClinica is an open source software for Electronic Data Capture (EDC) and Clinical Data Management (CDM) used to optimize clinical trial workflow in a smart and secure fashion. Use OpenClinica to:

- Build studies
- Create eCRFs
- Design rules/edit checks
- Schedule patient visits 
- Capture eCRF data from study sites via the web
- Monitor and manage clinical data
- Audit trails and electronic signatures
- Role-based access controls
- Import/Export Data
- Extract data for analysis and reporting
- and much more!

## Getting Started

- [System requirements](https://docs.openclinica.com/installation/system-requirements)
- [Report an issue](https://jira.openclinica.com/)
- [Release notes](https://docs.openclinica.com/release-notes)
- [Extensions/Contributions](https://community.openclinica.com/extensions)


## Compiling

### Using maven

```
mvn clean install -Dmaven.test.skip=true
```

### SSL Error on Mac OS X when compiling

To overcome the following error on a MAC:

```
 sun.security.validator.ValidatorException: PKIX path building failed: sun.security.provider.certpath.SunCertPathBuilderException: unable to find valid certification path to requested target
```

Enter the following which adds the `dev.openclinica.com` SSL certificate to be recognised by Java.

```bash
echo -n | openssl s_client -connect dev.openclinica.com:443 | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > /tmp/dev.openclinica.cert
export JAVA_HOME=`/usr/libexec/java_home -v 1.7`
sudo echo $JAVA_HOME
sudo keytool -keystore $JAVA_HOME/jre/lib/security/cacerts -import -alias dev.openclinica.com -file /tmp/dev.openclinica.cert
```

* When asked for the `keystore password:` use  `changeit`.
* When asked if you `trust this certificate:` answer `yes`.



## Request a feature

To request a feature please submit a ticket on [Jira](https://jira.openclinica.com/) or start a discussion on the [OpenClinica Forum](http://forums.openclinica.com).

##Screenshots
![Imgur](http://i.imgur.com/ACXj3L7.jpg "Home screen") 
##![Imgur](http://i.imgur.com/DqHQ05Z.jpg "Subject Matrix")



## License

[GNU LGPL license](https://www.openclinica.com/gnu-lgpl-open-source-license)

