import {Deferred} from "./Deferred";
import {Map} from 'crowd';


function createSpyMembers(): SpyMembers {
    return {
        calledWith(...args: Array<any>): boolean {
            if(!this.called()) {
                return false
            }

            return JSON.stringify(this.calls[0].params) === JSON.stringify(args)
        },

        called(): boolean {
            return this.calls.length > 0;
        },

        callCount : 0,
        calls: []
    }
}

function createMethodMember(methodName: string): MethodSpy {
    return Object.assign(function (returnValue: any, ...args: Array<any>) {
        let isDeferred = returnValue instanceof Deferred;

        let call: Call = {
            params: args
        };

        if (isDeferred) {
            call.deferredResponse = returnValue;
            returnValue = returnValue.promise
        }

        this[methodName].calls.push(call);
        this[methodName].callCount = this[methodName].calls.length;

        return returnValue
    }, createSpyMembers());
}

function addRequiredAsyncProperties(successValue: any, failureValue: any, methodMember: MethodSpy, mockObj: ObjectSpy) {
    const deferred = new Deferred(successValue, failureValue);
    const boundMember = methodMember.bind(mockObj, deferred);
    methodMember = Object.assign(methodMember, {
        $deferred: deferred
    });

    methodMember = Object.assign(boundMember, methodMember);
    return methodMember;
}

function addRequiredProperties(methodMember: MethodSpy, mockObj: ObjectSpy, successValue: any) {
    const boundMember = methodMember.bind(mockObj, successValue);
    methodMember = Object.assign(boundMember, methodMember);
    return methodMember;
}

export function createMethodMock(methodToMock: (...arg: Array<any>) => any, methods: ObjectSignature) {
    return new Proxy(methodToMock, {
        apply: function () {
            const mockObj: ObjectSpy = {};

            methods.forEach(({isAsync, successValue, failureValue}, methodName) => {
                let methodMember: MethodSpy = createMethodMember(methodName);


                if (isAsync) {
                    methodMember = addRequiredAsyncProperties(successValue, failureValue, methodMember, mockObj);
                } else {
                    methodMember = addRequiredProperties(methodMember, mockObj, successValue);
                }


                mockObj[methodName] = methodMember
            });

            return mockObj
        }
    });
}

export class ObjectSignature extends Map<string, MethodSignature> {
}

export interface MethodSignature {
    isAsync?: boolean,
    successValue: any,
    failureValue?: any
}

export interface ObjectSpy {
    [index: string]: MethodSpy | any
}

export interface MethodSpy extends SpyMembers {
    (...args: any[]): any,
}

export interface Calls extends Array<Call> {

}

export interface Call {
    params: Params,
    deferredResponse?: Deferred<any>
}

export interface Params extends Array<any> {

}

export interface SpyMembers {
    $deferred?: Deferred<any>;

    calledWith: (...args: Array<any>) => boolean

    called: () => boolean
    callCount: number
    calls: Calls
}