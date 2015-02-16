#!/bin/bash

BASEDIR=$(dirname $0)

if [ "$1" == "go" ]; then
	rsync -avh --delete --exclude "styles.css.map" --exclude "sass" $BASEDIR/build/flats/css/ ~/vhosts/pararchive/taz/Source/pararchive/public/css/
	rsync -avh --delete $BASEDIR/build/flats/images/ ~/vhosts/pararchive/taz/Source/pararchive/public/images/
else
	rsync -avh --dry-run --delete --exclude "css/styles.css.map" --exclude "css/sass" $BASEDIR/build/flats/css/ ~/vhosts/pararchive/taz/Source/pararchive/public/css/
	rsync -avh --dry-run --delete $BASEDIR/build/flats/images/ ~/vhosts/pararchive/taz/Source/pararchive/public/images/
fi
