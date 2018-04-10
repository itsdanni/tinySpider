const axios = require('axios');
const cheerio = require('cheerio');
const Promise = require('bluebird');

const base = 'https://www.builtinnyc.com';
const config = {
  url: base + '/companies?status=all',
};

const companyMap = new Map();

const getAllCompany = () => axios(config)
  .then(res => cheerio.load(res.data));

// returns an array of companies with name and link tuples
const getNameLink = ($) => {
  let nameLink = []
  $('.company-card').each((i, el) => {
      let name = $(el).find('.title').text();
      let link = $('a', '.wrap-view-page', el).attr('href');
      nameLink.push([name, link]);
    });
  return nameLink;
}

// helper function for getSitePromises
const getSite = (name, link) => axios.get(base + link)
  .then(res => {
    let $ = cheerio.load(res.data);
    let website = $('a', '.field_company_website').attr('href');
    companyMap.set(name, website);
  })

const getSitePromises = (nameLink) =>
  nameLink.map((pair) => getSite(pair[0], pair[1]))

// gets company info on one page, returns a cheerio object
// getAllCompany()
//   .then($ => Promise.all(getSitePromises((getNameLink($)))))
//   .then(res => console.log(companyMap))
//   .catch(err => console.log(err))

getAllCompany().then($ => {
  let pages = []
  $('a', '.pager__items').each((i, el) => {
    let page = $(el).attr('href')
    console.log(page)
    pages.push(page)
  })

})
