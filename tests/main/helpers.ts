import {Differed} from "../../source/main/Differed";

export function customAssertions(chai, utils) {
    let Assertion = chai.Assertion;

    addSignatureAssertion(Assertion);
}

function addSignatureAssertion(Assertion) {
    Assertion.addMethod('signature', function (signature) {
        const obj = this._obj;

        signature.forEach(({isAsync}, methodName) => {
            let actualMethod = obj[methodName];

            this.assert(
                obj.hasOwnProperty(methodName),
                `expected ${JSON.stringify(obj)} to have method "${methodName}"`,
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
                    actualMethod.$differed instanceof Differed,
                    `expected ${JSON.stringify(obj)} to have method "${methodName}" with property $differed of type Differed but got ${actualMethod.$differed}`,
                );
                let returnValue = actualMethod();
                this.assert(returnValue instanceof Promise,
                    `expected ${JSON.stringify(obj)} to have method "${methodName}" to return a promise but got "${JSON.stringify(returnValue)}"`,
                );
            }
        });
    })
}