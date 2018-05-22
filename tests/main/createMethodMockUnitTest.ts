import {createMethodMock, MethodMocks} from "../../source/main/Dido";

describe('Unit under test: createMethodMock', function () {
    describe(`Given a function that produces an object with a specified signature`, function () {
        let methodMocks: MethodMocks;

        beforeEach(function () {
            methodMocks = new MethodMocks();

            methodMocks.set('doNonAsyncThings', {
                successValue: "This is my value"
            });

            methodMocks.set('doAsyncThings', {
                isAsync: true,
                successValue: "This is my value",
                failureValue: new Error("This is my reject value")
            })
        });

        describe('When createMethodMock is called with that function', function () {
            let mocked, instance;

            beforeEach(function () {
                mocked = createMethodMock(function () {
                }, methodMocks);
                instance = mocked();
            });

            it('Then it should return a method that produces a mocked object of the specified signature', function () {
                const signature = methodMocks.map((value, key) => {
                    return {
                        key: key,
                        value: {
                            isAsync: value.isAsync
                        }
                    }
                });
                expect(mocked()).to.have.signature(signature)
            });

            it('Then the returned objects methods function "called" should return false', function () {
                let executedMethods = getMethods(methodMocks, instance);
                executedMethods.forEach(method => expect(method.called()).to.be.false)
            });

            it('Then the returned objects methods function "calledWith" should return false', function () {
                let executedMethods = getMethods(methodMocks, instance);
                executedMethods.forEach(method => expect(method.calledWith()).to.be.false)
            });

            describe('And the returned objects methods are called', function () {
                it('Then the function "called" on those methods should return true', function () {
                    let executedMethods = getMethodsExecuted(methodMocks, instance);
                    executedMethods.forEach(method => expect(method.called()).to.be.true)
                });

                describe('with a value', function () {
                    it('Then the function "calledWith" on those methods should return true', function () {
                        let executedMethods = getMethodsExecutedWithParams(methodMocks, instance);
                        executedMethods.forEach(({method, params}) => expect(method.calledWith(...params)).to.be.true)
                    });
                });

                describe('And the methods are async', function () {
                    let asyncMethods;

                    beforeEach(function () {
                        asyncMethods = getAsyncMethods(methodMocks, instance)
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
                        nonAsyncMethods = getNonAsyncMethods(methodMocks, instance);
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
})
;

function getNonAsyncMethods(mockMethods: MethodMocks, instance) {
    return mockMethods.filter(({isAsync}) => !isAsync)
        .mapToArray((method, methodName) => {
            return {
                method: instance[methodName],
                successValue: method.successValue
            }
        });
}

function getAsyncMethods(mockMethods: MethodMocks, instance) {
    return mockMethods
        .filter(({isAsync}) => isAsync)
        .mapToArray(({successValue, failureValue}, methodName) => {
            return {
                method: instance[methodName],
                successValue: successValue,
                failureValue: failureValue
            }
        });
}

function getMethods(mockMethods: MethodMocks, instance) {
    return mockMethods
        .mapToArray((methodInfo, methodName) => instance[methodName]);
}

function getMethodsExecuted(mockMethods: MethodMocks, instance) {
    return mockMethods
        .mapToArray((methodInfo, methodName) => {
            instance[methodName]();
            return instance[methodName]
        });
}

function getMethodsExecutedWithParams(mockMethods: MethodMocks, instance) {
    return mockMethods
        .mapToArray((methodInfo, methodName) => {
            const params = ['A', {b: 'B'}, ['C']];
            instance[methodName](...params);
            return {
                method: instance[methodName],
                params: params
            }
        });
}

function reject(asyncMethods) {
    asyncMethods.forEach(({method}) => method.$differed.reject())
}

function resolve(asyncMethods) {
    asyncMethods.forEach(({method}) => method.$differed.resolve())
}