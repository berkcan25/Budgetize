const axios = require('axios');
const express = require("express");
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const scraperRouter = express.Router();

scraperRouter.get("/message", (req, res) => {
    res.json({ message: "Hello from server!" });
});

//Find stores
// async function aldiPriceScraper() {
//     const url = "https://stores.aldi.us/stores";
//     const result = [];
//     try {
//         const response = await axios.get(url);
//         const html_data = response.data;
//         // console.log(html_data); 
//         const $ = cheerio.load(html_data);
//         // console.log($.html());
//         const searchBox = $('html#yext-html body#yext-Text main#main.Main div.Main-content div#js-locator.Locator.Locator--dill.Locator--initial div.Locator-content div.Locator-contentWrap.js-locator-contentWrap div.Locator-searchWrapper form#search-form.search.Locator-form div.Locator-searchBar.GoogleMapsConsentModal-wrapper input#q.search-input.Locator-input.js-locator-input.js-google-maps-locator-input'); 
//         console.log(searchBox);

//         const inputAttributes = searchBox.attr();
//         console.log("Input Attributes:", inputAttributes);

//     //   const keys = ["Title","Description","Price"];
//     //   const selectedElem = ".views-infinite-scroll-content-wrapper > .row > .col-6 > .product-7 > .product-body"

//     //   $(selectedElem).each((parentIndex, parentElem) => {
//     //     let keyIndex = 0;
//     //     const data = {};
//     //     if (parentIndex) {
//     //       $(parentElem)
//     //       .children()
//     //       .each((childId, childElem) => {
//     //         const value = $(childElem).text();
//     //           if (value) {
//     //             data[keys[keyIndex]] = value;
//     //             keyIndex++;
//     //           }
//     //         });
//     //       result.push(data);
//     //     }
//     //   });
//     }
//     catch(error) {
//         console.error("Error fetching data:", error);
//     }
//     return result;
//   }
// console.log(aldiPriceScraper())

async function aldiPriceScraper() {
    const url = "https://stores.aldi.us/stores";
    const result = [];
    let browser;

    try {
        // Launch Puppeteer
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Extract the input element using Puppeteer
        const searchBox = await page.$('#q');

        if (searchBox) {
            // Log the HTML of the input element
            // const outerHTML = await page.evaluate(el => el.outerHTML, searchBox);
            // console.log("Outer HTML:", outerHTML);

            // // Extract and log the attributes of the input element
            // const inputAttributes = await page.evaluate(el => {
            //     const attributes = {};
            //     for (let attr of el.attributes) {
            //         attributes[attr.name] = attr.value;
            //     }
            //     return attributes;
            // }, searchBox);
            // console.log("Input Attributes:", inputAttributes);
            let inputText = "Atlanta"
            await page.type('#q', inputText);
            await page.click('button[type="submit"]');

            await page.waitForSelector('.ResultList', { visible: true, timeout: 100000 });
            console.log("ResultList found")
            // const orderedListItems = await page.$$eval('ol > li', items => {
            //     return items.map(item => item.innerText);
            // });
    
            // Log the extracted list items
            // console.log("Ordered List Items:", orderedListItems);

        } else {
            console.log("Input element not found");
        }


    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }

    return result;
}

// Run the scraper function and log the result
aldiPriceScraper().then(result => console.log(result));

// Export the router
module.exports = scraperRouter;