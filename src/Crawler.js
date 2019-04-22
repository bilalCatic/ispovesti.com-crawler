'use strict'

const fetch = require ('node-fetch');
const cheerio = require ('cheerio');
const moment = require ('moment');

const formatTime = (timeString) => {
    if (!timeString){
        return 0;
    }
    if (timeString.length > 3) {
        try{
            return moment(timeString).unix();
        }catch (error) {
            console.log('[ERROR] Parsing long time string failed', error);
            return 0;
        }
    }

    try {
        const unitOfTime = timeString[timeString.length -1]; // This will be either 'm' for minutes or 'h' for hours
        const time = parseInt(timeString);

        return moment().subtract(time, unitOfTime).unix();
    } catch(error) {
        console.log('[ERROR] Parsing short time string failed', error);
        return 0;
    }
};

const formatText = (text) => {
    const slashedCharactersRegex = /[\r\n\t]/gmiu;
    return text.replace(slashedCharactersRegex, '');
};

export default class Crawler {
    async crawlPage (url){
        console.log('[INFO] Fetching data from : ', url);
        const res = await fetch (url);
        const body = await res.text ();
        const $ = cheerio.load (body);

        const resultsFromPage = [];

        for (let i = 1; i <= 11; i++) {
            if (i === 6){
                ++i;
            }

            const confessionId = parseInt($ (`#content > div:nth-child(${i}) > div.confession-top-content > a`).text().substring(1));
            if (!confessionId){
                continue;
            }
            const content = $ (`#content > div:nth-child(${i}) > div.confession-text`).text ();
            const time = $ (`#content > div:nth-child(${i}) > div.confession-top-content > div`).text();
            const numberOfApprovals = $ (`#approve-count-${confessionId}`).text();
            const numberOfDissaprovals = $ (`#disapprove-count-${confessionId}`).text();
            const numberOfComments = $ (`#content > div:nth-child(${i}) > div.confession-data > div.confession-values > a`).text();

            const confession = {
                id: confessionId,
                content: formatText(content),
                time: formatTime(time),
                numberOfApprovals,
                numberOfDissaprovals,
                numberOfComments,
            };
            resultsFromPage.push(confession);
        }
        return resultsFromPage;
    }

    async sleep (time) {
        return new Promise (resolve => setTimeout(resolve, time));
    }

    async crawl (config) {
        const startIndex = config.fromPage;
        const endIndex = config.fromPage + config.pageLimit;
        const results = [];

        for (let i = startIndex; i < endIndex; i++){
            const url = `${config.urlBase}/${config.sortType}/${i}`;

            const resultsFromOnePage = await this.crawlPage(url);
            if (resultsFromOnePage) {
                results.push(...resultsFromOnePage);
            }

            await this.sleep(config.waitTime);
        }

        return results;
    }
}
