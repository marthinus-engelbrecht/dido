import {createMethodMock, MockConfig} from "../../source/main/Dido";

function getNonAsyncMethods(mockConfig: MockConfig, instance) {
    return mockConfig.methods
        .filter(config => !config.signature.isAsync)
        .map(config => {
            return {
                method: instance[config.signature.name],
                successValue: config.successValue
            }
        });
}

describe('Unit under test: createMethodMock', function () {
    describe(`Given a function that produces an object with a specified signature`, function () {
        let mockConfig: MockConfig;

        beforeEach(function () {
            mockConfig = new MockConfig([
                {
                    signature: {
                        name: 'doNonAsyncThings'
                    },
                    successValue: "This is my value"
                },
                {
                    signature: {
                        name: 'doAsyncThings',
                        isAsync: true
                    },
                    successValue: "This is my value",
                    failureValue: new Error("This is my reject value")
                }
            ])
        });

        describe('When createMethodMock is called with that function', function () {
            let mocked, instance;

            beforeEach(function () {
                mocked = createMethodMock(function () {}, mockConfig);
                instance = mocked();
            });

            it('Then it should return a method that produces a mocked object of the specified signature', function () {
                const signature = mockConfig.methods.map(config => config.signature);
                expect(mocked()).to.have.signature(signature)
            });

            describe('And the returned objects methods are called', function () {
                describe('And the methods are async', function () {
                    let asyncMethods;

                    beforeEach(function () {
                        asyncMethods = getAsyncMethods(mockConfig, instance)
                    });

                    describe('And the promises are resolved', function () {
                        beforeEach(function () {
                            resolve(asyncMethods);
                        });

                        it('Then they should result in the expected return values', async function () {
                            const expectationPromises = asyncMethods.map(async ({method, successValue}) => {
                                await expect(method()).to.eventually.equal(successValue)
                            });

                            await Promise.all(expectationPromises);
                        });
                    });

                    describe('And the promises are rejected', function () {
                        beforeEach(function () {
                            reject(asyncMethods);
                        });
                        it('Then they should throw an error', async function () {
                            const expectationPromises = asyncMethods.map(async ({method, failureValue}) => {
                                await expect(method()).to.be.rejectedWith(failureValue)
                            });

                            await Promise.all(expectationPromises);
                        });
                    });
                });

                describe('And the methods are not async', function () {
                    let nonAsyncMethods;

                    beforeEach(function () {
                        nonAsyncMethods = getNonAsyncMethods(mockConfig, instance);
                    });

                    it('Then they should result in the expected return values', function () {
                        nonAsyncMethods.forEach(({method, successValue}) => {
                            expect(method()).to.equal(successValue);
                        });
                    });
                });
            });
        });

    });
});

function getAsyncMethods(mockConfig: MockConfig, instance) {
    return mockConfig.methods
        .filter(config => config.signature.isAsync)
        .map(config => {
            return {
                method: instance[config.signature.name],
                successValue: config.successValue,
                failureValue: config.failureValue
            }
        });
}

function reject(asyncMethods) {
    asyncMethods.forEach(({method}) => method.$differed.reject())
}

function resolve(asyncMethods) {
    asyncMethods.forEach(({method}) => method.$differed.resolve())
}