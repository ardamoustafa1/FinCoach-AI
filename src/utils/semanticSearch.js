function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\sğüşöçıİĞÜŞÖÇ]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 1);
}

export function calculateCosineSimilarity(query, txs) {
  if (!txs || txs.length === 0) return [];

  const vocab = new Set();
  const queryTokens = tokenize(query);
  queryTokens.forEach(token => vocab.add(token));

  const txTokensList = txs.map(tx => {
    const tokens = tokenize(`${tx.aciklama || ''} ${tx.magaza || ''} ${tx.kategori || ''}`);
    tokens.forEach(token => vocab.add(token));
    return tokens;
  });

  const vocabArray = Array.from(vocab);
  const queryVector = vocabArray.map(word => (queryTokens.includes(word) ? 1 : 0));

  return txs.map((tx, idx) => {
    const tokens = txTokensList[idx];
    const txVector = vocabArray.map(word => (tokens.includes(word) ? 1 : 0));

    let dotProduct = 0;
    let queryNorm = 0;
    let txNorm = 0;

    for (let i = 0; i < vocabArray.length; i += 1) {
      dotProduct += queryVector[i] * txVector[i];
      queryNorm += queryVector[i] * queryVector[i];
      txNorm += txVector[i] * txVector[i];
    }

    const similarity = queryNorm > 0 && txNorm > 0
      ? dotProduct / (Math.sqrt(queryNorm) * Math.sqrt(txNorm))
      : 0;

    return {
      tx,
      similarity: Number(similarity.toFixed(4)),
    };
  })
    .filter(result => result.similarity > 0.05)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3);
}
