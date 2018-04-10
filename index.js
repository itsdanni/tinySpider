const axios = require('axios');
const cheerio = require('cheerio');
const Promise = require('bluebird');

const base = 'https://www.builtinnyc.com';

let companies = [];

// gets initial data for one page
const loadPage = (page) => axios.get(base + page)
  .then(res => cheerio.load(res.data));

// returns an array of companies with name and link tuples
const getNameLink = ($) => {
  let nameLink = []
  $('.company-card').each((i, el) => {
      let name = $(el).find('.title').text();
      let link = $('a', '.wrap-view-page', el).attr('href');
      if (link !== 'undefined'){
        nameLink.push([name, link]);
      }
    });
  //console.log(nameLink)
  return nameLink;
}

// helper function for getSites
const getSite = (name, link) => axios.get(base + link)
  .then(res => {
    let $ = cheerio.load(res.data);
    let website = $('a', '.field_company_website').attr('href');
    //console.log(website)
    if (website !== 'undefined'){
      let company = new Object()
      company.name = name;
      company.website = website;
      console.log(company)
      companies.push(company)
    }
  })
  .catch(err => console.log(err))

const getSites = (nameLink) =>
  Promise.all(nameLink.map((pair) => getSite(pair[0], pair[1])))

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
      return pages
    })


// crawls a page to get all site addresses
const getPageData = (page) =>
  loadPage('/companies' + page)
  .then($ => getSites((getNameLink($))));

loadPages()
  .then(pages => Promise.all(pages.map((page) => {
    getPageData(page)
  })))
  .then(res => {
    console.log(res)
    console.log(companies)
    return companies;
  })
  .catch(err => console.log(err))

