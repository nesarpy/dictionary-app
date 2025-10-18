import { useState } from 'react';
import WordCard from './components/WordCard';

function App() {
  const [word, setWord] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  async function searchWord() {
    if (!word.trim()) {
      alert("Please enter a word to search");
      return;
    }

    setLoading(true);
    setResult(null);

    // Retry logic with multiple attempts
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        setLoadingMessage("Searching...");
        
        const res = await fetch(`/api/api/v2/entries/en/${word}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'DictionaryApp/1.0'
          },
          signal: AbortSignal.timeout(10000)
        });
        
        if (!res.ok) {
          if (res.status === 522 || res.status === 503 || res.status === 504) {
            throw new Error(`Server error: ${res.status}`);
          } else if (res.status === 404) {
            throw new Error(`Word not found: ${res.status}`);
          } else {
            throw new Error(`HTTP error: ${res.status}`);
          }
        }
        
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          if (data[0].meanings && data[0].meanings.length > 0) {
            if (data[0].meanings[0].definitions && data[0].meanings[0].definitions.length > 0) {
              const meaning = data[0].meanings[0].definitions[0].definition;
              const example = data[0].meanings[0].definitions[0].example || "No example available.";
              const pronunciation = data[0].phonetics && data[0].phonetics.length > 0 ? data[0].phonetics[0]?.text || "Not available" : "Not available";
              
              setResult({
                Error: false,
                word: data[0].word,
                meaning,
                example,
                pronunciation
              });
              setLoading(false);
              return;
            } else {
              setResult({
                Error: true,
                word: word,
                message: "No definitions found for this word"
              });
              setLoading(false);
              return;
            }
          } else {
            setResult({
              Error: true,
              word: word,
              message: "No meanings found for this word"
            });
            setLoading(false);
            return;
          }
        } else {
          setResult({
            Error: true,
            word: word,
            message: data.message || "Word not found"
          });
          setLoading(false);
          return;
        }
        
      } catch (error) {
        if (attempt === maxRetries) {
          setResult({
            Error: true,
            word: word,
            message: "Unable to fetch word definition. Please try again later."
          });
          setLoading(false);
          return;
        }
        
        const delay = Math.pow(2, attempt) * 1000;
        setLoadingMessage("Retrying...");
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  const handleKeyDown = (event) => {
    if (event.key == "Enter") {
      searchWord()
    }
  }


  return(
    <div>
      <h1>Dictionary</h1>
      <div className="search-container">
        <input 
        type="text" 
        value={word} 
        onChange={e => setWord(e.target.value)} 
        placeholder="Enter a word..."
        onKeyDown={handleKeyDown}
        />
        <button onClick={searchWord} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {loading && <div style={{textAlign: 'center', color: '#ffffff', marginTop: '2rem'}}>{loadingMessage}</div>}
      {result && <WordCard {...result} />}
    </div>
  );
}

export default App;
