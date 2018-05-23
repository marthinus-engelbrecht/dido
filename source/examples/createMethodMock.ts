import {createMethodMock, ObjectSignature} from "../main/Dido";

function aFunctionThatReturnsAnObject() {
    return {
        async methodAsync(){},
        methodPromise(){
            return new Promise((resolve, reject) => {})
        },
        methodSync() {
            return 'Things'
        }
    }
}

let returnObjectSignature = new ObjectSignature();

returnObjectSignature.set('methodPromise', {
    isAsync: true, //default: false
    successValue: 'things that need to be returned',
    failureValue: 'otherThings'
});

returnObjectSignature.set('methodSync', {
    successValue: 'things',
    failureValue: 'otherThings'
});

const mockedMethod = createMethodMock(aFunctionThatReturnsAnObject, returnObjectSignature);

const returnedObject = mockedMethod();

async function log(){
    console.log('MockedMethods:', Object.keys(returnedObject).join(', '));
    returnedObject.methodPromise.$defered.resolve();
    console.log('Returned:', await returnedObject.methodPromise('Monkey'));
    console.log('Is called: ', returnedObject.methodPromise.called());
    console.log('Is calledWith Monkey: ', returnedObject.methodPromise.calledWith('Monkey'));
    console.log('Is calledWith Donkey: ', returnedObject.methodPromise.calledWith('Donkey'));
}

log();

