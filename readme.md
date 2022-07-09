Description: \
Read cdr files from cdr folder, add to database table and move files to Archive folder \
1)Open file index.js \
2)Type TABLE_NAME , CDR_DIR, ARCHIVE_DIR, user ,pass database in sqlConfig.\
const TABLE_NAME='cdr' \
let CDR_DIR='C:\\Users\\Alex\\Pictures\\cdr-import\\' \
let ARCHIVE_DIR='C:\\Users\\Alex\\Pictures\\cdr-import\\arch\\' \
const sqlConfig = { \
    user: 'sa', 
    password: '12345', 
    database: 'testdb', 
    server: '127.0.0.1',
