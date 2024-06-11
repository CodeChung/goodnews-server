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

const analyzeNews = async () => {
    let currentDate = new Date().toISOString().split('T')[0]
    const sqlGet = `SELECT * FROM news WHERE date = '${currentDate}'`;
    const articles = await pool.query(sqlGet);
    const analyzedArticles = []
    if (articles.rows?.length) {
        for (let i = 0; i < articles.rows.length; i++) {
            let { id, title } = articles.rows[i];
            id = id || 0;
            title = title || '';
            console.log('id', id, title)
            const score = getSentiment(title)
            console.log('score', score)
            analyzedArticles.push([id, score])
        }
    }
    const values = `${analyzedArticles.map(item => `(${item[0]}, ${item[1]})`).join(',')}`;
    const sqlInsert = `INSERT INTO public.scores (news_id, score) values ${values}`;
    const result = await pool.query(sqlInsert) 
}

const getSentiment = async (title) => {
    return analyzer.getSentiment(title.split(' '))
}

module.exports = {
    analyzeNews,
    getSentiment
}