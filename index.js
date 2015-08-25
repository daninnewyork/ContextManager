/**
 The MIT License (MIT)

 Copyright (c) 2015 Dan Barnes

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */
define([
    './src/contexts/ContextManager',
    './src/contexts/Timeouts',
    './src/contexts/DOMEvents',
    './src/contexts/AngularCore',
    './src/contexts/AngularEvents'
], function(
    ContextManager,
    initTimeouts,
    initDOMEvents,
    initAngularCore,
    initAngularEventsFn
) {

    'use strict';

    function wrap(fn) {
        return function doInit() {
            fn(ContextManager);
        };
    }

    return {
        manager: ContextManager,
        initTimeouts: wrap(initTimeouts),
        initDOMEvents: wrap(initDOMEvents),
        initAngularCore: wrap(initAngularCore),
        initAngularEvents: function initAngularEvents($provide) {
            initAngularEventsFn(ContextManager, $provide);
        }
    };

});