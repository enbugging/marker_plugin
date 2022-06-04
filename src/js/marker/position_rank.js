import ReadingFrame from "./reading_frame.js";

class PositionRank extends ReadingFrame {
    constructor(
        maximum_number_of_words = 40,
        token_window_size = 7,
        alpha = 0.15
    ) {
        super(maximum_number_of_words);
        this.token_window_size = token_window_size;
        this.alpha = alpha;
        this.weight = Array.from(Array(maximum_number_of_words), () =>
            Array(maximum_number_of_words).fill(0)
        );
    }

    update_weights(label, left_lim, right_lim, change) {
        if (right_lim <= this.maximum_number_of_words) {
            for (let i = left_lim; i < right_lim; i++) {
                let temporary_label = this.word_first_label(
                    this.labels_to_words[i]
                );
                if (
                    typeof temporary_label !== undefined &&
                    temporary_label === temporary_label
                ) {
                    this.weight[label][temporary_label] += change;
                    this.weight[temporary_label][label] += change;
                }
            }
        } else {
            right_lim -= this.maximum_number_of_words;
            for (let i = left_lim; i < this.maximum_number_of_words; i++) {
                let temporary_label = this.word_first_label(
                    this.labels_to_words[i]
                );
                if (
                    typeof temporary_label !== undefined &&
                    temporary_label === temporary_label
                ) {
                    this.weight[label][temporary_label] += change;
                    this.weight[temporary_label][label] += change;
                }
            }
            for (let i = 0; i < right_lim; i++) {
                let temporary_label = this.word_first_label(
                    this.labels_to_words[i]
                );
                if (
                    typeof temporary_label !== undefined &&
                    temporary_label === temporary_label
                ) {
                    this.weight[label][temporary_label] += change;
                    this.weight[temporary_label][label] += change;
                }
            }
        }
    }

    append(word) {
        let previous_id = this.current_position;
        let word_to_pop = this.labels_to_words[previous_id];
        let old_label_word_to_pop = this.word_first_label(word_to_pop);
        if (
            typeof old_label_word_to_pop !== undefined &&
            old_label_word_to_pop === old_label_word_to_pop
        ) {
            if (super.isFull()) {
                /*
            If the reading frame is complete, we would need 
            to pop the leftmost word from the frame.
            */
                // Pop the old word
                if (
                    this.number_of_words_scanned >=
                    2 * this.maximum_number_of_words
                ) {
                    this.update_weights(
                        old_label_word_to_pop,
                        previous_id - this.token_window_size + 1,
                        previous_id,
                        -1
                    );
                    this.update_weights(
                        old_label_word_to_pop,
                        previous_id + 1,
                        previous_id + this.token_window_size,
                        -1
                    );
                } else {
                    this.update_weights(
                        old_label_word_to_pop,
                        Math.max(previous_id - this.token_window_size + 1, 0),
                        previous_id,
                        -1
                    );
                }
            }
        }
        let old_label_word_to_push = this.word_first_label(word);
        super.append(word);
        let new_label_word_to_push = this.word_first_label(word);

        if (super.isFull()) {
            // If the old word still occurs, we need to transfer adjacency list to the new label
            let new_label_word_to_pop = this.word_first_label(word_to_pop);
            if (
                typeof new_label_word_to_pop !== undefined &&
                new_label_word_to_pop == new_label_word_to_pop
            ) {
                for (let i = 0; i < this.maximum_number_of_words; i++) {
                    this.weight[new_label_word_to_pop][i] =
                        this.weight[old_label_word_to_pop][i];
                    this.weight[i][new_label_word_to_pop] =
                        this.weight[i][old_label_word_to_pop];
                }
            }
        }

        if (
            typeof old_label_word_to_push !== undefined &&
            old_label_word_to_push == old_label_word_to_push &&
            old_label_word_to_push != new_label_word_to_push
        ) {
            for (let i = 0; i < this.maximum_number_of_words; i++) {
                this.weight[new_label_word_to_push][i] =
                    this.weight[old_label_word_to_push][i];
                this.weight[i][new_label_word_to_push] =
                    this.weight[i][old_label_word_to_push];
            }
        }
        // Push the new word
        if (super.isFull()) {
            this.update_weights(
                new_label_word_to_push,
                previous_id - this.token_window_size + 1,
                previous_id,
                1
            );
            this.update_weights(
                new_label_word_to_push,
                previous_id + 1,
                previous_id + this.token_window_size,
                1
            );
        } else {
            this.update_weights(
                new_label_word_to_push,
                Math.max(previous_id - this.token_window_size + 1, 0),
                previous_id,
                1
            );
        }
    }

    extract_boldness() {
        if (this.number_of_words_scanned <= 1) {
            return Array(this.number_of_words_scanned).fill(1.0);
        }
        console.log(this.words_to_labels);
        let id_to_word = Object.keys(this.words_to_labels).map((w) => {
            return [this.word_first_label(w), w];
        });
        let number_of_distinct_words = id_to_word.length;
        let word_to_id = {};
        id_to_word.forEach((w, i) => {
            word_to_id[w[0]] = i;
        });

        let number_of_words = Math.min(
            this.maximum_number_of_words,
            this.number_of_words_scanned
        );
        let total_weights = Array(number_of_distinct_words).fill(0);
        for (let i = 0; i < number_of_distinct_words; i++) {
            for (let j = 0; j < number_of_distinct_words; j++) {
                total_weights[i] +=
                    this.weight[id_to_word[i][0]][id_to_word[j][0]];
            }
        }

        let scores = Array(number_of_distinct_words).fill(
            1.0 / number_of_distinct_words
        );
        for (let _ = 0; _ < 5; _++) {
            let new_scores = Array(number_of_distinct_words).fill(0);
            for (let i = 0; i < number_of_distinct_words; i++) {
                let sigma = 0;
                for (let j = 0; j < number_of_distinct_words; j++) {
                    if (this.weight[id_to_word[i][0]][id_to_word[j][0]] !== 0) {
                        sigma +=
                            (scores[j] *
                                this.weight[id_to_word[i][0]][
                                    id_to_word[j][0]
                                ]) /
                            total_weights[j];
                    }
                    new_scores[i] =
                        this.alpha / number_of_distinct_words +
                        (1.0 - this.alpha) * sigma;
                }
                scores = new_scores;
            }
        }
        let boldness_scores = [...Array(number_of_words)].map((_, i) => {
            return scores[
                word_to_id[this.word_first_label(this.labels_to_words[i])]
            ];
        });
        if (super.isFull()) {
            let rotate = this.maximum_number_of_words - this.current_position;
            rotate -=
                boldness_scores.length *
                Math.floor(rotate / boldness_scores.length);
            boldness_scores.push.apply(
                boldness_scores,
                boldness_scores.splice(0, rotate)
            );
        }
        return boldness_scores;
    }
}

export default PositionRank;
