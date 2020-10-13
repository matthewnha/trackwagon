process.argv.push('--silent');


import { PaginatedGetEvents } from './events';
import { PaginatedGetCallbacks } from './interfaces';

describe('Data Manager', () => {
    describe('Get user likes', () => {
        beforeEach(() => {
            jest.resetModules();
        })

        it("When valid userId provided, it should emit an array of tracks", async (done) => {
            const ScDataManager = (await import('./data-manager')).default;

            const onData = jest.fn((collection) => {
                expect(collection).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            id: expect.any(Number)
                        })
                    ])
                )
                done()
            });

            let data = new ScDataManager();
            const callbacks: PaginatedGetCallbacks = {
                onData,
                onErr: () => done.fail()
            }
    
            const ee = new PaginatedGetEvents(callbacks);
    
            data.getUserLikes({userId: 109873778, ee});
        })

        it("When invalid userId provided, it should emit an error", async (done) => {
            const ScDataManager = (await import('./data-manager')).default;

            let data = new ScDataManager();
            const callbacks: PaginatedGetCallbacks = {
                onData: () => done.fail(),
                onErr: () => done()
            }
    
            const ee = new PaginatedGetEvents(callbacks);
    
            data.getUserLikes({userId: -4561, ee});
        })
    })
})