process.argv.push('--silent');

import SongRecommendations from './index';


describe('Song Recommender', () => {
    
    it("When provided a valid trackId, it should return an array of entries", async (done) => {
        const DataManager = (await import('../data-manager')).default;
        let recommender = new SongRecommendations(643487856, new DataManager())
        recommender.run((entries) => {
            expect(entries).toEqual(expect.arrayContaining([expect.any(Array)]))
            done();
        });
    }, 120000)
});