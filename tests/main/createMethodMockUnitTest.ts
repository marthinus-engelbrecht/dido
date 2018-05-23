import {createMethodMock, ObjectSignature, MethodSignature, ObjectSpy, MethodSpy, Calls} from "../../source/main/Dido";
import {Deferred} from "../../source/main/Deferred";

UnitUnderTest(`createMethodMock()`, function () {
    Given(`a function that produces an object with a specified signature`, function () {
        let methodSignature: ObjectSignature;

        beforeEach(function () {
            methodSignature = new ObjectSignature();

            methodSignature.set(`doNonAsyncThings`, {
                successValue: "This is my value"
            });
            methodSignature.set(`doAsyncThings`, {
                isAsync: true,
                successValue: "This is my value",
                failureValue: new Error("This is my reject value")
            })
        });

        When(`createMethodMock is called with that function as an argument`, function () {
            let mocked: () => any, instance: ObjectSpy;

            beforeEach(function () {
                mocked = createMethodMock(function () {
                }, methodSignature);
                instance = mocked();
            });

            Then(`it should return a method that produces a mocked object of the specified signature`, function () {
                const signature = methodSignature.map((value, key) => {
                    return {
                        key: key,
                        value: {
                            isAsync: value.isAsync
                        }
                    }
                });
                expect(mocked()).to.have.signature(signature)
            });

            Then(`the returned object's methods' called() function should return false`, function () {
                let executedMethods = getMethods(methodSignature, instance);
                executedMethods.forEach(method => expect(method.called()).to.be.false)
            });

            Then(`the returned object's methods' calledWith() function should return false`, function () {
                let executedMethods = getMethods(methodSignature, instance);
                executedMethods.forEach(method => expect(method.calledWith()).to.be.false)
            });

            When(`the returned object's methods are called with no value`, function () {
                Then(`the called() function on those methods should return true`, function () {
                    let executedMethods = getMethodsExecuted(methodSignature, instance);
                    executedMethods.forEach(method => expect(method.called()).to.be.true)
                });

                And(`the methods are async`, function () {
                    let asyncMethods: Array<MethodSpyInfo>;

                    beforeEach(function () {
                        asyncMethods = getAsyncMethods(methodSignature, instance)
                    });

                    When(`the promises are resolved`, function () {
                        beforeEach(function () {
                            resolve(asyncMethods);
                        });

                        Then(`they should result in the expected return values`, async function () {
                            const expectationPromises = asyncMethods.map(async ({method, successValue}) => {
                                await expect(method()).to.eventually.equal(successValue)
                            });

                            await Promise.all(expectationPromises);
                        });
                    });

                    When(`the promises are rejected`, function () {
                        beforeEach(function () {
                            reject(asyncMethods);
                        });
                        it(`Then they should throw an error`, async function () {
                            const expectationPromises = asyncMethods.map(async ({method, failureValue}) => {
                                await expect(method()).to.be.rejectedWith(failureValue)
                            });

                            await Promise.all(expectationPromises);
                        });
                    });
                });

                And(`the methods are not async`, function () {
                    let nonAsyncMethods: Array<MethodSpyInfo>;

                    beforeEach(function () {
                        nonAsyncMethods = getNonAsyncMethods(methodSignature, instance);
                    });

                    Then(`Then they should result in the expected return values`, function () {
                        nonAsyncMethods.forEach(({method, successValue}) => {
                            expect(method()).to.equal(successValue);
                        });
                    });
                });
            });

            When(`the returned object's methods are called with a value`, function () {
                Then(`the calledWith() function on those methods should return true`, function () {
                    let executedMethods = getMethodsExecutedWithParams(methodSignature, instance);
                    executedMethods.forEach(({method, calls}) => expect(method.calledWith(...calls[0].params)).to.be.true)
                });
            });

            When(`the returned object's methods are called more than once with no value`, function () {
                Then(`the called() function on those methods should return true`, function () {
                    let executedMethods = getMethodsExecuted(methodSignature, instance, 2);
                    executedMethods.forEach(method => expect(method.called()).to.be.true)
                });

                Then(`the callCount property on those methods should return the call count`, function () {
                    let expectedCallCount = 2;
                    let executedMethods = getMethodsExecuted(methodSignature, instance, expectedCallCount);
                    executedMethods.forEach(method => expect(method.callCount).to.equal(expectedCallCount))
                });

                And(`the methods are async`, function () {
                    let asyncMethods: Array<MethodSpyInfo>;

                    beforeEach(function () {
                        asyncMethods = getAsyncMethods(methodSignature, instance)
                    });

                    Then(`the deferred responses should be on the calls object`, function () {
                        let doAsyncThings = methodSignature.get('doAsyncThings');
                        const expectedCalls: Calls = [
                            {
                                params: [],
                                deferredResponse: new Deferred(doAsyncThings.successValue, doAsyncThings.failureValue)
                            },
                            {
                                params: [],
                                deferredResponse: new Deferred(doAsyncThings.successValue, doAsyncThings.failureValue)
                            }
                        ];

                        let executedMethods = getMethodsExecuted(methodSignature, instance, expectedCalls.length);

                        executedMethods.forEach((method) => {
                            method.calls.forEach((call, index) => {
                                expect(method.calls[index]).to.deep.equal(call)
                            });
                        })
                    });

                    And(`the promises are resolved`, function () {
                        beforeEach(function () {
                            resolve(asyncMethods);
                        });

                        Then(`they should result in the expected return values`, async function () {
                            const expectationPromises = asyncMethods.map(async ({method, successValue}) => {
                                await expect(method()).to.eventually.equal(successValue)
                            });

                            await Promise.all(expectationPromises);
                        });
                    });

                    And(`the promises are rejected`, function () {
                        beforeEach(function () {
                            reject(asyncMethods);
                        });
                        it(`Then they should throw an error`, async function () {
                            const expectationPromises = asyncMethods.map(async ({method, failureValue}) => {
                                await expect(method()).to.be.rejectedWith(failureValue)
                            });

                            await Promise.all(expectationPromises);
                        });
                    });
                });

                And(`the methods are not async`, function () {
                    let nonAsyncMethods: Array<MethodSpyInfo>;

                    beforeEach(function () {
                        nonAsyncMethods = getNonAsyncMethods(methodSignature, instance);
                    });

                    Then(`Then they should result in the expected return values`, function () {
                        nonAsyncMethods.forEach(({method, successValue}) => {
                            expect(method()).to.equal(successValue);
                        });
                    });
                });
            });

            When(`the returned object's methods are called more than once with a value`, function () {
                Then(`the calledWith() function on those methods should return true`, function () {
                    let executedMethods = getMethodsExecutedWithParams(methodSignature, instance);
                    executedMethods.forEach(({method, calls}) => expect(method.calledWith(...calls[0].params)).to.be.true)
                });

                Then(`the calls() function should return all the calls made`, function () {
                    const expectedCalls: Calls = [
                        {params: [['A', {b: 'B'}, ['C']]]},
                        {params: [['C', ['X'], {Z: 'Z'}, 152]]}
                    ];

                    let executedMethods = getMethodsExecutedWithParams(methodSignature, instance, expectedCalls);

                    executedMethods.forEach(({method, calls}) => {
                        calls.forEach((call, index) => {
                            expect(method.calls[index].params).to.deep.equal(call.params)
                        });
                    })

                })
            });
        });
    });
});

