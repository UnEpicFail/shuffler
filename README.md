# shuffler


#Docker 
#build
docker build -t <docker-name> .

#run
docker run -v </full/pass/to/host/folder>:</full/pass/to/mount/folder> -i -t <docker-name>

#stop all
docker rm $(docker ps -aq)

#remove
docker rmi <docker-name>
