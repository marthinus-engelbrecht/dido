import {Deferred} from "./Deferred";

function createSpyMembers(): SpyMembers {
    return {
        calledWith(...args: any[]): boolean {
            if (!this.called()) {
                return false;
            }

            return JSON.stringify(this.calls[0].params) === JSON.stringify(args);
        },

        called(): boolean {
            return this.calls.length > 0;
        },

        callCount: 0,
        calls: new Array<Call>(),
    };
}

function createMethodMember(methodName: string): MethodSpy {
    return Object.assign(function(returnValue?: any, ...args: any[]): any {
        const isDeferred = returnValue instanceof Deferred;

        let result = returnValue;

        const call: Call = {
            params: new Array(...args),
        };

        if (isDeferred) {
            call.deferredResponse = returnValue;
            result = returnValue.promise;
        }

        this[methodName].calls.push(call);
        this[methodName].callCount = this[methodName].calls.length;

        return result;
    }, createSpyMembers());
}

function addRequiredAsyncProperties(successValue: any, failureValue: any,
                                    methodMember: MethodSpy, mockObj: ObjectSpy): MethodSpy {
    const deferred = new Deferred(successValue, failureValue);
    const boundMember = methodMember.bind(mockObj, deferred);
    let result = methodMember;

    result = Object.assign(result, {
        $deferred: deferred,
    });

    result = Object.assign(boundMember, result);

    return result;
}

function addRequiredProperties(methodMember: MethodSpy, mockObj: ObjectSpy, successValue: any): MethodSpy {
    const boundMember = methodMember.bind(mockObj, successValue);
    let result = methodMember;
    result = Object.assign(boundMember, result);
    return result;
}

export function createMethodMock(methodToMock: (...arg: any[]) => any,
                                 objectSignature: ObjectSignature): (...arg: any[]) => any {
    return new Proxy(methodToMock, {
        apply(): ObjectSpy {
            const mockObj: ObjectSpy = {
                get $callsToMethods(): Calls {
                    return methodsSpies.map((methodSpy: MethodSpy) => methodSpy.calls).flatten() as Calls;
                },
            };

            const methodsSpies = objectSignature.mapToArray(({isAsync, successValue, failureValue}, methodName) => {
                let methodSpy: MethodSpy = createMethodMember(methodName);

                if (isAsync) {
                    methodSpy = addRequiredAsyncProperties(successValue, failureValue, methodSpy, mockObj);
                } else {
                    methodSpy = addRequiredProperties(methodSpy, mockObj, successValue);
                }

                mockObj[methodName] = methodSpy;

                return methodSpy;
            });

            return mockObj;
        },
    });
}

export class ObjectSignature extends Map<string, MethodSignature> {
}

export interface MethodSignature {
    isAsync?: boolean;
    successValue: any;
    failureValue?: any;
}

export interface ObjectSpy {
    readonly $callsToMethods: Call[];

    [index: string]: MethodSpy | any;
}

export interface MethodSpy extends SpyMembers {
    (returnValue?: any, ...args: any[]): any;
}

export class Calls extends Array<Call> {

}

export interface Call {
    params: Params;
    deferredResponse?: Deferred<any>;
}

export interface Params extends Array<any> {

}

export interface SpyMembers {
    $deferred?: Deferred<any>;

    calledWith: (...args: any[]) => boolean;

    called: () => boolean;
    callCount: number;
    calls: Calls;
}
