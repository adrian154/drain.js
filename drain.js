// version 3
// * all internal functions start with capital letters

// settings
let DEGREES = true;

// sorts
const ASCENDING = (a, b) => a - b;
const DESCENDING = (a, b) => b - a;

// useful functional ops
const zipWith = (A, B, func) => {
    if(A.length != B.length) throw new Error("Array length mismatch");
    return A.map((e, i) => func(e, B[i]));
};

// function generators
const Inverse = func => (t => 1 / func(t));
const Pluck = property => (object => object[property]); 
const Pair = (A, B) => [A, B];

// constants
const PI = Math.PI;
const E = Math.E;

// conversion factors
const ToRad = Math.PI / 180;
const ToDeg = 180 / Math.PI;

// trig func wrappers
const MakeTrigFunc =        func => (t => DEGREES ? func(t * ToRad) : func(t));
const MakeInverseTrigFunc = func => (t => DEGREES ? func(t) * ToDeg : func(t));

// trig funcs
const sin = MakeTrigFunc(Math.sin),
      cos = MakeTrigFunc(Math.cos),
      tan = MakeTrigFunc(Math.tan),
      csc = MakeTrigFunc(Inverse(Math.sin)),
      sec = MakeTrigFunc(Inverse(Math.cos)),
      cot = MakeTrigFunc(Inverse(Math.tan));

// inverse trig
const asin = MakeInverseTrigFunc(Math.asin),
      acos = MakeInverseTrigFunc(Math.acos),
      atan = MakeInverseTrigFunc(Math.atan);

// atan2
const atan2 = (y, x) => Math.atan2(y, x) * (DEGREES ? ToDeg : 1);

// rounding funcs
const round = Math.round,
      floor = Math.floor,
      ceil = Math.ceil;

// misc funcs
const abs = Math.abs,
      pow = Math.pow,
      max = Math.max,
      min = Math.min,
      sign = Math.sign;

// random funcs
// todo: various distributions (normal, etc.)
const random = Math.random;
const randomReal = (min, max) => min + random() * (max - min);
const randomInt = (min, max) => floor(randomReal(min, max + 1));

// logarithms
const log = (x, base) => base ? Math.log(x) / Math.log(base) : Math.log(x);
const ln = x => log(x, E);

// roots
const nthRoot = (val, pow) => pow(val, 1 / pow);
const sqrt = Math.sqrt;
const cbrt = Math.cbrt;

// vector ops
const add = (A, B) => zipWith(A, B, (x, y) => x + y);
const sub = (A, B) => zipWith(A, B, (x, y) => x - y);
const dot = (A, B) => zipWith(A, B, (x, y) => x * y);
const mul = dot;
const div = (A, B) => zipWith(A, B, (x, y) => x / y);

const lengthSquared = vec => dot(vec, vec);
const length = vec => sqrt(lengthSquared(vec));

// matrix
// matrices are stored as arrays of rows
const col = (mat, c) => mat.map(row => row[c]);
const mmul = (A, B) => A.map(row => row.map((_, i) => dot(row, col(B, i))));

// combinatorics
const factorial = n => {
    let r = 1;
    for(let i = 1; i <= n; i++) {
        r *= i;
    }
    return r;
}

const npr = (n, r) => factorial(n) / factorial(n - r);
const ncr = (n, r) => factorial(n) / (factorial(n - r) * factorial(r));

// other arr operations
const range = (start, end) => Array.from({length: abs(end - start) + 1}, (_, i) => start + i * sign(end - start));
const fillArray = (count, func) => Array.from({length: count}, func);

// quadratic
const discrim = (a, b, c) => b * b - 4 * a * c;
const solveQuadratic = (a, b, c) => {

    const discrimSquared = discrim(a, b, c);
    if(discrimSquared < 0) return [];
    if(discrimSquared < Number.EPSILON) return [-b / (2*a)]; // almost 0 but not negative

    const disc = sqrt(discrimSquared); 
    return [
        (-b + disc) / 2 / a,
        (-b - disc) / 2 / a
    ];

};

// statistical tests
const chiSquare = (observed, expected) => zipWith(observed, expected, (o, e) => (o - e)**2 / e).sum();

// more function generators
const LinearEquation = (slope, intercept) => (x) => x * slope + intercept;

// helper: apply bessel correction to `n` based on whether samples are an entire population or not
const BesselCorrect = (n, population) => population ? n : n - 1;

