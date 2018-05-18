import {createMethodMock, MockConfig} from "../../source/main/Dido";
import {hasMethod} from "./helpers";
import {Differed} from "./Differed";

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
                        asyncMethods = mockConfig.methods
                            .filter(config => config.signature.isAsync)
                    });

                    describe('And the promises are resolved', function () {
                        it('Then they should result in the expected return values', async function () {
                            const expectationPromises = asyncMethods.map(async config => {
                                let actualMethod = instance[config.signature.name];
                                actualMethod.$differed.resolve();
                                let returnedObject = await actualMethod();
                                expect(returnedObject).to.equal(config.successValue);
                            });

                            await Promise.all(expectationPromises);
                        });
                    });

                    describe('And the promises are rejected', function () {
                        it('Then they should throw an error', async function () {
                            const expectationPromises = asyncMethods.map(async config => {
                                let actualMethod = instance[config.signature.name];
                                actualMethod.$differed.reject();
                                await expect(actualMethod()).to.be.rejectedWith(config.failureValue)
                            });

                            await Promise.all(expectationPromises);
                        });
                    });
                });

                describe('And the methods are not async', function () {
                    let nonAsyncMethods;

                    beforeEach(function () {
                        nonAsyncMethods = mockConfig.methods.filter(config => !config.signature.isAsync);
                    });

                    it('Then they should result in the expected return values', function () {
                        nonAsyncMethods.forEach(config => {
                            let actualMethod = instance[config.signature.name];
                            let returnedObject = actualMethod();

                            expect(returnedObject).to.equal(config.successValue);
                        });
                    });
                });
            });
        });

    });
});