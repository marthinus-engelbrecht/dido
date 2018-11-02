import {createMethodMock, ObjectSignature} from "../main/Dido";

function aFunctionThatReturnsAnObject(): any {
    return {
        async methodAsync(): Promise<void> {},
        methodPromise(): Promise<void>{
            return new Promise((resolve, reject) => {});
        },
        methodSync(): string {
            return "Things";
        },
    };
}

const returnObjectSignature = new ObjectSignature();

returnObjectSignature.set("methodPromise", {
    failureValue: "otherThings",
    isAsync: true, // default: false
    successValue: "things that need to be returned",
});

returnObjectSignature.set("methodSync", {
    failureValue: "otherThings",
    successValue: "things",
});

const mockedMethod = createMethodMock(aFunctionThatReturnsAnObject, returnObjectSignature);

const returnedObject = mockedMethod();

async function log(){
    console.log("MockedMethods:", Object.keys(returnedObject).join(", "));
    returnedObject.methodPromise.$deferred.resolve();
    console.log("Returned:", await returnedObject.methodPromise("Monkey"));
    console.log("Is called: ", returnedObject.methodPromise.called());
    console.log("Is calledWith Monkey: ", returnedObject.methodPromise.calledWith("Monkey"));
    console.log("Is calledWith Donkey: ", returnedObject.methodPromise.calledWith("Donkey"));
}

log();
