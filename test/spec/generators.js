define([], function() {

    'use strict';

    var origSetTimeout = window.setTimeout.bind(window),
        origSetInterval = window.setInterval.bind(window),
        origClearInterval = window.clearInterval.bind(window);

    return {
        ok: ok,
        nop: nop,
        fail: fail,
        verify: verify,
        parallel: parallel,
        timeout: timeout,
        interval: interval,
        animate: animate,
        domEvent: domEvent,
        ngEvent: ngEvent,
        matches: {
            context: contextMatches
        }
    };

    function nop() {
        return function() {};
    }

    function ok(done) {
        return function() { origSetTimeout(done); };
    }

    function fail(done) {
        return function (msg) {
            expect(function() {
                throw new Error(msg || 'unknown error occurred');
            }).not.toThrow();
            ok(done)();
        };
    }

    function contextMatches() {
        var expected = [].slice.call(arguments),
            method = function(manager) {
                method.message = '';
                var ok = true,
                    actual = manager.getCurrentContext().toString().split('\n');
                if (expected.length !== actual.length) {
                    ok = false;
                    method.message = 'The number of expected contexts (' + expected.length + ')' +
                        ' did not match the number of actual contexts (' + actual.length + ').\n' +
                        actual.join('\n');
                } else {
                    expected.forEach(function(requested, index) {
                        if (actual.length <= index || actual[index].indexOf(requested) === -1) {
                            method.message += 'context `' + requested + '`' +
                                ' does not match `' + actual[index] + '`\n' +
                                actual.join('\n');
                            ok = false;
                        }
                    });
                }
                return ok;
            };
        return method;
    }

    function verify(success, fail) {
        var msg,
            ok = true,
            args = [].slice.call(arguments, 2);
        return function(manager) {
            for(var i = 0, l = args.length; i < l; i++) {
                var matcher = args[i];
                if (ok && !matcher(manager)) {
                    ok = false;
                    msg = matcher.message;
                }
            }
            ok ? success() : fail(msg);
        };
    }

    function parallel(after) {
        var methods = [].slice.call(arguments, 1);
        return function(manager) {
            var startingContext = manager.getCurrentContext();
            var token = origSetInterval(function() {
                var currentContext = manager.getCurrentContext();
                if (currentContext === startingContext) {
                    origClearInterval(token);
                    after(manager);
                }
            });
            for(var i = 0, l = methods.length; i < l; i++) {
                origSetTimeout(methods[i].bind(null, manager));
            }
        };
    }

    function timeout(ms) {
        var args = [].slice.call(arguments, 1);
        return function(manager) {
            for(var i = 0, l = args.length; i < l; i++) {
                setTimeout(args[i].bind(null, manager));
            }
        };
    }

    function interval(ms) {
        var args = [].slice.call(arguments, 1);
        if (args[0].prototype === Array.prototype) {
            args.splice(0, 0, 1); // insert default max of 1
        }
        var max = args.shift();
        return function(manager) {
            for(var i = 0, l = args.length; i < l; i++) {
                var token = setInterval(function invokeMethod(fn, invoke) {
                    if (++invoke.count === max) {
                        clearInterval(token);
                    }
                    fn(manager);
                }.bind(null, args[i], {count: 0}), ms);
            }
        };
    }

    function animate() {
        var args = [].slice.call(arguments);
        return function(manager) {
            for(var i = 0, l = args.length; i < l; i++) {
                requestAnimationFrame(args[i].bind(null, manager));
            }
        };
    }

    function domEvent(name, callback) {
        var dom = document.createElement('div'),
            event = document.createEvent('MouseEvent');
        return function(manager) {
            event.initMouseEvent(name,
                false, false,
                window, 0, 0, 0, 0, 0,
                false, false, false, false,
                0, dom);
            callback = callback.bind(null, manager);
            dom.addEventListener(name, callback, false);
            dom.dispatchEvent(event);
            dom.removeEventListener(name, callback);
        };
    }

    function ngEvent() {}

});