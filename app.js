
const schedule = require('node-schedule');
const nReadlines = require('n-readlines');
const sql = require('mssql')
const fs = require('fs')
const config=require('./config.json')


async function main() {
  
  try {
     
    await sql.connect(config.sqlConfig) 
    await sql.query(`select top 1 * from  ${config.sqlTable} ` ) // test sql connection by query
    console.log(new Date().toString().slice(0,24) +' Start.Connected to SQL')
    let filesOlder=[];  // array stores list of cdr files modified 30 seconds ago
    const dirArray=fs.readdirSync(config.CDR_DIR).filter ( filename =>  {
        return  filename.startsWith("cdr_")  
      } )
     
    dirArray.forEach( file => {
        const isOlder=fs.statSync(config.CDR_DIR+file).mtimeMs  < Date.now() - 30000
        if (isOlder)
        filesOlder.push(file)
    })
     
    if (filesOlder.length <1)
console.log(new Date().toString().slice(0,24)+ ' No new cdr files') 
    if(filesOlder.length > 30)
filesOlder.length=30   //Every run we take only 30 files to handle
 
for ( let filename of filesOlder ) {
console.log(new Date().toString().slice(0,24)+` Opening file ${filename}:`)
const broadbandLines = new nReadlines(config.CDR_DIR+filename);
const insert=async ( arr) => {
  try {
    let dateTimeOrigination,dateTimeConnect,dateTimeDisconnect
    dateTimeOrigination = new Date(arr[4] * 1000);
    dateTimeOrigination=dateTimeOrigination.toISOString().slice(0, 19).replace('T', ' ') // convert from unix time to datetime string
    dateTimeOrigination=`'${dateTimeOrigination}'` // wrap in quotes for sql query
    if( arr[47]=='0' || arr[47]=='') {
    dateTimeConnect='NULL'
    }else{
    dateTimeConnect = new Date(arr[47] * 1000);
    dateTimeConnect=dateTimeConnect.toISOString().slice(0, 19).replace('T', ' ') 
    dateTimeConnect=`'${dateTimeConnect}'`  // wrap in quotes for sql query
    }
    
    dateTimeDisconnect = new Date(arr[48] * 1000);
    dateTimeDisconnect=dateTimeDisconnect.toISOString().slice(0, 19).replace('T', ' ') 
    dateTimeDisconnect=`'${dateTimeDisconnect}'`  // wrap in quotes for sql query

    for ( let i=0;i<arr.length;i++) { // Empty values replace with NULL
      if(arr[i]=='' )
       arr[i]='NULL'
       else
       arr[i]=`'${arr[i]}'`
  }
 
  
       let query=`insert into ${config.sqlTable} VALUES ( ${arr[0]},${arr[1]},${arr[2]},${arr[3]},${arr[4]},${arr[5]},${arr[6]},${arr[7]},
        ${arr[8]},${arr[9]},${arr[10]},${arr[11]},${arr[12]},${arr[13]},${arr[14]},${arr[15]},${arr[16]},${arr[17]},${arr[18]},${arr[19]},
        ${arr[20]},${arr[21]},${arr[22]},${arr[23]},${arr[24]},${arr[25]},${arr[26]},${arr[27]},${arr[28]},${arr[29]},${arr[30]},${arr[31]},
        ${arr[32]},${arr[33]},${arr[34]},${arr[35]},${arr[36]},${arr[37]},${arr[38]},${arr[39]},${arr[40]},${arr[41]},${arr[42]},${arr[43]},
        ${arr[44]},${arr[45]},${arr[46]},${arr[47]},${arr[48]},${arr[49]},${arr[50]},${arr[51]},${arr[52]},${arr[53]},${arr[54]},${arr[55]},
        ${arr[56]},${arr[57]},${arr[58]},${arr[59]},${arr[60]},${arr[61]},${arr[62]},${arr[63]},${arr[64]},${arr[65]},${arr[66]},${arr[67]},
        ${arr[68]},${arr[69]},${arr[70]},${arr[71]},${arr[72]},${arr[73]},${arr[74]},${arr[75]},${arr[76]},${arr[77]},${arr[78]},${arr[79]},
        ${arr[80]},${arr[81]},${arr[82]},${arr[83]},${arr[84]},${arr[85]},${arr[86]},${arr[87]},${arr[88]},${arr[89]},${arr[90]},${arr[91]},
        ${arr[92]},${arr[93]},${arr[94]},${arr[95]},${arr[96]},${arr[97]},${arr[98]},${arr[99]},${arr[100]},${arr[101]},${arr[102]},${arr[103]},
        ${arr[104]},${arr[105]},${arr[106]},${arr[107]},${arr[108]},${arr[109]},${arr[110]},${arr[111]},${arr[112]},${arr[113]},${arr[114]},${arr[115]},
        ${arr[116]},${arr[117]},${arr[118]},${arr[119]},${arr[120]},${arr[121]},${arr[122]},${arr[123]},${arr[124]},${arr[125]},${arr[126]},${arr[127]},
        ${arr[128]},${arr[129]},${arr[130]},${arr[131]},${arr[132]}, ${dateTimeOrigination}, ${dateTimeConnect} , ${dateTimeDisconnect} )`
       
      const result = await sql.query(query)
       
     
  } catch (err) {
    console.log(new Date().toString().slice(0,24)+' ERROR SQL INSERT:'+err.name+err.message)
  }
}
let line;
let lineNumber = 1;
while (line = broadbandLines.next()) {
        
  if(lineNumber===1 || lineNumber===2) { // skip 1 and 2 lines without calls
      lineNumber++;
      continue 
    }
    line=line.toString('utf8');
    line = line.replace(/"/g, '')
   let arrCall=line.split(',') // array with  parsed values on one line
   let callingPartyNumber =arrCall[8]
   let originalCalledPartyNumber= arrCall[29]
    
  insert(arrCall);
  
  lineNumber++;
}
console.log('Handled file '+filename+'. Inserted rows:'+(lineNumber-3));
await new Promise(resolve => setTimeout(resolve, 800));  //Timeout after one file to reduce disk usage

}

      await new Promise(resolve => setTimeout(resolve, 40000)); // after async inserts move files to arch folder
      if (filesOlder.length >0)
      console.log(new Date().toString().slice(0,24)+ ' Moving files to archive folder:') 
      filesOlder.forEach( filename => { 
        fs.rename(config.CDR_DIR+filename, config.ARCHIVE_DIR+filename , function (err) {
          if (err) {
            console.log(new Date().toString().slice(0,24)+ ` Error moving file ${filename}`);
             
         }else {
            console.log(new Date().toString().slice(0,24)+ ` File ${filename} was moved`);
         }
        })
      })
    }catch(err){
    console.log(new Date().toString().slice(0,24) + ' EXIT. ERROR SQL CONNECTION: '+err.message)
     
    }



    





}
// run every 2 minutes
const job = schedule.scheduleJob('*/2 * * * *',  main);