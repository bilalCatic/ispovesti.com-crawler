# Crawler for `ispovesti.com` web page
This is my experimental project for data mining course. 
Crawler is used to obtain big collection of textual data with some 
additional informations related to user posts (confessions).

One post (confession) is described as object 

`{  
    id: number,   
    content: text,
    time: unix timestamp,
    numberOfApprovals: number,
    numberOfDisapprovals: number,
    numberOfComments: number,
}`


##Setup

* run `npm install`
* copy `environment.env` to `.env` file and edit configuration if you need
* run `npm run`

##Export data to JSON / CSV file

####JSON

Execute from terminal (change DB_NAME, DB_COLLECTION and PATH )
 
`mongoexport --db DB_NAME --collection DB_COLLECTION --out PATH/file.json`

####CSV


Execute from terminal (change DB_NAME, DB_COLLECTION, PATH and list of fields)

`mongoexport --db DB_NAME --collection DB_COLLECTION --type=csv --fields id,content,time,numberOfApprovals,numberOfDisapprovals,numberOfComments --out PATH/file.csv`
