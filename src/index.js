'use strict'

import Crawler from './Crawler';
import MongoSaver from './MongoSaver';
import 'dotenv/config';

const SORT_TYPE_ENUM = {
    random: 'random',
    new: 'novo',
    approve: 'oprost',
    disapprove: 'osuda',
    top: 'top',
    popular: 'popularno',
};

async function main () {
    const crawler = new Crawler();
    const crawlerConfig = {
        urlBase: process.env.URL_BASE || 'http://ispovesti.com/sort',
        sortType: SORT_TYPE_ENUM[process.env.SORT_TYPE || 'new'],
        fromPage: process.env.FROM_PAGE ? parseInt(process.env.FROM_PAGE) : 1,
        pageLimit: process.env.PAGE_LIMIT ? parseInt(process.env.PAGE_LIMIT) : 100,
        waitTime: process.env.WAIT_TIME ? parseInt(process.env.WAIT_TIME) : 500, //time in ms
    };

    const mongoDbConfig = {
        host: process.env.DB_HOST || 'mongodb://localhost',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 27017,
        dbName: process.env.DB_NAME || 'ispovesticom_crawler',
        collectionName: process.env.DB_COLLECTION || 'confessions',
    };
    const mongoSaver = new MongoSaver(mongoDbConfig);

    await mongoSaver.open();

    console.log('\r\n\r\n[INFO] Process started with params : ');

    console.log(`\tURL         : ${crawlerConfig.urlBase}/${crawlerConfig.sortType}`);
    console.log(`\tFirst page  : ${crawlerConfig.fromPage}`);
    console.log(`\tLast page   : ${crawlerConfig.fromPage + crawlerConfig.pageLimit - 1}`);
    console.log('\r\n');
    console.log(`\tDB_HOST          : ${mongoDbConfig.host}`);
    console.log(`\tDB_PORT          : ${mongoDbConfig.port}`);
    console.log(`\tDB_NAME          : ${mongoDbConfig.dbName}`);
    console.log(`\tDB_COLLECTION    : ${mongoDbConfig.collectionName}`);
    console.log('\r\n');

    //Temporary solution for saving results after every crawled page
    const startIndex = crawlerConfig.fromPage;
    const endIndex = crawlerConfig.fromPage + crawlerConfig.pageLimit;
    for (let i = startIndex; i < endIndex; i++) {
        crawlerConfig.fromPage = i;
        crawlerConfig.pageLimit = 1;
        const result = await crawler.crawl(crawlerConfig);
        console.log('[INFO] Saving results ...');

        if (result){
            try{
                await mongoSaver.save(result);
            }catch (error) {
                console.log('[ERROR] ', error);
                await mongoSaver.close();
                process.exit(-1);
            }
        }
    }
    await mongoSaver.close();
}

main()
    .then(() => {
        console.log('[INFO] Process finished successfully');
    })
    .catch((error) => {
        console.error('[ERROR] ', error);
    });
