import PositionRank from "position_rank";
//sw = require("stopword");

function model_boldness(len, boldness = 1.0) {
    if (len <= 2) {
        return [...Array(len)].map((x) => boldness);
    }
    len -= 1;
    let a = Math.floor(len / 2);
    let result = Array(len).fill(0);
    for (let i = 0; i < len; i++) {
        result[i] = (max(i, len - i) / len) * boldness;
    }
    return boldness;
}

export function highlight(
    raw_text,
    maximum_number_of_words = 40,
    token_window_size = 7,
    alpha = 0.15,
    boldness_baseline = 0.2
) {
    let importance_assigner = PositionRank(
        maximum_number_of_words,
        token_window_size,
        alpha
    );
    // Preprocessing text
    let preprocess_text = raw_text.split(" ").map((w, id) => {
        return [
            id,
            w
                // Removing punctuation
                .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
                // Remove duplicate space
                .replace(/\s{2,}/g, " "),
        ];
    });
    let words_length = preprocess_text.map((w) => {
        return w.length;
    });
    let clean_text = [];
    for (let i = 0; i < preprocess_text.length; i++) {
        if (/[a-zA-Z0-9]/.test(preprocess_text[i][1])) {
            clean_text.push(preprocess_text[i]);
        }
    }

    let boldness_total_scores = Array(preprocess_text.length).fill(0);
    for (let [position, word] in enumerate(clean_text)) {
        importance_assigner.append(word);
        let offset = max(0, position - maximum_number_of_words);
        let boldness_scores = importance_assigner.extract_boldness();
        for (let i = 0; i < boldness_scores.length; i++) {
            boldness_total_scores[clean_text[i + offset]] +=
                boldness_scores[i] * boldness_scores.length;
        }
    }

    // Normalization
    for (let i = 0; i <= boldness_total_scores.length; i++) {
        let i = (number_of_scanned_frames =
            i >= boldness_total_scores.length
                ? boldness_total_scores.length - i
                : maximum_number_of_words);
        boldness_total_scores[i] /= number_of_scanned_frames;
    }
    normalization = Math.max(...boldness_total_scores);
    boldness_total_scores = boldness_total_scores.map((x) => {
        return (
            (x / normalization) * (1 - boldness_baseline) + boldness_baseline
        );
    });
    // Calculate boldness for each character
    let final_boldness = Array(raw_text.length).fill(0);
    let cnt = 0;
    for (let i = 0; i < words_length.length; i++)
    {
        let length = words_length[i];
        final_boldness.slice(cnt, cnt + length) = model_boldness(length, boldness_total_scores[i]);
        cnt++;
    }
    return final_boldness;
}
