import {Deferred} from "../../source/main/Deferred";
import {MethodSignature, ObjectSignature} from "../../source/main/Dido";

export function customAssertions(chai:any) {
    let Assertion = chai.Assertion;

    addSignatureAssertion(Assertion);
}

function addSignatureAssertion(Assertion: any) {
    Assertion.addMethod("signature", function (methodMocks: ObjectSignature) {
        const obj = this._obj;

        methodMocks.forEach(({isAsync}, methodName) => {
            let actualMethod = obj[methodName];

            this.assert(
                obj.hasOwnProperty(methodName),
                `expected ${JSON.stringify(obj)} to have method "${methodName}"`,
            );

            this.assert(
                obj.hasOwnProperty("$callsToMethods"),
                `expected ${JSON.stringify(obj)} to have property "$callsToMethods"`,
            );

            this.assert(
                obj.$callsToMethods instanceof Array,
                `expected ${JSON.stringify(obj)} to have property "$callsToMethods" of type Array`,
            );

            this.assert(
                actualMethod.called,
                `expected ${JSON.stringify(obj)} to have method "${methodName}" with property "called"`,
            );

            this.assert(
                actualMethod.calledWith,
                `expected ${JSON.stringify(obj)} to have method "${methodName}" with property "calledWith"`,
            );

            this.assert(
                typeof actualMethod.called === 'function',
                `expected ${JSON.stringify(obj)} property "called" to be a function`,
            );

            this.assert(
                typeof actualMethod.calledWith === 'function',
                `expected ${JSON.stringify(obj)} property "calledWith" to be a function`,
            );

            if (isAsync) {
                this.assert(
                    actualMethod.$deferred instanceof Deferred,
                    `expected ${JSON.stringify(obj)} to have method "${methodName}" with property $differed of type Differed but got ${actualMethod.$deferred}`,
                );
                let returnValue = actualMethod();
                this.assert(returnValue instanceof Promise,
                    `expected ${JSON.stringify(obj)} to have method "${methodName}" to return a promise but got "${JSON.stringify(returnValue)}"`,
                );
            }
        });
    })
}