const { writeFileSync } = require('fs');
const scrabbleWords = require('./scrabbleWords.json');

(() => {
  const relevantScrabbleWords = scrabbleWords.filter(w => (w.length > 3 && w.length < 9));
  const wordsWithAnagrams = [];
  const wordsWithoutAnagrams = [];

  relevantScrabbleWords.forEach((word, idx) => {
    const equalLengthWords = scrabbleWords.filter(w => (w !== word && w.length === word.length));
    const sortedWord = word.split('').sort().join('');
    const anagram = equalLengthWords
      .map(w => w.split('').sort().join(''))
      .find(w => w === sortedWord);

    if (anagram) wordsWithAnagrams.push(word);
    else wordsWithoutAnagrams.push(word);

    if (idx % 1000 === 1) {
      console.log({ idx });
      console.log('wordsWithoutAnagrams: ', wordsWithoutAnagrams.length);
    }
  });

  writeFileSync('wordsWithAnagrams.json', JSON.stringify(wordsWithAnagrams, null, 2));
  writeFileSync('wordsWithoutAnagrams.json', JSON.stringify(wordsWithoutAnagrams, null, 2));
})();