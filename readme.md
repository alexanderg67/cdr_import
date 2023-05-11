# Project Title

Node-service to parse cisco UCM  CDR files

## Description


Cisco UCM exports cdr files to the folder. App runs every 2 minutes , reads cdr files from cdr folder, add to mssql database table and move files to Archive folder \
Using "node-windows" package to run as windows service. 
## Getting Started

### Dependencies

* Tested on windows server 2016,windows 10

### Installing
* Open file app.js 
* Change values for sqlTable ( CDR TABLE_NAME) , CDR_DIR (full path to cdr folder) , ARCHIVE_DIR ( full path to archive folder) , sql hostname, user ,password database in sqlConfig variable 
* Open file nodeCreateService.js and change value on line 5 - full path to app.js and can change service name 
* Run "node nodeCreateService" and windows service will be created, run this windows service \
Logs will be at /project_folder/daemon/ folder