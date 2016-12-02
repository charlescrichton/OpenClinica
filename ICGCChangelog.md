# ICGC Changelog and notes

This is a list of changes and notes. Reading down from top to bottom should give you an idea of the state of this repository and how it got there. Obviously you can look at the commit messages for more detail on individual files.

## 2016-11-22: Create Repository

This repository is based on the [3.12.2 version of OpenClinica](https://github.com/OpenClinica/OpenClinica/tree/3.12.2).

## 2016-11-22: Add ICGC changelog 

Added this changelog to document each variation from the base code.

### Note: Compiling OpenClinica

You need to make sure you have your `JAVA_HOME` variable set.

Generically run the following command line:

``` bash
mvn clean package -Dmaven.test.skip=true -Dmaven.wagon.http.ssl.insecure=true -Dmaven.wagon.http.ssl.allowall=true
```

In the `env/sub` environment run `env/actions/env-compile-openclininca.sh`. See `env/README.md` for more details.

### Note: Running OpenClinica in Docker

See `env/README.md` for more details. 

Run OpenClinica using `dc-clear-openclinica.sh ; dc-start-openclinica.sh` in docker using.

This will bring up OpenClinica at: http://localhost:8080/icgc-med/






