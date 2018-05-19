import {Differed} from "./Differed";

export function createMethodMock(methodName, mockConfig: MockConfig) {
    return new Proxy(methodName, {
        apply: function () {
            const mockObj = {};
            mockConfig.methods.forEach(config => {
                let called = false;
                let calledWith: Array<any> = undefined;

                if (config.signature.isAsync) {
                    const differed = new Differed(config.successValue, config.failureValue);

                    mockObj[config.signature.name] = function (...args) {
                        called = true;
                        calledWith = args;
                        return differed.promise
                    };

                    mockObj[config.signature.name].$differed = differed
                } else {
                    mockObj[config.signature.name] = function (...args) {
                        called = true;
                        calledWith = args;
                        return config.successValue
                    };
                }

                mockObj[config.signature.name].called = function () {
                    return called;
                };

                mockObj[config.signature.name].calledWith = function (...args) {
                    return JSON.stringify(calledWith) === JSON.stringify(args)
                }
            });
            return mockObj
        }
    });
}

export class MockConfig {
    constructor(public methods: Array<{
        signature: { name: string, isAsync?: boolean }
        successValue: any
        failureValue?: any
    }>) {
    }
}