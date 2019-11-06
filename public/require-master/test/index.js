var mod1 = require("public/require-master/test/node_modules/module1");
console.info(mod1.greet());
mod1.greetstr = "HELLO WORLD";
//var mod2 = require("module2");
//console.info(mod2.greet());
var mod3 = require("public/require-master/test/node_modules/module3");
console.info(mod3.greet());

var mod = require("./module");
console.info(mod.greet());

mod = require("public/require-master/test/node_modules/module1");
console.info(mod.greet());

mod = require("relative/main");
console.info(mod.greet());
