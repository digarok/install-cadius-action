FROM ubuntu:18.04


# Update
RUN apt-get update


# Install packages
#RUN apt-get -yq install rsync openssh-client
RUN apt-get -yq install unzip curl python3



# Label
LABEL "com.github.actions.name"="Cadius"
LABEL "com.github.actions.description"="For creating and manipulating ProDOS disk images."
LABEL "com.github.actions.icon"="target"
LABEL "com.github.actions.color"="blue"

LABEL "version"="0.0.0"
LABEL "repository"="http://github.com/digarok/cadius-action"
LABEL "homepage"="https://github.com/digarok/cadius-action"
LABEL "maintainer"="Dagen Brock <dagenbrock@gmail.com>"


# Copy entrypoint
ADD entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
