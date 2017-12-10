const NLP = require("natural");

module.exports = class NLPHandler {
    constructor() {
        this.classifier = new NLP.BayesClassifier();
        this.minConfidence = 0.7;
    }
    teach(label, phrases) {
        phrases.forEach(phrase => {
            console.log(`Lira is learning new data for ${label}: ${phrase}`);
            this.classifier.addDocument(phrase.toLowerCase(), label);
        });
    }
    think() {
        console.log("Lira is thinking...");
        this.classifier.train();
    }
    interpret(phrase) {
        let guesses = this.classifier.getClassifications(phrase.toLowerCase()),
            guess = guesses.reduce((x, y) => x && x.value > y.value ? x : y);

        return {
            probabilities: guesses,
            guess: this.classifier.classify(phrase)
            // guess: guess.value > this.minConfidence ? guess.label : ""
        };
    }
};
