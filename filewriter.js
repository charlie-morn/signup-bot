a = {
    a: [{name: "Josh", cl: "Hunter"},{name: "Charlie", cl: "Hunter"},{name: "Ryno", cl: "Titan"}]
};
/*
console.log(a.a[0].name);
const b = a.a;
console.log(b.shift());
console.log(b.shift());
console.log(b.shift());
var c = b.shift();
if (typeof c === 'undefined'){
    console.log("C is undefined");
}
*/
var ret = "";
for (var i = 0; i<6; i++){
    if(typeof a.a[i]== 'undefined'){
        ret += String(i+1) + '. OPEN \n'
    }else{
        ret += String(i+1) + '. ' + a.a[i].name + ' - ' + a.a[i].cl + '\n'
    }
}
ret = ret.replace(/\n$/,"")
console.log(ret)