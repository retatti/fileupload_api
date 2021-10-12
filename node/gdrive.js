const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const { create } = require('domain');
const { json } = require('express');

// If modifying these scopes, delete token.json.
// const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
// const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const SCOPES = ['https://www.googleapis.com/auth/drive'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Drive API.

  // authorize(JSON.parse(content), listFiles);
  // authorize(JSON.parse(content), createFile);
  fileupload(content);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}




/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
  const drive = google.drive({version: 'v3', auth});
  drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const files = res.data.files;
    console.log(files)
    if (files.length) {
      console.log('Files:');
      files.map((file) => {
        console.log(`${file.name} (${file.id})`);
      });
    } else {
      console.log('No files found.');
    }
  });
}


/**
 * Upload file.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function createFile(auth) {
    const drive = google.drive({version: 'v3', auth});

    var fileMetadata = {
      'name': 'test2.txt'
    };
    var media = {
      mimeType: 'plain/text',
      body: fs.createReadStream('test2.txt')
    };
    drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id'
    }, function (err, res) {
      // console.log(res);
      if (err) {
        // Handle error
        console.error(err);
      } else {
        console.log('File Id: ', res.data.id);
      }
    });
  }


// ----------------------------------------------------------------------------


/**
 * Create an OAuth2 client with the given credentials
 * @param {Object} credentials The authorization client credentials.
 * @return {google.auth.OAuth2}
 */
function authorize2(credentials) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  try{
    const token = fs.readFileSync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  }
  catch(e) {
    // TODO: Implement error handling
    console.log('Error:' + e);
    // return getAccessToken2(oAuth2Client);
  }
  // fs.readFile(TOKEN_PATH,  (err, token) => {
  //   if (err) return getAccessToken(oAuth2Client, callback);
  //   oAuth2Client.setCredentials(JSON.parse(token));
  //   return oAuth2Client;
  // });
}



/**
 * Get and store new token after prompting for user authorization
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @return {google.auth.OAuth2} 
 */
function getAccessToken2(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, async (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      await oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      return oAuth2Client;
    });
  });
}


/**
 * Upload file.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @return {String} id File id of uploaded file.
 */
function createFile2(auth, fname, ftype) {
  const drive = google.drive({version: 'v3', auth});

  let id;

  var fileMetadata = {
    'name': fname
  };
  var media = {
    mimeType: ftype,
    body: fs.createReadStream(fname)
  };
  drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id'
  }, function (err, res) {
    if (err) {
      // Handle error
      console.error(err);
    } else {
      console.log('File Id: ', res.data.id);
      id = res.data.id;
    }
  });
}

function fileupload(content) {

  // Post PDF file

  const fname = 'test.txt';
  const ftype = 'plain/text';

  // authorize(JSON.parse(content), listFiles);
  // return;

  // Get authorize info
  let auth = authorize2(JSON.parse(content));
  // console.log(auth);
  
  listFiles(auth);
  
  // Upload PDF file to google drive
  let fid = createFile2(auth, fname, ftype);
  console.log(fid);
  return;

  // Get share link of uploaded PDF file

  // Delete PDF file on the server

  // Return shrare link

  // authorize(JSON.parse(content), listFiles);
  // authorize(JSON.parse(content), createFile);

}