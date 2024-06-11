const { Pool } = require('pg');
const { analyzeNews, getSentiment } = require('../services/sentimentAnalysisService');
jest.mock('pg', () => {
    const mPool = {
        query: jest.fn()
    };
    return {
        Pool: jest.fn(() => mPool)
    };
});

jest.mock('natural', () => {
    return {
        SentimentAnalyzer: jest.fn().mockImplementation(() => ({
            getSentiment: jest.fn()
        })),
        PorterStemmer: jest.fn()
    };
});

describe('newsService', () => {
    let pool;
    let analyzer;

    beforeEach(() => {
        pool = new Pool();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('analyzeNews', () => {
        const spy = jest.fn(analyzeNews)
        it('should analyze news articles and insert scores into the database', async () => {
            const mockArticles = {
                rows: [
                    { id: 1, title: 'Positive news' },
                    { id: 2, title: 'Negative news' }
                ]
            };
            pool.query.mockResolvedValueOnce(mockArticles);

            await analyzeNews();

            expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("SELECT * FROM news"));
            expect(pool.query).toHaveBeenNthCalledWith(2, expect.stringContaining("INSERT INTO public.scores (news_id, score)"));
        });

        it('should handle no articles in the database', async () => {
            const mockArticles = { rows: [] };
            pool.query.mockResolvedValueOnce(mockArticles);

            await analyzeNews();

            expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("SELECT * FROM news"));
            expect(spy).not.toHaveBeenCalled();
        });

        it('should handle database errors', async () => {
            pool.query.mockRejectedValue(new Error('Database query failed'));

            await expect(analyzeNews()).rejects.toThrow('Database query failed');

            expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("SELECT * FROM news"));
        });
    });
});
