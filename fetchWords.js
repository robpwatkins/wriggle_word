const { writeFileSync } = require('fs');

const fetchWords = async () => {
  const minLength = 4;
  const maxLength = 8;
  const response = await (
    await fetch(`https://api.wordnik.com/v4/words.json/randomWords?minCorpusCount=99999&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=${minLength}&maxLength=${maxLength}&limit=500&api_key=${process.env.WORDNIK_API_KEY}`)
  ).json();
  const words = response
    .map(wordObj => wordObj.word)
    .filter(word => (
      word.charAt(0).toUpperCase() !== word.charAt(0) &&
      !word.includes("'")
    ));

  writeFileSync('words.json', JSON.stringify(words, null, 2));
};

fetchWords();