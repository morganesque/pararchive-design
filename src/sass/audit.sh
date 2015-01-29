#!/bin/sh
grep -nr '^[^\$@].*\:.*;$' * \
	--include="*\.scss" \
	| awk {'print $2 $3 $4 "\t\t\t" $1'} \
	| sort >  audit.css