interface MethodSpyInfo {
    method?: MethodSpy
    calls?: Calls
    successValue?: any,
    failureValue?: any
}


function getNonAsyncMethods(mockMethods: ObjectSignature, instance: ObjectSpy): Array<MethodSpyInfo> {
    return mockMethods.filter(({isAsync}) => !isAsync)
        .mapToArray((method, methodName) => {
            return {
                method: instance[methodName],
                successValue: method.successValue
            }
        });
}

function getAsyncMethods(mockMethods: ObjectSignature, instance: ObjectSpy): Array<MethodSpyInfo> {
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

function getMethods(mockMethods: ObjectSignature, instance: ObjectSpy): Array<MethodSpy> {
    return mockMethods
        .mapToArray((methodInfo, methodName) => instance[methodName]);
}

function getMethodsExecuted(mockMethods: ObjectSignature, instance: ObjectSpy, callCount = 1): Array<MethodSpy> {
    return mockMethods
        .mapToArray((methodInfo, methodName) => {
            for (let i = 0; i < callCount; i++) {
                instance[methodName]();
            }
            return instance[methodName]
        });
}

function getMethodsExecutedWithParams(mockMethods: ObjectSignature, instance: ObjectSpy, calls: Calls = [{params: ['A', {b: 'B'}, ['C']]}]): Array<MethodSpyInfo> {
    return mockMethods
        .mapToArray((methodInfo, methodName) => {
            calls.forEach(call => instance[methodName](...call.params));
            return {
                method: instance[methodName],
                calls: calls
            }
        });
}

function reject(asyncMethods: Array<MethodSpyInfo>) {
    asyncMethods.forEach(({method}) => method.$deferred.reject())
}

function resolve(asyncMethods: Array<MethodSpyInfo>) {
    asyncMethods.forEach(({method}) => method.$deferred.resolve())
}