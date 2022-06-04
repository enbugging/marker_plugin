import highlight from "./marker/text_processing.js";

const highlightAttr = "highlighted----"; //btoa(Math.random()).slice(5)

function textNodesUnder(el) {
    var n,
        a = [],
        walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    while ((n = walk.nextNode())) a.push(n);
    return a;
}

function standardize_color(str) {
    var ctx = document.createElement("canvas").getContext("2d");
    ctx.fillStyle = str;
    return ctx.fillStyle;
}

function extractToDiv(node) {
    const g = document.createElement("span");
    //let color = node.parentElement.style.color;
    //console.log("Color: " + color + " " + standardize_color(color));
    g.setAttribute("class", highlightAttr);
    highlight(node.nodeValue)
        .map((c) => {
            const boldness = Math.floor(255 - c[1] * 255);
            //console.log(c[1], boldness);
            const span = document.createElement("span");
            span.setAttribute("class", highlightAttr);
            span.setAttribute(
                "style",
                "color:rgb(" +
                    boldness +
                    ", " +
                    boldness +
                    ", " +
                    boldness +
                    ");"
            );
            span.appendChild(document.createTextNode(c[0]));
            return span;
        })
        .forEach((span) => g.appendChild(span));
    return g;
}

function applyHighlight(doc) {
    const elements = Array.from(textNodesUnder(doc));
    const divElements = elements
        .filter(
            (node) =>
                node.nodeValue &&
                /[^\s\n]+/.test(node.nodeValue) &&
                node.parentElement.tagName !== "SCRIPT" &&
                node.parentElement.tagName !== "STYLE"
        )
        .map((node) => ({
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
                    //.map((x) => {
                    //    console.log("Updating", x);
                    //    return x;
                    //})
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
