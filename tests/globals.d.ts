declare namespace Chai {
    interface Assertion extends LanguageChains, NumericComparison, TypeComparison {
        signature(methods): Assertion;
    }
}
