const package= require('../package')

const router= require('./controller')

var os = require('os');
var path = require('path');
var fs= require('fs');
const https = require('https');
const http= require('http');

const express= require('express')
var cookieParser = require('cookie-parser')
var cookieSession = require('cookie-session')

const argv = require('yargs').argv;

var webServer= express();

global.properties= package.config;
global.appRoot = path.resolve(__dirname);


//In case Sandbox goes down on you without consent. teehee
process.env.activateStubbing = (global.properties['activate-stubbing'] && 
                                global.properties['activate-stubbing'] === 'yes') 
                             ||(global.properties['activate-stubbing'] &&
                                global.properties['activate-stubbing'] === 'y')
                             ||(global.properties['activate-stubbing'] &&
                                global.properties['activate-stubbing'] === 'true');


/*----cookie middleware-----*/
webServer.use(cookieSession({
  name: 'fancy-shop-session',
  keys: ['5F8681E18B4EA988E9984E86F36346D2F8D74B051CBE13EF95D9196D776E0A3B',
         '1C009C31E6DCED115571CD9569264279740ABEAD720CB9A270BDE229204BE44C'],
/*
  Switch this set for production!!
*/
  // Cookie Options
  maxAge: 72 * 60 * 60 * 1000, // 72 hours
  secure: false, //true for production
  domain: package.config['allowed-origin']
}));

/*
    Loading App-Server into Web-server as a Middle-Ware
*/
webServer.use(router);


webServer.use(express.static(path.join(__dirname, '../www')));
console.log(JSON.stringify(webServer._router.stack));
/*
    PCF Workaround for NodeJS Applications
*/

var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
            process.env.ADDRESS = address.address;
        }
    }
}

console.log(addresses);

console.log('-- Booting Node App-Server with following config --' + JSON.stringify(package.config))

var httpServer=http.createServer(webServer);

httpServer.listen(package.config.port 
                  || process.env.PORT 
                  || 8080 
                  ,package.config.host 
                  || '0.0.0.0', 
function(){
    console.log('Listening on port %d', httpServer.address().port);
});