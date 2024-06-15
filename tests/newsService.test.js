jest.mock('node-fetch', () => jest.fn());

const { Pool } = require('pg');
const fetch = require('node-fetch');
const { insertNews, getNews } = require('../services/newsService');

jest.mock('pg', () => {
    const mPool = {
        query: jest.fn()
    };
    return {
        Pool: jest.fn(() => mPool)
    };
});


describe('newsService', () => {
    let pool;

    beforeEach(() => {
        pool = new Pool();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('insertNews', () => {
        it('should insert news articles into the database', async () => {
            const fetchMock = jest
            .spyOn(global, 'fetch')
            .mockImplementation(() =>
                Promise.resolve({ json: () => Promise.resolve({
                    articles: [
                        {
                            author: "John Doe",
                            title: "Sample Title",
                            description: "Sample Description",
                            source: { name: "Sample Source" },
                            url: "http://sample.url",
                            urlToImage: "http://sample.url/image.jpg",
                            content: "Sample Content"
                        }
                    ]
                }) })
            )
            await insertNews();

            expect(fetchMock).toHaveBeenCalledTimes(53);
            expect(pool.query).toHaveBeenCalled();
        });
    });

    describe('getNews', () => {
        it('should retrieve news articles from the database', async () => {
            const mockResult = {
                rows: [
                    { title: 'Title', url: 'http://news.url', imageurl: 'http://sample.url/image.jpg', score: 5 }
                ]
            };
            pool.query.mockResolvedValue(mockResult);

            const result = await getNews('general');

            expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("select title, url, imageurl, score from news"));
            expect(result).toEqual(mockResult);
        });

        it('should handle database errors', async () => {
            pool.query.mockRejectedValue(new Error('Database query failed'));

            await expect(getNews('general')).rejects.toThrow('Database query failed');
        });
    });
});
