/*
Checks if a number is (close enough) to zero.
Due to the imprecise way floating number data can be stored, it's possible for
a mathematical 0 to be represented as something incredibly small like
1.4210854715202004e-14. This screws boolean checks like (num === 0)
 */
export function isZero (num) {
  return -1e-10 < num && num < 1e-10
}

/*
Finds the difference between angle B and angle A, in radians.
 */
export function angleDiff (angleA, angleB) {
  let diff = angleB - angleA

  // Clamp diff value to -180º <= x <= +180º
  while (diff < -Math.PI) diff += Math.PI * 2  // While diff < -180º, rotate by +360º
  while (diff > Math.PI) diff -= Math.PI * 2  // While diff > 180º, rotate by -360º

  return diff
}

/*
Simple ease out function for animations. Fast start, slow end.
Input: 0.0 to 1.0 , Output: 0.0 to 1.0
 */
export function easeOut (x = 0) {
  const y = Math.min(Math.max(x, 0), 1)
  return y * (2 - y)
}

/*
Simple ease in function for animations. Slow start, fast end.
Input: 0.0 to 1.0 , Output: 0.0 to 1.0
 */
export function easeIn (x = 0) {
  const y = Math.min(Math.max(x, 0), 1)
  return y * y
}

/*
Simple ease-in-out function for animations. Slow start, slow end.
Input: 0.0 to 1.0 , Output: 0.0 to 1.0
 */
export function easeInOut (x = 0) {
  const y = Math.min(Math.max(x, 0), 1)
  return y * y * (3 - 2 * y)
}
