
const fs = require('fs');

// export to excel specification
// Here you specify the export structure
// const specification = {
//   name: { // <- the key should match the actual data key
//     displayName: 'Name', // <- Here you specify the column header
//   },
//   website: {
//     displayName: 'Website',
//   },
//   builtInNYC: {
//     displayName: 'builtInNYC',
//   }
// }

// const generateReport = (dataset) => {
//   excel.buildExport(
//   [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
//     {
//       name: 'Tech company data', // <- Specify sheet name (optional)
//       specification: specification, // <- Report specification
//       data: dataset // <-- Report data
//     }
//   ]);
// }

const exportToFile = (dataset) => {
  fs.appendFile('techCompanyData.txt', dataset, function(err) {
    if (err) throw err;
    console.log('saved');
  })
}

module.exports = {
  exportToFile
}

