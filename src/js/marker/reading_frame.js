class Queue {
    constructor() {
        this.elements = {};
        this.head = 0;
        this.tail = 0;
    }
    enqueue(element) {
        this.elements[this.tail] = element;
        this.tail++;
    }
    dequeue() {
        const item = this.elements[this.head];
        delete this.elements[this.head];
        this.head++;
        return item;
    }
    peek() {
        return this.elements[this.head];
    }
    get length() {
        return this.tail - this.head;
    }
    get isEmpty() {
        return this.length === 0;
    }
}

class ReadingFrame {
    constructor(maximum_number_of_words = 40) {
        this.maximum_number_of_words = maximum_number_of_words;
        this.current_position = 0;
        this.words_to_labels = {};
        this.labels_to_words = Array(maximum_number_of_words).fill(NaN);
        this.number_of_words_scanned = 0;
    }

    isFull() {
        return this.number_of_words_scanned > this.maximum_number_of_words;
    }

    word_first_label(word) {
        return word == word &&
            typeof word !== undefined &&
            word in this.words_to_labels
            ? this.words_to_labels[word].peek()
            : NaN;
    }

    append(word) {
        this.number_of_words_scanned++;
        // If the frame is full, we need to delete the leftmost word from dictionary
        if (this.isFull()) {
            let previous_word = this.labels_to_words[this.current_position];
            this.words_to_labels[previous_word].dequeue();
            if (this.words_to_labels[previous_word].isEmpty) {
                delete this.words_to_labels[previous_word];
            }
        }

        if (!(word in this.words_to_labels)) {
            this.words_to_labels[word] = new Queue();
        }
        this.words_to_labels[word].enqueue(this.current_position);
        this.labels_to_words[this.current_position] = word;
        this.current_position++;
        if (this.current_position == this.maximum_number_of_words) {
            this.current_position = 0;
        }
    }
}

export default ReadingFrame;
