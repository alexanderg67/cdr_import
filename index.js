const lineByLine = require('n-readlines');
const fs = require('fs')
const sql = require('mssql')
var path = require('path');
let CDR_DIR='C:\\Users\\Alex\\cdr-import\\'
let ARCHIVE_DIR='C:\\Users\\Alex\\cdr-import\\arch\\'
const sqlConfig = {
    user: 'sa',
    password: '12345',
    database: 'testdb',
    server: '127.0.0.1',
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    },
    options: {
        encrypt: false, // for azure
        trustServerCertificate: true // change to true for local dev / self-signed certs
      }
     
  }
  CDR_DIR= path.normalize(CDR_DIR);   
  ARCHIVE_DIR= path.normalize(ARCHIVE_DIR);   
 async function  main() {
  const pool= await sql.connect(sqlConfig)
  await new Promise(resolve => setTimeout(resolve, 5000)); //set delay for sql connect
  const dirarray=fs.readdirSync(CDR_DIR).filter ( filename =>  {
    return  filename.startsWith("cdr_")  
  } )
    console.log('files:',dirarray)
    //got files
    dirarray.forEach( item => {
      const liner = new lineByLine(CDR_DIR+item);
      console.log(item)
      let line;
      let lineNumber = 0;
      while (line = liner.next()) {
        if(lineNumber===0 || lineNumber===1) {
          lineNumber++;
          continue 
        }
         line=line.toString('utf8');
         let arr=line.split(',')
         let cdrRecordType,globalCallID_callManagerId,globalCallID_callId,origLegCallIdentifier,dateTimeOrigination,origNodeId,origSpan,origIpAddr,callingPartyNumber
         cdrRecordType=arr[0]
         globalCallID_callManagerId=arr[1]
         globalCallID_callId=arr[2]
         origLegCallIdentifier=arr[3]
         dateTimeOrigination=arr[4]
         origNodeId=arr[5]
         origSpan=arr[6]
         origIpAddr=arr[7]
         callingPartyNumber=arr[8]
         let query=`insert into cdr   values (${cdrRecordType},${globalCallID_callManagerId},${globalCallID_callId},${origLegCallIdentifier}, ${dateTimeOrigination},${origNodeId},${origSpan},${origIpAddr},${callingPartyNumber})`
        console.log(query)
        let insertRow= async function(query) {
          let result1 = await  pool.request().query(query)
        }
         insertRow(query)
         lineNumber++;
    }
    
    console.log('end of  file',item);
    })

    dirarray.forEach( item => { 
      fs.rename(CDR_DIR+item, ARCHIVE_DIR+item , function (err) {
        if (!err) { console.log('moved',item ) }
      })
    })
    

 }
  

 main()
 
  /*


The CDR and CMR flat files have the following format:
• Line 1—List of field names comma separated
• Line 2—List of field type comma separated
• Line 3—Data comma separated
 */
 
