#!/bin/sh

CADZIP=https://github.com/digarok/cadius/releases/download/0.0.0/cadius-ubuntu-latest-0.0.0.zip

curl -L $CADZIP -o cadius.zip
unzip -n cadius.zip
mv cadius /usr/bin

if [ "$INPUT_INCLUDE_PRODOS" = "true" ]; then
    echo "Grabbing ProDOS 2.4.2"
    curl -k -L https://mirrors.apple2.org.za/ftp.apple.asimov.net/images/masters/prodos/ProDOS_2_4_2.dsk -o ProDOS_2_4_2.dsk
    echo "Convert DSK to PO"
    curl -k -L https://raw.githubusercontent.com/digarok/dsk2po/master/dsk2po.py -o dsk2po.py
    /usr/bin/python3 dsk2po.py ProDOS_2_4_2.dsk
    cadius extractvolume ProDOS_2_4_2.po .
    echo "ProDOS 2.4.2 files available in ./PRODOS.2.4.2/ :"
    ls ./PRODOS.2.4.2/
fi
ls
