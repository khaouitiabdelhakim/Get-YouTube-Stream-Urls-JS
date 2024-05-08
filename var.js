const mainDecipherFunct = "var ZNa=function(a){a=a.split(\"\");$O.W4(a,1);$O.Rv(a,29);$O.Rv(a,39);$O.W4(a,2);$O.UD(a,7);return a.join(\"\")};";

// Define your regular expression to match variable names
const patVariableFunction = /\$[a-zA-Z_$][a-zA-Z0-9_$]*/g;

let matchCount = 0;
let mat;

while ((mat = patVariableFunction.exec(mainDecipherFunct)) !== null) {
    const variableName = mat[0]; // The matched variable name
    console.log(`Variable: ${variableName}`);
    matchCount++;

    // You can add a condition here to break after a certain number of matches if needed
}

console.log(`Total Matches Found: ${matchCount}`);
