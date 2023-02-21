Description: \
Tested on windows server 2016,windows 10 \
Cisco UCM  exports cdr files to the folder. App runs every 2 minutes , reads cdr files from cdr folder, add to mssql database table and move files to Archive folder \
Using  "node-windows" package to run as windows service. \
1)Open file app.js \
2)Change values for sqlTable ( CDR TABLE_NAME) , CDR_DIR (full path to cdr folder) , ARCHIVE_DIR ( full path to archive folder) , sql hostname, user ,password database in sqlConfig variable \
3) Open file nodeCreateService.js and change value on line 5 - full path to app.js and specify service name \ 

4)Run "node nodeCreateService" and win service created, run windows service \
Logs will be at /project_folder/daemon/ folder
