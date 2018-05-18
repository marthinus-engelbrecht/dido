import {Differed} from "../../tests/main/Differed";

export function createMethodMock(methodName, mockConfig: MockConfig) {
    return new Proxy(methodName, {
        apply: function () {
            const mockObj = {};
            mockConfig.methods.forEach(config => {
                if (config.signature.isAsync) {
                    const differed = new Differed(config.successValue, config.failureValue);

                    mockObj[config.signature.name] = function () {
                        return differed.promise
                    };

                    mockObj[config.signature.name].$differed = differed
                } else {
                    mockObj[config.signature.name] = function () {
                        return config.successValue
                    };
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