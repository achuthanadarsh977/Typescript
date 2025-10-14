var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var profile = ["Name:John Samuel", "Age:23", "Address:Chennai", "ID:1001", "Gender:Male"];
var profile2 = ["Blood Group:B++", "Date Of Birth:20/12/2001"];
for (var i in profile) {
    console.log(profile[i]);
}
var copyprofile = __spreadArray([], profile, true);
var profile3 = profile.concat(profile2);
console.log(copyprofile);
console.log(profile3);
console.log(profile.lastIndexOf("Name:John Samuel"));
console.log(profile3.slice(5));
console.log(profile3.shift());
profile3[0] = "Name:John Samuel";
console.log(profile3);
