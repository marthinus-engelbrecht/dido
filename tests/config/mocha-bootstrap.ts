import "mocha";
import "behavioural-describe-mocha";
import "@typical-linguist/collections-extension";
import {expect, use} from "chai";
import chaiAsPromised = require("chai-as-promised");
import sinon = require("sinon");
import sinonChai = require("sinon-chai");
import {customAssertions} from "../main/helpers";

use(chaiAsPromised);
use(sinonChai);

use(customAssertions);
global.expect = expect;

global.sinon = sinon;
