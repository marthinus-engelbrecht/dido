import {Deferred} from "../../source/main/Deferred";
import {
    Call,
    Calls,
    createMethodMock,
    MethodSignature,
    MethodSpy,
    ObjectSignature,
    ObjectSpy,
} from "../../source/main/Dido";

UnitUnderTest(`createMethodMock()`, function(): void {
    Given(`a function that produces an object with a specified signature`, function(): void {
        let methodSignature: ObjectSignature;

        beforeEach(function(): void {
            methodSignature = new ObjectSignature();

            methodSignature.set(`doNsonAsyncThings`, {
                successValue: "Thi is my value",
            });
            methodSignature.set(`doAsyncThings`, {
                failureValue: new Error("This is my reject value"),
                isAsync: true,
                successValue: "This is my value",
            });
        });

        When(`createMethodMock is called with that function as an argument`, function(): void {
            let mocked: () => any;
            let instance: ObjectSpy;

            beforeEach(function(): void {
                mocked = createMethodMock(function(): void {
                    "empty";
                }, methodSignature);
                instance = mocked();
            });

            Then(`it should return a method that produces a mocked object of the specified signature`,
                function(): void {
                    const signature = methodSignature.map((value, key) => {
                        return {
                            key,
                            value: {
                                isAsync: value.isAsync,
                            },
                        };
                    });
                    expect(instance).to.have.signature(signature);
                });

            And(`the returned mockMethod is called`, function(): void {
                And(`the methods of the object is called`, function(): void {
                    Then(`those calls should be recorded, sorted and available through $callsToMethods() function`,
                        function(): void {
                            const callMocks: Calls = new Array<Call>(...[
                                {params: new Array([["A", {b: "B"}, ["C"]]])},
                                {params: new Array([["C", ["X"], {Z: "Z"}, 152]])},
                            ]);

                            const executedMethods = getMethodsExecutedWithParams(methodSignature, instance, callMocks);
                            const expectedCalls = executedMethods.map((method) => {
                                return method.calls;
                            });
                        });
                });

                Then(`the returned object's methods" called() function should return false`, function(): void {
                    const executedMethods = getMethods(methodSignature, instance);
                    executedMethods.forEach((method) => expect(method.called()).to.be.false);
                });

                Then(`the returned object's methods" calledWith() function should return false`, function(): void {
                    const executedMethods = getMethods(methodSignature, instance);
                    executedMethods.forEach((method) => expect(method.calledWith()).to.be.false);
                });

                And(`the returned object's methods are called with no value`, function(): void {
                    Then(`the called() function on those methods should return true`, function(): void {
                        const executedMethods = getMethodsExecuted(methodSignature, instance);
                        executedMethods.forEach((method) => expect(method.called()).to.be.true);
                    });

                    And(`the methods are async`, function(): void {
                        let asyncMethods: Array<MethodSpyInfo>;

                        beforeEach(function(): void {
                            asyncMethods = getAsyncMethods(methodSignature, instance);
                        });

                        When(`the promises are resolved`, function(): void {
                            beforeEach(function(): void {
                                resolve(asyncMethods);
                            });

                            Then(`they should result in the expected return values`, async function(): Promise<void> {
                                const expectationPromises = asyncMethods.map(async ({method, successValue}) => {
                                    await expect(method()).to.eventually.equal(successValue);
                                });

                                await Promise.all(expectationPromises);
                            });
                        });

                        When(`the promises are rejected`, function(): void {
                            beforeEach(function(): void {
                                reject(asyncMethods);
                            });
                            it(`Then they should throw an error`, async function(): Promise<void> {
                                const expectationPromises = asyncMethods.map(async ({method, failureValue}) => {
                                    await expect(method()).to.be.rejectedWith(failureValue);
                                });

                                await Promise.all(expectationPromises);
                            });
                        });
                    });

                    And(`the methods are not async`, function(): void {
                        let nonAsyncMethods: Array<MethodSpyInfo>;

                        beforeEach(function(): void {
                            nonAsyncMethods = getNonAsyncMethods(methodSignature, instance);
                        });

                        Then(`Then they should result in the expected return values`, function(): void {
                            nonAsyncMethods.forEach(({method, successValue}) => {
                                expect(method()).to.equal(successValue);
                            });
                        });
                    });
                });

                And(`the returned object's methods are called with a value`, function(): void {
                    Then(`the calledWith() function on those methods should return true`, function(): void {
                        const executedMethods = getMethodsExecutedWithParams(methodSignature, instance);
                        executedMethods.forEach(
                            ({method, calls}) => expect(method.calledWith(...calls[0].params)).to.be.true);
                    });
                });

                And(`the returned object's methods are called more than once with no value`, function(): void {
                    Then(`the called() function on those methods should return true`, function(): void {
                        const executedMethods = getMethodsExecuted(methodSignature, instance, 2);
                        executedMethods.forEach((method) => expect(method.called()).to.be.true);
                    });

                    Then(`the callCount property on those methods should return the call count`, function(): void {
                        const expectedCallCount = 2;
                        const executedMethods = getMethodsExecuted(methodSignature, instance, expectedCallCount);
                        executedMethods.forEach((method) => expect(method.callCount).to.equal(expectedCallCount));
                    });

                    And(`the methods are async`, function(): void {
                        let asyncMethods: Array<MethodSpyInfo>;

                        beforeEach(function(): void {
                            asyncMethods = getAsyncMethods(methodSignature, instance);
                        });

                        Then(`the deferred responses should be on the calls object`, function(): void {
                            const doAsyncThings = methodSignature.get("doAsyncThings");
                            const expectedCalls: Calls = new Array(...[
                                {
                                    deferredResponse: new Deferred(doAsyncThings.successValue,
                                        doAsyncThings.failureValue),
                                    params: new Array(),
                                },
                                {
                                    deferredResponse: new Deferred(doAsyncThings.successValue,
                                        doAsyncThings.failureValue),
                                    params: new Array(),
                                },
                            ]);

                            const executedMethods = getMethodsExecuted(methodSignature, instance, expectedCalls.length);

                            executedMethods.forEach((method) => {
                                method.calls.forEach((call, index) => {
                                    expect(method.calls[index]).to.deep.equal(call);
                                });
                            });
                        });

                        And(`the promises are resolved`, function(): void {
                            beforeEach(function(): void {
                                resolve(asyncMethods);
                            });

                            Then(`they should result in the expected return values`, async function(): Promise<void> {
                                const expectationPromises = asyncMethods.map(async ({method, successValue}) => {
                                    await expect(method()).to.eventually.equal(successValue);
                                });

                                await Promise.all(expectationPromises);
                            });
                        });

                        And(`the promises are rejected`, function(): void {
                            beforeEach(function(): void {
                                reject(asyncMethods);
                            });
                            it(`Then they should throw an error`, async function(): Promise<void> {
                                const expectationPromises = asyncMethods.map(async ({method, failureValue}) => {
                                    await expect(method()).to.be.rejectedWith(failureValue);
                                });

                                await Promise.all(expectationPromises);
                            });
                        });
                    });

                    And(`the methods are not async`, function(): void {
                        let nonAsyncMethods: Array<MethodSpyInfo>;

                        beforeEach(function(): void {
                            nonAsyncMethods = getNonAsyncMethods(methodSignature, instance);
                        });

                        Then(`Then they should result in the expected return values`, function(): void {
                            nonAsyncMethods.forEach(({method, successValue}) => {
                                expect(method()).to.equal(successValue);
                            });
                        });
                    });
                });

                And(`the returned object's methods are called more than once with a value`, function(): void {
                    Then(`the calledWith() function on those methods should return true`, function(): void {
                        const executedMethods = getMethodsExecutedWithParams(methodSignature, instance);
                        executedMethods.forEach(
                            ({method, calls}) => expect(method.calledWith(...calls[0].params)).to.be.true);
                    });

                    Then(`the calls() function should return all the calls made`, function(): void {
                        const expectedCalls: Calls = new Array(...[
                            {params: new Array([["A", {b: "B"}, ["C"]]])},
                            {params: new Array([["C", ["X"], {Z: "Z"}, 152]])},
                        ]);

                        const executedMethods = getMethodsExecutedWithParams(methodSignature, instance, expectedCalls);

                        executedMethods.forEach(({method, calls}) => {
                            calls.forEach((call, index) => {
                                expect(method.calls[index].params).to.deep.equal(call.params);
                            });
                        });
                    });
                });
            });
        });
    });
});

