const axios = require('axios');
const cheerio = require('cheerio');
const Promise = require('bluebird');

const base = 'https://www.builtinnyc.com';
const config = {
  url: base + '/companies?status=all',
};

let companyMap = new Map();

const getWebsite = (link, name) =>
  axios.get(base + link)
    .then(res => {
      let $ = cheerio.load(res.data);
      let website = $('a', '.field_company_website').attr('href');
      companyMap.set(name, website);
      console.log(companyMap)
    })
    .catch(error => {
      console.log(error);
    });

axios(config)
  .then(response => {
    const $ = cheerio.load(response.data);
    let companyPromises = [];

    $('.company-card').each((i, el) => {
      let name = $(el).find('.title').text();
      let link = $('a', '.wrap-view-page', el).attr('href');
      companyPromises.push(getWebsite(link, name));
    });
    console.log(companyPromises);
    return Promise.all(companyPromises)
      .then(console.log(companyMap));
  })
  .catch(error => {
    console.log(error);
  });

