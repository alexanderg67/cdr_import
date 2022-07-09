const lineByLine = require('n-readlines');
const fs = require('fs')
const sql = require('mssql')
var path = require('path');
const { dirname } = require('path');
const logger = require('logger').createLogger('cdrService.log');
logger.setLevel('debug');
const TABLE_NAME='cdr'
let CDR_DIR='C:\\Users\\Alex\\Pictures\\cdr-import\\'
let ARCHIVE_DIR='C:\\Users\\Alex\\Pictures\\cdr-import\\arch\\'
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
  
  try {
  const pool= await sql.connect(sqlConfig)
  
   
  logger.info('SQL:Successfully connected to  ',sqlConfig.server);
  await new Promise(resolve => setTimeout(resolve, 5000)); //set delay for sql connect
  const dirArray=fs.readdirSync(CDR_DIR).filter ( filename =>  {
    return  filename.startsWith("cdr_")  
  } )
  if (dirArray.length===0) {
    logger.debug('No cdr files. Exiting');
    process.exit(0)
  }
    //console.log('files:',dirArray)
    logger.debug('CDR file list:', dirArray);
    
    dirArray.forEach( item => {
       
       
      const liner = new lineByLine(CDR_DIR+item);
      logger.debug('Reading file:',item);
      let line;
      let lineNumber = 0;
      while (line = liner.next()) {
        if(lineNumber===0 || lineNumber===1) { // skip 1 and 2 lines with fields name and types
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
         let query=`insert into ${TABLE_NAME}   values (${cdrRecordType},${globalCallID_callManagerId},${globalCallID_callId},${origLegCallIdentifier}, ${dateTimeOrigination},${origNodeId},${origSpan},${origIpAddr},${callingPartyNumber})`
        //console.log(query)
        let insertRow= async function(query) {
         try {
          let result1 = await  pool.request().query(query)
         }catch(err) {
           
            logger.debug(`SQL Insert Error: ${err.name} ${err.message}`);
            process.exit(1)
         } 
           
        }
        
         insertRow(query)
         lineNumber++;
    }
    logger.debug(`File ${item} handled`);
      
    })
    await new Promise(resolve => setTimeout(resolve, 1500));
    logger.debug('Moving CDR  files to Archive  folder');
    dirArray.forEach( item => { 
      fs.rename(CDR_DIR+item, ARCHIVE_DIR+item , function (err) {
        if (err) {
          logger.debug(`Error moving file ${item}`);
           
       }else {
          logger.debug(`File ${item} was moved`);
       }
      })
    })
    await new Promise(resolve => setTimeout(resolve, 2000));  
    logger.debug('All Files are handled');
    
  }catch(err) {
    logger.info('Critical error:',err);
    await new Promise(resolve => setTimeout(resolve, 1000));
    process.exit(1)
  }
 }
  

 main()

 
  /*


The CDR and CMR flat files have the following format:
• Line 1—List of field names comma separated
• Line 2—List of field type comma separated
• Line 3—Data comma separated
 */
 