// least-squares linear regression
const linReg = (xlist, ylist, population) => {

    const xbar = xlist.mean(), ybar = ylist.mean();
    const slope = zipWith(xlist, ylist, (x, y) => (x - xbar) * (y - ybar)).sum() /
                  xlist.map(x => (x - xbar)**2).sum();

    const intercept = (ylist.sum() - slope * xlist.sum()) / xlist.length;
    
    // calculate `r`
    const sdx = xlist.stddev(), sdy = ylist.stddev();
    const r = zipWith(xlist, ylist, (x, y) => (x - xbar) / sdx * (y - ybar) / sdy).sum() / BesselCorrect(xlist.length, population);

    return {slope, intercept, r, regEq: LinearEquation(slope, intercept)};

};

const residuals = (xlist, ylist, regEq) => zipWith(xlist, ylist, (x, y) => y - regEq(x));
const rss = (xlist, ylist, regEq) => residuals(xlist, ylist, regEq).map(x => x ** 2).sum();
const tss = (arr) => arr.map(y => (y - arr.mean())**2).sum();
const r2 = (xlist, ylist, regEq) => 1 - rss(xlist, ylist, regEq) / tss(ylist);

const boxplot = (arr) => {
 
    arr.sort(ASCENDING);
 
    // basic stats
    const q1 = arr.q1(),
          q3 = arr.q3(),
          iqr = q3 - q1,
          median = arr.median();
    
    // calculate outlier thresholds
    const lowerMild = q1 - iqr * 1.5, upperMild = q3 + iqr * 1.5;
    const lowerExtreme = q1 - iqr * 3, upperExtreme = q3 + iqr * 3;

    // identify minimum and maximum
    const min = arr.min(lowerMild), max = arr.max(upperMild);
    
    const mildOutliers = arr.filter(x => (x < lowerMild && x > lowerExtreme) || (x > upperMild && x < upperExtreme));
    const extremeOutliers = arr.filter(x => (x < lowerExtreme) || (x > upperExtreme));

    return {q1, q3, iqr, median, min, max, mildOutliers, extremeOutliers};

};

// helper
const nullIfEmpty = arr => arr.length == 0 ? null : arr;

// prototype injects
Object.defineProperty(Array.prototype, "objMap", {value: function(func) { return Object.fromEntries(this.map(elem => [elem, func(elem)])); }});
Object.defineProperty(Array.prototype, "sum", {value: function() { return this.reduce((a, c) => a + c, 0); }});
Object.defineProperty(Array.prototype, "pick", {value: function() { return this[floor(random() * this.length)]; }});
Object.defineProperty(Array.prototype, "min", {value: function(limit) { return nullIfEmpty(this.filter(x => x > limit))?.reduce((a, c) => Math.min(a, c)); }});
Object.defineProperty(Array.prototype, "max", {value: function(limit) { return nullIfEmpty(this.filter(x => x < limit))?.reduce((a, c) => Math.max(a, c)); }});
Object.defineProperty(Array.prototype, "pluck", {value: function(property) { return this.map(el => el[property]); } });

// statistics funcs for arrays
Object.defineProperty(Array.prototype, "mean", {value: function() { return this.sum() / this.length; }});
Object.defineProperty(Array.prototype, "variance", {value: function(population) { const mean = this.mean(); return this.reduce((a, c) => a + (c - mean) ** 2, 0) / (population ? this.length : this.length - 1) }}); // "population" = bessel correction
Object.defineProperty(Array.prototype, "stddev", {value: function(population) { return Math.sqrt(this.variance(population)); } });
Object.defineProperty(Array.prototype, "median", {value: function() { return this.quartile(1/2); }});
Object.defineProperty(Array.prototype, "q1", {value: function() { return this.quartile(1/4); }});
Object.defineProperty(Array.prototype, "q3", {value: function() { return this.quartile(3/4); }});
Object.defineProperty(Array.prototype, "iqr", {value: function() { return this.q3() - this.q1() }});

Object.defineProperty(Array.prototype, "quartile", {value: function(position) {
    let pos = this.length * position;
    if(pos % 1) {
        pos = Math.trunc(pos);
        return (this[pos - 1] + this[pos]) / 2;
    }
    return this[pos];
}});


Object.defineProperty(Array.prototype, "zscore", {value: function(value) {
    return (value - this.mean()) / this.stddev();
}});

// misc.
Object.defineProperty(Array.prototype, "shuffle", {value: function() {
    for(let i = this.length - 1; i > 0; i--) {
        const j = randomInt(0, i);
        const temp = this[i];
        this[i] = this[j];
        this[j] = temp;
    }
    return this;
}});
