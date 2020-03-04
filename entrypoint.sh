#!/bin/sh

CADZIP=https://github.com/digarok/cadius/releases/download/0.0.0/cadius-ubuntu-latest-0.0.0.zip

curl -L $CADZIP -o cadius.zip
unzip -n cadius.zip
mv cadius /usr/bin

cadius createvolume $INPUT_VOLUME_PATH $INPUT_VOLUME_NAME $INPUT_VOLUME_SIZE

if [ "$INPUT_INCLUDE_PRODOS" = "true" ]; then
    apt-get install -y python3
    echo "Grabbing ProDOS 2.4.2"
    curl -k -L https://mirrors.apple2.org.za/ftp.apple.asimov.net/images/masters/prodos/ProDOS_2_4_2.dsk -o ProDOS_2_4_2.dsk
    #git clone https://github.com/digarok/dsk2po.git
    curl -k -L https://raw.githubusercontent.com/digarok/dsk2po/master/dsk2po.py -o dsk2po.py
    echo "WHICH"
    which python
    which python3
    ls /usr/bin
    echo "-----"
    ls /bin
    /usr/bin/python3 dsk2po.py ProDOS_2_4_2.dsk
    cadius extractfile ProDOS_2_4_2.po /PRODOS.2.4.2/PRODOS  .
    cadius extractfile ProDOS_2_4_2.po /PRODOS.2.4.2/BASIC.SYSTEM  .
fi
ls
