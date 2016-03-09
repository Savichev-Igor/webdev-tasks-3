'use strict';

/**
 * @author Savi
 */

/**
 * Метод serial запускает функции [func1, func2] в массиве последовательно.
 * Результат функции передается в следующую. Помимо результата предыдущей функции,
 * она получает колбэк. Колбэк принимает первым параметром ошибку,
 * а вторым – данные для следующей функции.
 * Если любая из функций передает в колбэк ошибку, то следующая не выполняется,
 * а вызывается основной колбэк callback.
 *
 * @param {Array} functions
 * @param {Function} cb
 */
module.exports.serial = function (functions, cb) {
    var _cb = function (err, data) {
        if (functions.length === 0 || err) {
            err = err ? err : null;
            cb(err, data);
        } else {
            var curFunc = functions.shift();
            curFunc(data, _cb);
        }
    };

    if (functions.length > 0) {
        var startFunc = functions.shift();
        startFunc(_cb);
    }
};

/**
 * Метод parallel запускает функции [func1, func2] в массиве параллельно.
 * Результат собирается в массив, который передается в основной callback при завершении
 * всех функций.
 * Функции func1, func2 тоже принимают колбэк. Колбэк принимает первым параметром ошибку,
 * а вторым – данные для конечного массива.
 *
 * @param {Array} functions
 * @param {Function} cb
 */
module.exports.parallel = function (functions, cb) {
    var results = [];
    var stopIteration = false;

    // forEach - асинхронный :3
    functions.forEach(function (func, ind) {
        if (!stopIteration) {
            func(function (err, data) {
                if (err) {
                    cb(err, data);
                    // Если хотя бы одна ошибка, то прерываем работу
                    stopIteration = true;
                } else {
                    results.push(data);
                }
                if (ind === functions.length - 1) {
                    // По завершениею вызываем основной cb
                    cb(null, results);
                }
            });
        }
    });
};

/**
 * Метод map запускает функцию func с каждым значением ['value1', 'value2'] параллельно.
 * Результат собираются в массив, который передаётся в основной cb при завершении всех запусков.
 *
 * @param {Array} values
 * @param {Function} func
 * @param {Function} cb
 */
module.exports.map = function (values, func, cb) {
    var results = [];
    var stopIteration = false;

    // forEach - асинхронный :3
    values.forEach(function (value, ind) {
        if (!stopIteration) {
            func(value, function (err, data) {
                if (err) {
                    cb(err, data);
                    // Если хотя бы одна ошибка, то прерываем работу
                    stopIteration = true;
                } else {
                    results.push(data);
                }
                if (ind === values.length - 1) {
                    cb(null, results);
                }
            });
        }
    });
};
