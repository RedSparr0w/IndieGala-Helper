var fs = require('fs');


//Make build directories if they dont exist
if (!fs.existsSync('chrome'))
    fs.mkdirSync('chrome');
if (!fs.existsSync('firefox'))
    fs.mkdirSync('firefox');

fs.readdir('./', (err, files) => {
  files.forEach(file => {
    if (file.match(/\.js/) && !file.match(/build\.js/)) {
      fs.readFile(file, 'utf8', function (err, data) {
        if (err)
          return console.log(err);

        fs.writeFile('firefox/' + file, for_firefox(data), 'utf8', function (err) {
           if (err)
             return console.log(err);
        });
        fs.writeFile('chrome/' + file, for_chrome(data), 'utf8', function (err) {
           if (err)
             return console.log(err);
        });
      });
    }
  });
});

function for_chrome (data){
  data = data.replace(/\r\n/g, '\n') //Remove new lines
          .replace(/\/\*FIREFOX\*\/(.|\n)*?\/\*\\FIREFOX\*\/\n?/g, '') //Remove firefox only code
          .replace(/\/\*CHROME\*\/\n?/g, '')  //Remove chrome only code start markers
          .replace(/\/\*\\CHROME\*\/\n?/g, ''); //Remove chrome only code end markers
  return data;
}

function for_firefox (data){
  data = data.replace(/\r\n/g, '\n') //Remove new lines
          .replace(/\/\*CHROME\*\/(.|\n)*?\/\*\\CHROME\*\/\n?/g, '') //Remove chrome only code
          .replace(/\/\*FIREFOX\*\/\n?/g, '')  //Remove firefox only code start markers
          .replace(/\/\*\\FIREFOX\*\/\n?/g, ''); //Remove firefox only code end markers
  return data;
}
