import {Differed} from "../../source/main/Differed";

export function hasMethod(object, methodName): boolean{
    const methodNames = Object.getOwnPropertyNames(object).filter(property => typeof object[property] === 'function');
    return methodNames.includes(methodName)
}

export function customAssertions(chai, utils) {
    let Assertion = chai.Assertion;

    addSignatureAssertion(Assertion);
}

function addSignatureAssertion(Assertion) {
    Assertion.addMethod('signature', function (signature) {
        const obj = this._obj;

        signature.forEach(methodSignature => {
            let actualMethod = obj[methodSignature.name];

            this.assert(
                hasMethod(obj, methodSignature.name),
                `expected ${JSON.stringify(obj)} to have method "${methodSignature.name}"`,
            );

            this.assert(
                actualMethod.called,
                `expected ${JSON.stringify(obj)} to have method "${methodSignature.name}" with property "called"`,
            );

            this.assert(
                typeof actualMethod.called === 'function',
                `expected ${JSON.stringify(obj)} property "called" to be a function`,
            );

            if (methodSignature.isAsync) {
                this.assert(
                    actualMethod.$differed instanceof Differed,
                    `expected ${JSON.stringify(obj)} to have method "${methodSignature.name}" with property $differed of type Differed but got ${actualMethod.$differed}`,
                );
                let returnValue = actualMethod();
                this.assert(returnValue instanceof Promise,
                    `expected ${JSON.stringify(obj)} to have method "${methodSignature.name}" to return a promise but got "${JSON.stringify(returnValue)}"`,
                );
            }
        });
    })
}