declare let global: NodeJS.Global;
declare let expect: Chai.ExpectStatic;

declare namespace NodeJS {
    import ExpectStatic = Chai.ExpectStatic;

    export interface Global {
        sinon: sinon;
        expect: ExpectStatic;
    }
}
