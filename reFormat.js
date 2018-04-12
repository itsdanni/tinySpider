
/**
 * need to reformat the exported file because spaces were used instead of tabs due to editor settings
 */
const fs = require('fs');
const readline = require('readline');
const numTabs = 2;
const rl = readline.createInterface({
  input: fs.createReadStream('../../compData.txt'),
  crlfDelay: Infinity
})

rl.on('line', line => {
  let count = 0
  for (let char of line) {
    if (char === '\t') count += 1
  }
  //console.log(count)
  let formatLine = line
  // missing columns
  if (count < numTabs) {
    // missing website
    if (line.includes('/company')){
      formatLine += '\t'
    }
    // missing builtinnyc
    else if (line.includes('http')) {
      let arr = formatLine.split('\t')
      let newArr = arr.slice(0, 1).concat([''].concat(arr.slice(1)))
      formatLine = newArr.join('\t')
    }
  }
  formatLine += '\n'
  fs.appendFile('../../editcompData.txt', formatLine, function(err) {
    if (err) throw err;
  })
})


