import ExpectStatic = Chai.ExpectStatic;

declare let expect: ExpectStatic;
declare let sinon: any;

declare namespace Chai {
    interface Assertion extends LanguageChains, NumericComparison, TypeComparison {
        signature(methods): Assertion;
    }
}