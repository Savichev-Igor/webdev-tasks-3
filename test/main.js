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
        it('Should call cb once with arguments null, 1', () => {
            var func = (cb) => {
                cb(null, 1);
            };

            var cb = sinon.spy();
            flow.serial([func], cb);
            cb.should.have.been.calledOnce;
            cb.should.have.been.calledWith(null, 1);
        });

        it('Should call 2 funcs and pass union data in cb which call once', () => {
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

        it('Should call 2 funcs, crash in 1st and pass err with data in cb which call once', () => {
            var testErr = new Error('Something is going wrong');

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
});
