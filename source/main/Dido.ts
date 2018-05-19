import {Differed} from "./Differed";

export function createMethodMock(methodName, mockConfig: MockConfig) {
    return new Proxy(methodName, {
        apply: function () {
            const mockObj = {};
            mockConfig.methods.forEach(config => {
                let called = false;
                if (config.signature.isAsync) {
                    const differed = new Differed(config.successValue, config.failureValue);

                    mockObj[config.signature.name] = function () {
                        called = true;
                        return differed.promise
                    };

                    mockObj[config.signature.name].$differed = differed
                } else {
                    mockObj[config.signature.name] = function () {
                        called = true;
                        return config.successValue
                    };
                }
                mockObj[config.signature.name].called = function () {
                    return called;
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