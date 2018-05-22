import {Differed} from "./Differed";
import {Map} from 'crowd';

export class MethodMocks extends Map<string, MethodMock> {
}

export function createMethodMock(methodName, methods: MethodMocks) {
    return new Proxy(methodName, {
        apply: function () {
            const mockObj = {};

            methods.forEach((methodInfo, methodName) => {
                let called = false;
                let calledWith: Array<any> = undefined;

                if (methodInfo.isAsync) {
                    const differed = new Differed(methodInfo.successValue, methodInfo.failureValue);

                    mockObj[methodName] = function (...args) {
                        called = true;
                        calledWith = args;
                        return differed.promise
                    };

                    mockObj[methodName].$differed = differed
                } else {
                    mockObj[methodName] = function (...args) {
                        called = true;
                        calledWith = args;
                        return methodInfo.successValue
                    };
                }

                mockObj[methodName].called = function () {
                    return called;
                };

                mockObj[methodName].calledWith = function (...args) {
                    return JSON.stringify(calledWith) === JSON.stringify(args)
                }
            });

            return mockObj
        }
    });
}

export interface MethodMock {
    isAsync?: boolean,
    successValue: any,
    failureValue?: any
}