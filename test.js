'use strict';
const assert=require('node:assert/strict');
const {parseOfficialText}=require('./server');
assert.deepEqual(parseOfficialText('화홍문 공영주차장 32대 가능 / 120면'),[{id:'hwahong',free:32,capacity:120}]);
assert.deepEqual(parseOfficialText('화홍문 공영주차장 200대 가능 / 120면'),[]);
console.log('Tests passed');
