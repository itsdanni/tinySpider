const axios = require('axios');
const cheerio = require('cheerio');
const Promise = require('bluebird');
const base = 'https://www.builtinnyc.com';
const companies = [];

// prepopulate page links to crawl
function fillPageLinks () {
  let pageLinks = []
  for (let i = 0; i < 139; i++) {
    pageLinks.push(`/companies?status=all&page=${i}`)
  }
  return pageLinks;
}
// creates a custom axios instance per page, returns an array of page axios
function makeAxios (pageLinks) {
  return pageLinks.map(link =>
    axios.create({
      url: base + link,
      timeout: 10000
    }));
  }

function getPagesAsync (pageAxios) {
  return Promise.all(pageAxios.map(pageAxio => {
    pageAxio()
    .then(res => {
      let $ = cheerio.load(res.data);
      let pageList = []
      $('.company-card').each((i, el) => {
        let name = $(el).find('.title').text();
        let locallink = $('a', '.wrap-view-page', el).attr('href');
        pageList.push([name, locallink]);
      });

    })
  }))
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

function getAllData () {
  let pageLinks = fillPageLinks()


}


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

//Here you specify the export structure
const specification = {
  name: { // <- the key should match the actual data key
    displayName: 'Name', // <- Here you specify the column header
  },
  website: {
    displayName: 'Website',
  },
  builtInNYC: {
    displayName: 'builtInNYC',
  }
}
