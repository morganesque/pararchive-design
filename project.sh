#!/bin/bash

# This is needed to enable a easily tabable 
# open command for the project file. There's 
# always a workspace file created so tab always
# judders when attempting to complete and creating
# a sym-link doesn't work before sublime just opens
# the sym-link instead of the target file.

# open the project file with sublime text
subl flats.sublime-project
