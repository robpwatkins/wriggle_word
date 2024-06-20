const { writeFileSync } = require('fs');
const currentWords = require('./words1.json');

const fetchWords = async () => {
  const minLength = 4;
  const maxLength = 6;
  const excludePartsOfSpeech = [
    'abbreviation',
    'affix',
    'conjunction',
    'family-name',
    'given-name',
    'idiom',
    'noun-posessive',
    'proper-noun',
    'proper-noun-plural',
    'proper-noun-posessive',
    'suffix'
  ];
  const response = await (
    await fetch(`https://api.wordnik.com/v4/words.json/randomWords?hasDictionaryDef=true&excludePartOfSpeech=${excludePartsOfSpeech.join('')}&minCorpusCount=99999&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=${minLength}&maxLength=${maxLength}&limit=500&api_key=${process.env.WORDNIK_API_KEY}`)
  ).json();
  const words = response
    .map(wordObj => wordObj.word)
    .filter(word => (
      word.charAt(0).toUpperCase() !== word.charAt(0) &&
      !word.includes("'")
    ));
  console.log('currentWords: ', currentWords.length);
  console.log('words: ', words.length);
  const uniqueWords1 = currentWords.filter((word) => words.indexOf(word) === -1);
  const uniqueWords2 = words.filter((word) => currentWords.indexOf(word) === -1);

  writeFileSync('words1.json', JSON.stringify(uniqueWords1.concat(uniqueWords2), null, 2));
};

fetchWords();