import ExpectStatic = Chai.ExpectStatic;
import ITestDefinition = Mocha.ITestDefinition;
import IContextDefinition = Mocha.IContextDefinition;

declare let expect: ExpectStatic;
declare let sinon: any;
declare let Given: IContextDefinition;
declare let When: IContextDefinition;
declare let Then: ITestDefinition;
declare let fThen: ITestDefinition;
declare let And: IContextDefinition;
declare let UnitUnderTest: IContextDefinition;
declare let xGiven: IContextDefinition;
declare let xWhen: IContextDefinition;
declare let xThen: ITestDefinition;
declare let xAnd: IContextDefinition;
declare let xUnitUnderTest: IContextDefinition;

declare namespace Chai {
    interface Assertion extends LanguageChains, NumericComparison, TypeComparison {
        signature(methods): Assertion;
    }
}