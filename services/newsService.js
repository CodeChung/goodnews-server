const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASS,
    port: 5432,
    ssl: true
})

const insertNews = async () => {
    const categories = ['general','entertainment', 'science', 'technology', 'business']

    for (let i = 0; i < categories.length; i++) {
        const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${process.env.NEWS_API_KEY}&category=${categories[i]}`)
        // if (!response.ok) {
        // throw new Error('Network response not ok');
        // }
        const data = await response.json();
        const values = data.articles.map(item => {
        const newsObject = {
            author: sanitizer(item.author) || '',
            category: categories[i],
            title: sanitizer(item.title) || '',
            description: sanitizer(item.description) || '',
            source: sanitizer(item.source?.name) || '',
            url: sanitizer(item.url) || '',
            imageurl: sanitizer(item.urlToImage) || '',
            content: sanitizer(item.content) || '',
            date: new Date().toISOString().split('T')[0]
        };
        return `(${Object.values(newsObject).map(item => `'${item}'`).join(',')})`
        }).join(',');
        const query = `INSERT INTO public.news (author, category, title, description, source, url, imageurl, content, date) values ${values} on conflict (category, author, title, date) do nothing RETURNING *`;
        const result = await pool.query(query);
    }
    console.log('all articles inserted')
    //todo rabbitmq publish
}

const getNews = async (category) => {
    const currentDate = new Date().toISOString().split('T')[0];
    const sqlGet = `select title, url, imageurl, score from news left join scores on news.id = scores.news_id
    where category = '${category}' and date = '${currentDate}'`;
    console.log('sql', sqlGet)
    const result = await pool.query(sqlGet);
    return result;
}

function sanitizer(str) {
    if (str) return str.replace(/'/g, "\"");
    else return '';
}

module.exports = {
    insertNews,
    getNews
}