const fs = require('fs');


function foo() {
    fs.readFile('./test.txt', (err, data) => {
      if (err) throw err;
      console.log(data);
    });
    console.log('foo');
}

foo();