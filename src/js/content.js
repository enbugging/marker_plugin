import highlight from "./marker/text_processing.js";

class MutationObserverUnobservable extends MutationObserver {
    constructor(callback) {
        super(callback);
        this.observerTargets = [];
    }

    observe(target, options) {
        if (options === undefined) {
            this.observerTargets.push({ target });
            return super.observe(target);
        } else {
            this.observerTargets.push({ target, options });
            return super.observe(target, options);
        }
    }

    unobserve(target) {
        const newObserverTargets = this.observerTargets.filter(
            (ot) => ot.target !== target
        );
        this.observerTargets = [];
        this.disconnect();
        newObserverTargets.forEach((ot) => {
            this.observe(ot.target, ot.options);
        });
    }
}

const highlightAttr = "highlighted----";

function textNodesUnder(el) {
    var n,
        a = [],
        walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    while ((n = walk.nextNode())) a.push(n);
    return a;
}

function extractToDiv(node) {
    const g = document.createElement("span");
    g.setAttribute("class", highlightAttr);
    node.nodeValue
        .split("")
        .map((c) => {
            const span = document.createElement("span");
            span.setAttribute("class", highlightAttr);
            span.setAttribute("style", "color: aquamarine;");
            span.appendChild(document.createTextNode(c));
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
                mutation.addNodes
                    .filter(
                        (node) =>
                            node.classList !== undefined &&
                            !node.classList.contains(highlightAttr)
                    )
                    .map((x) => {
                        console.log("Updating", mutation.target);
                        return x;
                    })
                    .forEach(applyHighlight);
            }
            // mutation of us -> continue
        }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserverUnobservable(callback);
    // Start observing the target node for configured mutations
    observer.observe(document, {
        childList: true,
        subtree: true,
    });
}
