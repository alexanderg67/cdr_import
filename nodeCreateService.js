var Service = require('node-windows').Service;
var svc = new Service({
    name:'CDR Import Service',
    description: 'CDR Import Service',
    script: 'C:\\Users\\Alex\\Pictures\\cdr_service\\app.js'
} )
svc.on('install',function(){
    svc.start();
  });
  
  svc.install();