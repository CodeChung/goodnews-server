const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASS,
    port: 5432,
    ssl: true
})

var Analyzer = require('natural').SentimentAnalyzer;
var stemmer = require('natural').PorterStemmer;
var analyzer = new Analyzer("English", stemmer, "afinn");

const getSentiment = (str) => {
    console.log("original str", str)
    console.log("str array", str.split(' '))
    console.log('score: ')
    console.log(analyzer.getSentiment(str.split(' ')))
}

const analyzeNews = async () => {
    let currentDate = new Date().toISOString().split('T')[0]
    const sqlGet = `SELECT * FROM news WHERE date = '${currentDate}'`;
    console.log('query', sqlGet)
    const articles = await pool.query(sqlGet);
    console.log('my articles', articles.rows[0])
    const analyzedArticles = []
    if (articles.rows?.length) {
        for (let i = 0; i < articles.rows.length; i++) {
            let { id, title } = articles.rows[i];
            id = id || 0;
            title = title || '';
            console.log('id', id, title)
            const score = analyzer.getSentiment(title.split(' '))
            console.log('score', score)
            analyzedArticles.push([id, score])
        }
    }
    const values = `${analyzedArticles.map(item => `(${item[0]}, ${item[1]})`).join(',')}`;
    console.log(values);
    const sqlInsert = `INSERT INTO public.scores (news_id, score) values ${values}`;
    const result = await pool.query(sqlInsert) 
}

module.exports = {
    getSentiment,
    analyzeNews
}