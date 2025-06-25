const { rotateToPosition } = require('./utils');

// Test the rotation function
const originalArray = ['九', '二', '七', '六', '一', '八', '三', '四', '五'];

console.log('Original array:', originalArray);

// Test: rotate '二' to the last position
const rotatedArray = rotateToPosition(originalArray, '二');
console.log("After rotating '二' to last position:", rotatedArray);

// Expected result: ['七', '六', '一', '八', '三', '四', '五', '九', '二']
// Because '二' was at index 1, and we want it at index 8 (last position)
// So we shift by: 1 - 8 = -7 positions (rotate left by 7)

module.exports = { originalArray, rotatedArray }; 