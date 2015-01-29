#!/usr/local/bin/node

var program = require('commander');
var grep = require('grep1');
var chalk = require('chalk');

program
    .version('0.0.1')
    .usage('<keywords>')
    .parse(process.argv);

if(!program.args.length) {
    program.help();
} else {
    console.log('Keywords: ' + program.args);   
    grep(['margin', 'src/sass/*']);
}

