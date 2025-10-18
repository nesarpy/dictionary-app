function WordCard({Error, word, meaning, pronunciation, example, message}) {
    let output;

    if (!Error) {
        output = (
            <div className="word-card">
                <h2>{word}</h2>
                <p className="pronunciation">{pronunciation}</p>
                <p className="meaning">{meaning}</p>
                <div className="example">
                    <p><strong>Example:</strong> {example}</p>
                </div>
            </div>
        );
    } else {
        output = (
            <div className="word-card error-card">
                <h2>"{word}" not found!</h2>
                <p className="meaning">Sorry, we couldn't find the definition for this word.</p>
                {message && <p className="meaning">Error: {message}</p>}
                <p className="meaning">Please check the spelling or try a different word.</p>
                <img src="https://http.dog/404.jpg" alt="404 Error" />
            </div>
        );
    }

    return output;
}

export default WordCard;