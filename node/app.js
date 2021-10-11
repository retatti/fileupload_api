// server setting
const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;

app.use(cors());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/dist/index.html');
});

app.post('/fileupload', (req, res) => {
    console.log("post request!");
    res.sendFile(__dirname + '/dist/post.html');
})



const server = app.listen(port, function() {
    console.log('server running on port 3000');
});






