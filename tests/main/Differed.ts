export class Differed<T> {
    public resolve: Function;
    public reject: Function;

    public promise: PromiseLike<T>;

    constructor(resolveValue?: T, rejectValue?: T) {
        let resolve: Function;
        let reject: Function;

        this.promise = new Promise((innerResolve, innerReject) => {
            resolve = function (returnValueMock?: T) {
                innerResolve(returnValueMock || resolveValue);
            };

            reject = function (rejectValueMock?: T) {
                innerReject(rejectValueMock || rejectValue);
            }
        });

        this.resolve = resolve;
        this.reject = reject;
    }
}