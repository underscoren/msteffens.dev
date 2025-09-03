// log and antilog tables for Galois Field 2^8 multiplication in constant time
export const antilog = [1];
export const log = [NaN]; // log(0) is undefined

// generate look up tables
for(let i = 1; i < 256; i++) {
  antilog[i] = antilog[i-1] << 1;
  
  if(antilog[i] > 255)
    antilog[i] = antilog[i] ^ 0x11D;
  
  log[antilog[i]] = i;
}

/** Galois Field (2^8) Multiplication */
function gfMult(a: number, b: number) {
  if (a == 0 || b == 0) // anything multiplied by 0 is 0
    return 0;
  
  return antilog[(log[a] + log[b]) % 255];
  // if you duplicate the antilog table you can skip the % 255
}

/** Galois Field (2^8) Division */
function gfDiv(a: number, b: number) {
  if (b == 0) // anything divided by zero is undefined (Not a Number)
    return NaN;
  
  if (a == 0) // 0 divided by anything is 0
    return 0;
  
  return antilog[(log[a] + 255 - log[b]) % 255];
  // 255 is added to make sure log[a] - log[b] is not negative
}

// log(n^p) = p, antilog(p * q) => (n^p)^q
function gfPower(n: number, p: number) {
  if (n == 0) return 0;

  const exponent = ((log[n] * p) % 255 + 255) % 255;
  return antilog[exponent];
}

function gfInverse(n: number) {
  return antilog[255 - log[n]];
}

/// polynomial math ///

/** Add two GF(2^8) polynomials together */
function addPoly(a: number[], b: number[]) {
  let result = [...a]; // copy a to the result
  
  // if a is smaller than b, pad with 0s to match the length
  if(a.length < b.length)
    result = [...(new Array(b.length - a.length).fill(0)), ...result];
  
  // add each element of b to the result
  // GF(2^8) addition is equivalent to XOR
  
  const bOffset = result.length - b.length; // how far into result does b start
  for(let i = 0; i < b.length; i++)
    result[i+bOffset] ^= b[i];
  
  return result;	
}

/** Multiply two GF(2^8) polynomials together */
function multPoly(a: number[], b: number[]) {
  const result = new Array(a.length + b.length - 1).fill(0);
  
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      result[i+j] ^= gfMult(a[i], b[j]);
  
  return result;
}

/** Multiply a GF(2^8) polynomial by a number */
function multPolyNum(p: number[], n: number) {
  return p.map(e => gfMult(e,n));
}

/** Evaluate a GF(2^8) polynomial at a given x using Horner's method */
function evalPoly(p: number[], x: number) {
  return p.reduce((sum, current) => gfMult(sum, x) ^ current);
}

/** Synthetic long division of two GF(2^8) polynomials */
function divPoly(a: number[], b: number[]) {
  const result = [...a];
  
  for(let i = 0; i < (a.length - (b.length - 1)); i++) {
    const coef = result[i];
    
    for(let j = 1; j < b.length; j++) {
      if(b[j] != 0)
        result[i+j] ^= gfMult(b[j], coef);
    }
  }
  
  const separator = -(b.length - 1);
  return [result.slice(0, separator), result.slice(separator)];
}



/// Reed Solomon ///

/**
* Calculate the syndromes for a particular message.
* 
* These serve as a detector for the presence of errors, and
* provide information needed to correct them as well
*/
export function calcSyndromes(msg: number[], numSyndromes: number) {
  const result = [];
  for(let i = 0; i < numSyndromes; i++) {
    result.push(evalPoly(msg, gfPower(2, i)));
  }
  
  result.unshift(0); // prepend 0 for some math reason
  return result;
}

/** Calculates an error locator polynomial, given an array of error indexes */
export function errataLocator(errorsPos: number[]) {
  let result = [1];
  
  for(const i of errorsPos) {
    // result = result * (1 - (alpha ^ i)x )
    result = multPoly(result, addPoly([1], [gfPower(2, i), 0]))
  }
  
  return result;
}

/** Calculate the error evaluator polynomial */
export function errorEvaluator(syndromes: number[], errLoc: number[], numSyndromes: number) {
  const padding = Array.from<number>({length: numSyndromes + 1}).fill(0);
  const [_, remainder] = divPoly(multPoly(syndromes, errLoc), [1, ...padding])
  
  return remainder;
}

/**
* Correct erasures at known positions in a message
* @param {number[]} msg the message data (data codewords + error correction codewords)
* @param {number[]} syndromes the message syndromes 
* @param {number[]} errorsPos the indices where the errors are
*/
export function correctErrata(msg: number[], syndromes: number[], errorsPos: number[]) {
  const coefPos = [];
  
  for(const p of errorsPos)
    coefPos.push(msg.length - 1 - p);
  
  const errLoc = errataLocator(coefPos);
  const errEval = errorEvaluator([...syndromes].reverse(), errLoc, errLoc.length-1).reverse();
  
  const X = [];
  for (let i = 0; i < coefPos.length; i++) {
    const l = 255 - coefPos[i];
    X.push(gfPower(2, -l))
  }
  
  const E = Array.from<number>({length: msg.length}).fill(0);
  for (let i = 0; i < X.length; i++) {
    const Xi = X[i];
    
    const XiInv = gfInverse(Xi);
    
    const errLocPrimeTmp = [];
    for(let j = 0; j < X.length; j++) {
      if(j != i)
        errLocPrimeTmp.push(1 ^ gfMult(XiInv, X[j]))
    }
    
    let errLocPrime = 1;
    for(const coef of errLocPrimeTmp) {
      errLocPrime = gfMult(errLocPrime, coef);
    }
    
    let y = evalPoly([...errEval].reverse(), XiInv);
    y = gfMult(gfPower(Xi, 1), y);
    
    if (errLocPrime == 0)
      throw new Error("Could not find error magnitude")
    
    const magnitude = gfDiv(y, errLocPrime);
    E[errorsPos[i]] = magnitude;
  }
  
  return addPoly(msg, E);
}