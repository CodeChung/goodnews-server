jest.mock('node-fetch', () => jest.fn());
const { Pool } = require('pg');
const fetch = require('node-fetch');
const { Response, Headers } = jest.requireActual('node-fetch');
const { getNews, insertNews } = require('../services/newsService');

jest.mock('pg');


describe('News Service', () => {
    let mockPool;
    let mockClient;

    beforeEach(() => {
        mockClient = {
            query: jest.fn()
        };
        mockPool = {
            connect: jest.fn(() => Promise.resolve(mockClient)),
            query: jest.fn()
        };
        Pool.mockImplementation(() => mockPool);
    })

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('insertNews', () => {
        it('should insert news articles into the database', async () => {
            const mockJsonResponse = {
                articles: [
                    {
                        author: 'Author',
                        title: 'Title',
                        description: 'Description',
                        sourcse: { id: 0, name: 'Source' },
                        url: 'http://example.com',
                        urlToImage: 'http://example.com/image.jpg',
                        publishedAt: '',
                        content: 'Content'
                    }
                ]
            }
            const mockNewsResponse = new Response(JSON.stringify(mockJsonResponse), {
                ok: true,
            });
            fetch.mockResolvedValueOnce(mockNewsResponse);

            await insertNews();

            expect(fetch).toHaveBeenCalledTimes(5);
            expect(mockPool.query).toHaveBeenCalled();
            const query = mockPool.query.mock.calls[0][0];
            expect(query).toContain('INSERT INTO public.news')
        })

        // it('should throw an error if fetch response is not ok', async () => {
        //     fetch.mockResolvedValue({ ok: false });

        //     await expect(insertNews()).rejects.toThrow('Network response not ok');
        // });
    })
})