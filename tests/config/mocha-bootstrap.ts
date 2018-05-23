import {expect, use} from 'chai';
import chaiAsPromised = require('chai-as-promised');
import sinon = require("sinon");
import sinonChai = require("sinon-chai");
import {customAssertions} from "../main/helpers";
import ISuiteCallbackContext = Mocha.ISuiteCallbackContext;

use(chaiAsPromised);
use(sinonChai);

(<any> global).expect = expect;
(<any> global).sinon = sinon;


(<any> global).Given = function (sentence: string, func: (this: ISuiteCallbackContext) => void) {
    describe(`Given ${sentence}`, func)
};
(<any> global).When = function (sentence: string, func: (this: ISuiteCallbackContext) => void) {
    describe(`When ${sentence}`, func)
};
(<any> global).Then = function (sentence: string, func: (this: ISuiteCallbackContext) => void) {
    it(`Then ${sentence}`, func)
};

(<any> global).fThen = function (sentence: string, func: (this: ISuiteCallbackContext) => void) {
    it.only(`Then ${sentence}`, func)
};


(<any> global).And = function (sentence: string, func: (this: ISuiteCallbackContext) => void) {
    describe(`And ${sentence}`, func)
};
(<any> global).UnitUnderTest = function (sentence: string, func: (this: ISuiteCallbackContext) => void) {
    describe(`Unit Under Test => ${sentence}`, func)
};

(<any> global).xGiven = function (sentence: string, func: (this: ISuiteCallbackContext) => void) {
    xdescribe(`Given ${sentence}`, func)
};
(<any> global).xWhen = function (sentence: string, func: (this: ISuiteCallbackContext) => void) {
    xdescribe(`When ${sentence}`, func)
};
(<any> global).xThen = function (sentence: string, func: (this: ISuiteCallbackContext) => void) {
    xit(`Then ${sentence}`, func)
};
(<any> global).xAnd = function (sentence: string, func: (this: ISuiteCallbackContext) => void) {
    xdescribe(`And ${sentence}`, func)
};
(<any> global).xUnitUnderTest = function (sentence: string, func: (this: ISuiteCallbackContext) => void) {
    xdescribe(`Unit Under Test => ${sentence}`, func)
};

use(customAssertions);
