var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var e_1, _a;
var userRoles = new Map();
userRoles.set("John", "pass123");
userRoles.set("Sarah", "pass456");
userRoles.set("Sam", "pass345");
console.log("Users are:", userRoles.keys());
console.log("Users are:", userRoles.values());
console.log("Password of John is", userRoles.get("John"));
console.log("Password of Sarah is", userRoles.get("Sarah"));
console.log("Password of Sam is", userRoles.get("Sam"));
console.log("Total number of user:" + userRoles.size);
userRoles.delete("Sam");
console.log("Does Sam have a password?", userRoles.has("Sam"));
console.log("Usernames:");
try {
    for (var _b = __values(userRoles.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
        var k = _c.value;
        console.log("Map Keys:" + k);
    }
}
catch (e_1_1) { e_1 = { error: e_1_1 }; }
finally {
    try {
        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
    }
    finally { if (e_1) throw e_1.error; }
}
