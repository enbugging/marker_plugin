import highlight from "./marker/text_processing.js";

const highlightAttr = "highlighted----"; //btoa(Math.random()).slice(5)

function textNodesUnder(el) {
    var node,
        a = [],
        walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    while ((node = walk.nextNode())) {
        if (
            node.nodeValue &&
            /[^\s\n]+/.test(node.nodeValue) &&
            node.parentElement.tagName !== "IFRAME" &&
            node.parentElement.tagName !== "CODE" &&
            node.parentElement.tagName !== "SCRIPT" &&
            node.parentElement.tagName !== "STYLE" &&
            (node.parentElement.classList === undefined ||
                !node.parentElement.classList.contains(highlightAttr))
        ) {
            a.push(node);
        }
    }
    return a;
}

function extractToDiv(node) {
    const g = document.createElement("span");
    g.setAttribute("class", highlightAttr);
    highlight(node.nodeValue)
        .map((c) => {
            const span = document.createElement("span");
            span.setAttribute("class", highlightAttr);
            span.setAttribute("style", "opacity:" + c[1]);
            span.appendChild(document.createTextNode(c[0]));
            return span;
        })
        .forEach((span) => g.appendChild(span));
    return g;
}

function applyHighlight(doc) {
    const elements = Array.from(textNodesUnder(doc));
    const divElements = elements.map((node) => ({
        node,
        newDiv: extractToDiv(node),
    }));

    divElements.forEach(({ node, newDiv }) => {
        if (node.parentNode) node.parentNode.replaceChild(newDiv, node);
    });
}

export function main() {
    applyHighlight(document.body);
    // Callback function to execute when mutations are observed
    const callback = function (mutationsList, observer) {
        // Use traditional 'for loops' for IE 11
        for (const mutation of mutationsList) {
            if (mutation.type === "childList") {
                Array.prototype.slice
                    .call(mutation.addedNodes)
                    .filter(
                        (node) =>
                            node.classList === undefined ||
                            !node.classList.contains(highlightAttr)
                    )
                    .forEach(applyHighlight);
            }
        }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);
    // Start observing the target node for configured mutations
    observer.observe(document, {
        childList: true,
        subtree: true,
    });
}
