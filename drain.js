// version 3

// state
let deg = true;

// sorts
const ASCENDING = (a, b) => a - b;
const DESCENDING = (a, b) => b - a;

// constants
const PI = Math.PI;
const E = Math.E;
const DTR = Math.PI/180;
const RTD = 180/Math.PI;

// helpers for trig
const _tf = func => x => deg ? func(x * DTR) : func(x);
const _itf = func => x => deg ? func(x) * RTD : func(x);

// trig funcs
const sin = _tf(Math.sin);
const cos = _tf(Math.cos);
const tan = _tf(Math.tan);
const csc = _tf(x => 1 / Math.sin(x));
const sec = _tf(x => 1 / Math.cos(x));
const cot = _tf(x => 1 / Math.tan(x));
const asin = _itf(Math.asin);
const acos = _itf(Math.acos);
const atan = _itf(Math.atan);

// other misc functions
const abs = Math.abs;
const round = Math.round;
const floor = Math.floor;
const ceil = Math.ceil;
const pow = Math.pow;
const max = Math.max;
const min = Math.min;

// random funcs
// todo: various distributions (normal, etc.)
const random = Math.random;
const randomReal = (min, max) => min + Math.random() * (max - min);
const randomInt = (min, max) => Math.floor(randomReal(min, max + 1));

// logarithms
const log = (x, base) => base ? Math.log(x)/Math.log(base) : Math.log(x);
const ln = x => log(x, E);

// roots
const root = (val, pow) => Math.pow(val, 1 / pow);
const sqrt = Math.sqrt;
const cbrt = Math.cbrt;

// vector ops
const length = vector => Math.sqrt(vector.reduce((accum, cur) => accum + cur * cur, 0));
const dot = (A, B) => A.reduce((accum, cur, index) => accum + cur * B[index], 0);

// combinatorics
const factorial = n => { let r = 1; for(let i = 1; i <= n; i++) r *= i; return r; }
const ncr = (n, r) => factorial(n) / (factorial(n - r) * factorial(r));

// other arr operations
const range = (start, end) => Array.from({length: Math.abs(end - start) + 1}, (x, i) => start + i * Math.sign(end - start));
const createArr = (count, func) => Array.from({length: count}, func);

// quadratic
const discrim = (a, b, c) => b * b - 4 * a * c;
const solveQuadratic = (a, b, c) => {
    const disc = discrim(a, b, c);
    if(disc < 0) return [];
    if(disc < Number.EPSILON) return [-b / (2*a)];
    const _disc = Math.sqrt(disc);
    return [(-b+_disc)/2*a, (-b-disc)/2*a];
};

// stats
const chisquare = (observed, expected) => expected.map((e, i) => (observed[i] - e)**2/e).reduce((a,c) => a + c, 0);

const linear = (slope, intercept) => (x) => x * slope + intercept;

const linReg = (x, y, population) => {
    if(x.length != y.length) throw new Error("list length mismatch");
    const xbar = x.mean(), ybar = y.mean();
    const slope = x.map((x,i) => (x - xbar) * (y[i] - ybar)).sum() / x.map(x => (x - xbar)**2).sum();
    const intercept = (y.sum() - slope * x.sum()) / x.length;
    const sdx = x.stddev(), sdy = y.stddev();
    const r = x.map((x, i) => (x - xbar) / sdx * (y[i] - ybar) / sdy).sum() / (population ? x : x.length - 1); // bessel correction
    return {slope, intercept, r, regEq: linear(slope, intercept)};
};

const residuals = (xlist, ylist, regEq) => xlist.map((x, i) => ylist[i] - regEq(x));
const rss = (xlist, ylist, regEq) => residuals(xlist, ylist, regEq).map(x => x ** 2).sum();
const tss = (arr) => arr.map(y => (y - arr.mean())**2).sum();
const r2 = (xlist, ylist, regEq) => 1 - rss(xlist, ylist, regEq) / tss(ylist);

const boxplot = (arr) => {
    arr.sort(ASCENDING);
    const q1 = arr.q1();
    const q3 = arr.q3();
    const iqr = q3 - q1;
    const median = arr.median();
    const lowerMild = q1 - iqr * 1.5, upperMild = q3 + iqr * 1.5;
    const min = arr.min(lowerMild), max = arr.max(upperMild);
    const lowerExtreme = q1 - iqr * 3, upperExtreme = q3 + iqr * 3;
    const mildOutliers = arr.filter(x => (x < lowerMild && x > lowerExtreme) || (x > upperMild && x < upperExtreme));
    const extremeOutliers = arr.filter(x => (x < lowerExtreme) || (x > upperExtreme));
    return {q1, q3, iqr, median, min, max, mildOutliers, extremeOutliers};
};

// google sheets copy paste helpers
const col = arr => console.log(arr.join("\n"));

// helper
const nullIfEmpty = arr => arr.length == 0 ? null : arr;

// prototype injects
Object.defineProperty(Array.prototype, "objMap", {value: function(func) { return Object.fromEntries(this.map(elem => [elem, func(elem)])); }});
Object.defineProperty(Array.prototype, "sum", {value: function() { return this.reduce((a, c) => a + c, 0); }});
Object.defineProperty(Array.prototype, "mean", {value: function() { return this.sum() / this.length; }});
Object.defineProperty(Array.prototype, "pick", {value: function() { return this[floor(random() * this.length)]; }});
Object.defineProperty(Array.prototype, "min", {value: function(limit) { return nullIfEmpty(this.filter(x => x > limit))?.reduce((a, c) => Math.min(a, c)); }});
Object.defineProperty(Array.prototype, "max", {value: function(limit) { return nullIfEmpty(this.filter(x => x < limit))?.reduce((a, c) => Math.max(a, c)); }});
Object.defineProperty(Array.prototype, "variance", {value: function(population) { const mean = this.mean(); return this.reduce((a, c) => a + (c - mean) ** 2, 0) / (population ? this.length : this.length - 1) }}); // "population" = bessel correction
Object.defineProperty(Array.prototype, "stddev", {value: function(population) { return Math.sqrt(this.variance(population)); } });
Object.defineProperty(Array.prototype, "pluck", {value: function(property) { return this.map(el => el[property]); } });
Object.defineProperty(Array.prototype, "quartile", {value: function(position) {
    let pos = this.length * position;
    if(pos % 1) {
        pos = Math.trunc(pos);
        return (this[pos - 1] + this[pos]) / 2;
    }
    return this[pos];
}});
Object.defineProperty(Array.prototype, "median", {value: function() { return this.quartile(1/2); }});
Object.defineProperty(Array.prototype, "q1", {value: function() { return this.quartile(1/4); }});
Object.defineProperty(Array.prototype, "q3", {value: function() { return this.quartile(3/4); }});
Object.defineProperty(Array.prototype, "iqr", {value: function() { return this.q3() - this.q1() }});
Object.defineProperty(Array.prototype, "shuffle", {value: function() {
    for(let i = this.length - 1; i > 0; i--) {
        const j = randomInt(0, i);
        const temp = this[i];
        this[i] = this[j];
        this[j] = temp;
    }
    return this;
}});
Object.defineProperty(Array.prototype, "zscore", {value: function(value) {
    return (value - this.mean()) / this.stddev();
}});
