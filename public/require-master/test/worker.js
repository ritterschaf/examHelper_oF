"use strict";

importScripts("../require.js");
Tarp.require({ expose: true });

var mod = require("public/require-master/test/node_modules/module1");

self.addEventListener("message", function() {
  self.postMessage(mod.greet());
}, false);
