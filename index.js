const axios = require('axios');
const cheerio = require('cheerio');
const Promise = require('bluebird');

const base = 'https://www.builtinnyc.com';

const companyMap = new Map();

// gets initial data for one page
const loadPage = (page) => axios.get(base + page)
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
    console.log(website)
    companyMap.set(name, website);
  })

const getSitePromises = (nameLink) =>
  nameLink.map((pair) => getSite(pair[0], pair[1]))

// finds all available page links
const loadPages = () =>
  loadPage('/companies?status=all')
    .then($ => {
      let pages = []
      $('a', '.pager__items').each((i, el) => {
        let page = $(el).attr('href')
        pages.push(page)
      })
      // last page is redundant
      pages.pop()
      console.log(pages)
      return pages
    })


// crawls a page to get all site addresses
const getPageData = (page) =>
  loadPage('/companies' + page)
  .then($ => getSitePromises((getNameLink($))))

loadPages()
  .then(pages => Promise.all(pages.map((page) => getPageData(page))))
  .then(console.log(companyMap))
  .catch(err => console.log(err))

