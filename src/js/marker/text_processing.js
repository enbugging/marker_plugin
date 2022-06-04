import PositionRank from "./position_rank.js";
//const sw = require('stopword');

function model_boldness(len, boldness = 1.0) {
    if (len <= 2) {
        return [...Array(len)].map((x) => boldness);
    }
    len -= 1;
    let a = Math.floor(len / 2);
    let result = Array(len + 1).fill(0);
    for (let i = 0; i <= len; i++) {
        result[i] = (Math.max(i, len - i) / len) * boldness;
    }
    return result;
}

function highlight(
    raw_text,
    maximum_number_of_words = 40,
    token_window_size = 7,
    alpha = 0.15,
    boldness_baseline = 0.0,
    removeStopwords = false
) {
    let importance_assigner = new PositionRank(
        maximum_number_of_words,
        token_window_size,
        alpha
    );
    // Preprocessing text
    let preprocess_text = raw_text.split(" ");
    let word_lists = preprocess_text
        .map((w, id) => {
            //if (removeStopwords)
            //{
            //    w = sw.removeStopwords(w);
            //}
            return [
                id,
                w
                    // Remove duplicate space
                    .replace(/\s{2,}/g, " "),
            ];
        })
        .filter((w) => /[^\s\n]+/.test(w[0]));
    let words_length = word_lists.map((w) => {
        return w[1].length;
    });
    let clean_text = [];
    for (let i = 0; i < word_lists.length; i++) {
        if (/[a-zA-Z0-9]/.test(word_lists[i][1])) {
            clean_text.push(word_lists[i][1]);
        }
    }
    clean_text = clean_text.map((x, i) => [i, x]);

    let boldness_total_scores = Array(clean_text.length).fill(0);
    clean_text.forEach((x, position) => {
        var word = x[1];
        importance_assigner.append(word);
        let offset = Math.max(0, position - maximum_number_of_words + 1);
        let boldness_scores = importance_assigner.extract_boldness();
        for (let i = 0; i < boldness_scores.length; i++) {
            boldness_total_scores[clean_text[i + offset][0]] +=
                boldness_scores[i] * boldness_scores.length;
        }
    });
    // Normalization
    for (let i = 0; i < boldness_total_scores.length; i++) {
        let number_of_scanned_frames =
            i >= boldness_total_scores.length - maximum_number_of_words
                ? boldness_total_scores.length - i
                : maximum_number_of_words;
        boldness_total_scores[i] /= number_of_scanned_frames;
    }
    let normalization = Math.max(...boldness_total_scores);
    if (normalization != 0) {
        boldness_total_scores = boldness_total_scores.map((x) => {
            return (
                (x / normalization) * (1 - boldness_baseline) +
                boldness_baseline
            );
        });
    } else {
        boldness_total_scores = Array(boldness_total_scores.length).fill(1.0);
    }
    // Calculate boldness for each character
    let final_boldness = Array(raw_text.length).fill();
    if (clean_text.length) {
        let cnt = clean_text[0][0];
        for (let i = 0; i < cnt; i++)
            final_boldness[i] = [" ", boldness_baseline];
        for (let i = 0; i < words_length.length; i++) {
            let length = words_length[i];
            let boldness = model_boldness(length, boldness_total_scores[i]);
            preprocess_text[i].split("").forEach((c, j) => {
                final_boldness[cnt + j] = [c, boldness[j]];
            });
            cnt += length;
            if (cnt < raw_text.length)
                final_boldness[cnt++] = [" ", boldness_baseline];
        }
        for (let i = cnt; i < raw_text.length; i++)
            final_boldness[i] = [" ", boldness_baseline];
    } else {
        final_boldness = raw_text.split("").map((x) => [x, boldness_baseline]);
    }
    return final_boldness;
}

export default highlight;
