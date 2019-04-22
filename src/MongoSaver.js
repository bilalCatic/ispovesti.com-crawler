import MongoClient from 'mongodb';

export default class MongoSaver {
    constructor(config) {
        this.url = `${config.host}:${config.port}`;
        this.collectionName = config.collectionName;
        this.dbName = config.dbName;
    }

    connect() {
        let saver = this;
        return new Promise((resolve, reject) => {
            if (!saver.ready) {
                MongoClient.connect(saver.url, (error, client) => {
                    saver.client = client;
                    if (error) {
                        console.log('[ERROR] Unable to connect to the mongoDB server ', error);
                        reject(error);
                    } else {
                        console.log('[INFO] Connected to database');
                        saver.db = client.db(saver.dbName);
                        saver.collection = saver.db.collection(saver.collectionName);
                        saver.ready = true;
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    save(results) {
        let resultsForMongo = Object.keys(results).map((key) => {
            return results[key]
        });

        for(const doc of resultsForMongo) {
            this.collection.update({ id: doc.id }, doc, { upsert: true });
        }
    }

    async close() {
        try {
            //Close connection
            await this.disconnect();
        } catch (error) {
            console.log("[ERROR] Error closing connection", error);
        }
    }

    async disconnect() {
        return new Promise((resolve, reject) => {
            this.client.close();
            resolve();
        });
    }

    async open() {
        await this.connect();
    }

}
