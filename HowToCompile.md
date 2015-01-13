# How to compile

```
mvn clean compile
```

### Overcoming problems

You may see errors like:

        [WARNING] Could not transfer metadata org.springframework:spring-aop/maven-metadata.xml from/to snapshots
        (https://dev.openclinica.com/artifactory/libs-snapshot): sun.security.validator.ValidatorException:
        PKIX path building failed: sun.security.provider.certpath.SunCertPathBuilderException:
        unable to find valid certification path to requested target

The problem is cause by a certificate that is not recognised by your implementation of Java.

You can use `wget` to download the files manually to ~/.m2/**