interface MethodSpyInfo {
    method?: MethodSpy;
    calls?: Calls;
    successValue?: any;
    failureValue?: any;
}

function getNonAsyncMethods(mockMethods: ObjectSignature, instance: ObjectSpy): Array<MethodSpyInfo> {
    return mockMethods.filter(({isAsync}) => !isAsync)
        .mapToArray((method, methodName) => {
            return {
                method: instance[methodName],
                successValue: method.successValue,
            };
        });
}

function getAsyncMethods(mockMethods: ObjectSignature, instance: ObjectSpy): Array<MethodSpyInfo> {
    return mockMethods
        .filter(({isAsync}) => isAsync)
        .mapToArray(({successValue, failureValue}, methodName) => {
            return {
                failureValue,
                method: instance[methodName],
                successValue,
            };
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
            return instance[methodName];
        });
}

function getMethodsExecutedWithParams(mockMethods: ObjectSignature, instance: ObjectSpy,
                                      calls: Calls = [{params: ["A", {b: "B"}, ["C"]]}]): Array<MethodSpyInfo> {
    return mockMethods
        .mapToArray<MethodSpyInfo>((methodInfo, methodName) => {
            calls.forEach((call) => instance[methodName](...call.params));
            return {
                calls,
                method: instance[methodName],
            };
        });
}

function reject(asyncMethods: Array<MethodSpyInfo>): void {
    asyncMethods.forEach(({method}) => method.$deferred.reject());
}

function resolve(asyncMethods: Array<MethodSpyInfo>): void {
    asyncMethods.forEach(({method}) => method.$deferred.resolve());
}
