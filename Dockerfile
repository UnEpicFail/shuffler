FROM ubuntu:14.04

#install nodeJs, npm and MongoDB
RUN apt-get -y update && apt-get install -y nodejs && sudo apt-get install -y npm && apt-get install -y mongodb && apt-get install -y nano

#install global supervisor
RUN npm install supervisor -g

#link node folder (else supervisor do not work)
RUN ln -s /usr/bin/nodejs /usr/bin/node

#run bush
CMD bash
