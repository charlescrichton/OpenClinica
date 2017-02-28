#!/bin/bash
# This downloads and installs the packages that are missing from various maven repos
# based upon: https://forums.openclinica.com/discussion/5164/setting-up-source-missing-artifacts

mkdir -p ${HOME}/Downloads/Missing-Artifacts
cd ${HOME}/Downloads/Missing-Artifacts

if [ -f "spring-security-oauth-1.0.0.M2.jar" ]
then
	echo "Already downloaded spring-security-oauth-1.0.0.M2.jar"
else
	curl -O http://maven.springframework.org/milestone/org/springframework/security/oauth/spring-security-oauth/1.0.0.M2/spring-security-oauth-1.0.0.M2.jar
	mvn install:install-file -DgroupId=org.springframework.security.oauth -DartifactId=spring-security-oauth -Dversion=1.0.0.M2 -Dpackaging=jar -Dfile=spring-security-oauth-1.0.0.M2.jar -DgeneratePom=true
fi

if [ -f "mockrunner-0.4.2.zip" ]
then
	echo "Already downloaded mockrunner-0.4.2.zip"
else
	#curl -o mockrunner-0.4.2.zip https://sourceforge.net/projects/mockrunner/files/mockrunner/0.4.2/mockrunner-0.4.2.zip/download
	echo "Please manually download using a browser:"
	echo "   https://sourceforge.net/projects/mockrunner/files/mockrunner/0.4.2/mockrunner-0.4.2.zip/download"
	echo "And place file into ${HOME}/Downloads/Missing-Artifacts"
fi

if [ -f "mockrunner-0.4.2.zip" ]
then	 	
	unzip -n mockrunner-0.4.2.zip 
	cd mockrunner-0.4.2/lib/jdk1.5/jee5/
	mvn install:install-file -DgroupId=com.mockrunner.jdk15.jee5 -DartifactId=mockrunner-servlet -Dversion=0.4.2 -Dpackaging=jar -Dfile=mockrunner-servlet.jar -DgeneratePom=true
	mvn install:install-file -DgroupId=com.mockrunner.jdk15.jee5 -DartifactId=mockrunner -Dversion=0.4.2 -Dpackaging=jar -Dfile=mockrunner.jar -DgeneratePom=true
	cd ${HOME}/Downloads/Missing-Artifacts
fi

if [ -f "log4jdbc4-1.2.jar" ]
then
	echo "Already downloaded log4jdbc4-1.2.jar"
else
	curl -o log4jdbc4-1.2.jar https://storage.googleapis.com/google-code-archive-downloads/v2/code.google.com/log4jdbc/log4jdbc4-1.2.jar
	#https://code.google.com/p/log4jdbc/downloads/detail?name=log4jdbc4-1.2.jar&can=2&q= 
	mvn install:install-file -DgroupId=log4jdbc -DartifactId=log4jdbc4 -Dversion=1.2 -Dpackaging=jar -Dfile=log4jdbc4-1.2.jar -DgeneratePom=true
fi


if [ -f "ojdbc14-10g.jar" ]
then
	echo "Already downloaded og4jdbc4-1.2.jar"
else
	curl -o ojdbc14-10g.jar.zip http://www.java2s.com/Code/JarDownload/ojdbc14/ojdbc14-10g.jar.zip
	unzip -n ojdbc14-10g.jar.zip
	# http://www.java2s.com/Code/Jar/o/Downloadojdbc1410gjar.htm
	mvn install:install-file -DgroupId=oracle.ojdbc14 -DartifactId=ojdbc14 -Dversion=10g -Dpackaging=jar -Dfile=ojdbc14-10g.jar -DgeneratePom=true
fi



if [ -f "activation-1.0.2.jar" ]
then
	echo "Already downloaded activation-1.0.2.jar"
else
	curl -o activation-1.0.2.jar  http://developer.jasig.org/repo/content/groups/m2-legacy/javax/activation/activation/1.0.2/activation-1.0.2.jar
	mvn install:install-file -DgroupId=javax.activation -DartifactId=activation -Dversion=1.0.2 -Dpackaging=jar -Dfile=activation-1.0.2.jar -DgeneratePom=true
fi

if [ -f "jmesa-2.4.2.jar" ]
then
	echo "Already downloaded jmesa-2.4.2.jar"
else
	curl -O http://www.hillert.com/maven/repository/org/jmesa/jmesa/2.4.2/jmesa-2.4.2.jar
	mvn install:install-file -DgroupId=org.jmesa -DartifactId=jmesa -Dversion=2.4.2-oc -Dpackaging=jar -Dfile=jmesa-2.4.2.jar -DgeneratePom=true
fi
 


