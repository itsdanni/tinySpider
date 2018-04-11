
const fs = require('fs');

// joins object properties with a tab as table columns
function stringifyObject(obj) {
  return Object.keys(obj).map(key => obj[key]).join('\t')
}

const formatData = (dataset) => {
  let pageStr = dataset.map(obj => stringifyObject(obj)).join('\n');
  return pageStr + '\n'
}


const exportToFile = (dataset) => {
  fs.appendFile('companyData.txt', formatData(dataset), function(err) {
    if (err) throw err;
    console.log('saved');
  })
}

module.exports = {
  exportToFile
}

