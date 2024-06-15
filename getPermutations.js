const { writeFileSync } = require('fs');
const words = require('./words.json');
const fiveLettersMax = words.filter(word => word.length < 6);

(async () => {
  let wordCount = 1;

  for await (const word of fiveLettersMax) {
    console.log(`----------------------------${wordCount}: ${word}----------------------------`);

    const permutations = permute(word.split(''));
    const permutationsData = [];
    let permCount = 1;
    
    for await (const permutation of permutations) {
      console.log(`${permCount}: ${permutation}`);

      const response = await (
        await fetch(`https://api.wordnik.com/v4/word.json/${permutation}/frequency?api_key=${process.env.WORDNIK_API_KEY}`)
      ).json();

      if (response.totalCount) {
        console.log(`adding ${permutation}`);

        permutationsData.push({
          word: permutation,
          corpus_count: response.totalCount
        });
      } else if (response.message && response.message.includes('API')) {
        console.log('message: ', response.message);
      }

      await timeout(4500);

      permCount++;
    }

    const runningPermutations = require('./permutations.json');

    runningPermutations.push(permutationsData);

    writeFileSync('permutations.json', JSON.stringify(runningPermutations, null, 2));

    wordCount++;
  }
})();

function timeout(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

function permute(permutation) {
  var length = permutation.length,
      result = [permutation.slice().join('')],
      c = new Array(length).fill(0),
      i = 1, k, p;

  while (i < length) {
    if (c[i] < i) {
      k = i % 2 && c[i];
      p = permutation[i];
      permutation[i] = permutation[k];
      permutation[k] = p;
      ++c[i];
      i = 1;
      result.push(permutation.slice().join(''));
    } else {
      c[i] = 0;
      ++i;
    }
  }
  return result;
}