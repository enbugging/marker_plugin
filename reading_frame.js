import Denque from "denque";

export class ReadingFrame {
    constructor(maximum_number_of_words = 40) {
        this.maximum_number_of_words = maximum_number_of_words;
        this.current_position = 0;
        this.words_to_labels = {};
        this.labels_to_words = Array(maximum_number_of_words).fill(0);
        this.number_of_words_scanned = 0;
    }

    isfull() {
        return this.number_of_words_scanned > this.maximum_number_of_words;
    }

    word_first_label(word) {
        return word in this.words_to_labels
            ? NaN
            : this.words_to_labels[word][0];
    }

    append(word) {
        this.number_of_words_scanned++;
        // If the frame is full, we need to delete the leftmost word from dictionary
        if (this.isfull()) {
            let previous_word = this.labels_to_words[this.current_position];
            this.words_to_labels[previous_word].shift();
            if (this.words_to_labels[previous_word].isEmpty()) {
                delete this.words_to_labels[previous_word];
            }
        }

        if (word in this.words_to_labels) {
            this.words_to_labels[word] = new Denque();
        }
        this.words_to_labels[word].push(this.current_position);
        this.labels_to_words[this.current_position] = word;
        this.current_position++;
        if (this.current_position == this.maximum_number_of_words) {
            this.current_position = 0;
        }
    }
}
