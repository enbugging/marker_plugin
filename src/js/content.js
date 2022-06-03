import highlight from "./marker/text_processing.js";

export function main() {
    var elements = document.getElementsByTagName("*");

    for (var element of elements) {
        if (element.innerText == null) continue;
        console.log(element.innerText);
        continue;
        for (var node of element.childNodes) {
            if (node.nodeType === 3 && /[a-zA-Z0-9]/.test(node.nodeValue)) {
                //var text = node.nodeValue;
                console.log(node.innerText);
                //var boldness = highlight(text);
                //newDiv = document.createElement("span");
                //newDiv.appendChild(document.createTextNode(text));
                //newDiv.style.color = "black";
                //element.replaceChild(newDiv, node);
            }
        }
    }
}
