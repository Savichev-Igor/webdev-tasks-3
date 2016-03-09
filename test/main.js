'use strict';

const mocha = require('mocha');
const chai = require('chai');
const sinon = require('sinon');

const should = chai.should();

// Можете объяснить почему требуется специальный фреймворк, чтобы 'should' из 'chai' работал ?
chai.use(require('sinon-chai'));

const flow = require('../flow.js');

describe('Tests for flow.js', () => {
    describe('Test for serial', () => {
        it('Should call func once & cb once with arguments null, 1', () => {
            var func = sinon.spy((cb) => {
                cb(null, 1);
            });

            var cb = sinon.spy();

            flow.serial([func], cb);

            func.should.have.been.calledOnce;
            cb.should.have.been.calledOnce;
            cb.should.have.been.calledWith(null, 1);
        });

        it('Should call 2 funcs & pass union data in cb which call once', () => {
            var funcOne = sinon.spy(cb => {
                cb(null, 1);
            });

            var funcTwo = sinon.spy((data, cb) => {
                data += 1;
                cb(null, data);
            });

            var cb = sinon.spy();

            flow.serial([funcOne, funcTwo], cb);

            funcOne.should.have.been.calledBefore(funcTwo);
            funcTwo.should.have.been.calledAfter(funcOne);
            cb.should.have.been.calledOnce;
            cb.should.have.been.calledWith(null, 2);
        });

        it('Should call 2 funcs, crash in 1st & pass err with data in cb which call once', () => {
            var testErr = new Error('Something is going bad');

            var funcOne = sinon.spy(cb => {
                cb(testErr, 1);
            });

            var funcTwo = sinon.spy((data, cb) => {
                data += 1;
                cb(null, data);
            });

            var cb = sinon.spy();

            flow.serial([funcOne, funcTwo], cb);

            funcOne.should.have.been.calledBefore(funcTwo);
            funcTwo.should.not.have.been.calledAfter(funcOne);
            cb.should.have.been.calledOnce;
            cb.should.have.been.calledWith(testErr, 1);
        });
    });

    describe('Test for parallel', () => {
        it('Should call func once & cb once with arguments null, [results]', () => {
            var func = sinon.spy((cb) => {
                cb(null, 1);
            });

            var cb = sinon.spy();

            flow.parallel([func], cb);

            func.should.have.been.calledOnce;
            cb.should.have.been.calledOnce;
            cb.should.have.been.calledWith(null, [1]);
        });

        it('Should run 2 funcs asyn once & pass data cb with [results] array once', done => {
            var funcOne = sinon.spy(cb => {
                cb(null, 1);
            });

            var funcTwo = sinon.spy(cb => {
                cb(null, 2);
            });

            var cb = sinon.spy();

            flow.parallel([funcOne, funcTwo], cb);

            /* Поскольку функции работают асинхронно из-за forEach, хотелось бы как-то
               научить тест считать его пройденным как с [1, 2] так и с [2, 1], т.к. мы не знаем,
               что нам придёт первым в результирующий массив, но я не смог найти как это
               сделать =( */
            funcOne.should.have.been.calledOnce;
            funcTwo.should.have.been.calledOnce;
            cb.should.have.been.calledOnce;
            cb.should.have.been.calledWith(null, [1, 2]);
            done();
        });

        it('Should run 2 funcs async, get err in 1st func & call once cb with err & data', done => {
            var testErr = new Error('Something is going bad');

            var funcOne = sinon.spy(cb => {
                cb(testErr, 1);
            });

            var funcTwo = sinon.spy(cb => {
                cb(null, 2);
            });

            var cb = sinon.spy();

            flow.parallel([funcOne, funcTwo], cb);

            funcOne.should.have.been.calledOnce;
            funcTwo.should.not.have.been.calledOnce;
            cb.should.have.been.calledOnce;
            cb.should.have.been.calledWith(testErr, 1);
            done();
        });
    });
});
