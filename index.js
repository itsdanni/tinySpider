const axios = require('axios');
const cheerio = require('cheerio');
const Promise = require('bluebird');
const exportToFile = require('./export').exportToFile;

const base = 'https://www.builtinnyc.com';

// constructor function for company data object
function Company(name, builtInNYC, website){
  this.name = name;
  this.builtInNYC = builtInNYC;
  this.website = website;
}
function getName ($, el) {
  return $(el).find('.title').text();
}
function getBuiltInNYC ($, el) {
  return $('a', '.wrap-view-page', el).attr('href'); // /company/company.com
}
function getWebsite ($) {
  return $('a', '.field_company_website').attr('href');
}
// asynchronously get cheerified data on the specified link
const cheerifiyAsync = (link) =>
  axios.get(link)
  .then(res => cheerio.load(res.data))
  .catch(err => console.log('error getting page ' + link + err))

// returns a company object
function makeCompanyPromise (name, builtInNYC) {
  return cheerifiyAsync(base + builtInNYC)
  .then(companyData => {
    let website = getWebsite(companyData)
    //console.log(website)
    let company = new Company(name, builtInNYC, website)
    return company;
  })
  .catch(err => console.log(err));
}

// returns an array of company promises on a page
function companyPromisesPerPage ($) {
  // $ is the cheerified data on one page
  let companyPromises = [];
  $('.company-card').each((i, el) => {
    let name = getName($, el);
    let builtInNYC = getBuiltInNYC($, el);
    let companyPromise = makeCompanyPromise(name, builtInNYC);
    companyPromises.push(companyPromise);
  });
  return companyPromises;
}

// creates an array containing integers from [start, end)
function createArr (start, end) {
  let arr = [];
  for (let i = start; i < end; i++) {
    arr.push(i);
  }
  return arr;
}
// https://www.builtinnyc.com/companies?status=all&page=138
function getDataFromAllPages(start, end) {
  let arr = createArr(start, end)
  arr.forEach(i => {
    cheerifiyAsync(base + `/companies?status=all&page=${i}`)
      .then($ => companyPromisesPerPage($))
      .then(companyPromises => Promise.all(companyPromises))
      .then(companies => exportToFile(companies, i))
      .catch(err => console.log('error loading page ' + i + err))
  });
}

getDataFromAllPages(14, 15);
