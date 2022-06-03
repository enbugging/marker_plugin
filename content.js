//const { spawn } = require("child_process");

//const test = spawn("python", ["test.py"]);

var elements = document.getElementsByTagName("*");

for (var i = 0; i < elements.length; i++) {
    var element = elements[i];

    for (var j = 0; j < element.childNodes.length; j++) {
        var node = element.childNodes[j];

        if (node.nodeType === 3 && /[a-zA-Z0-9]/.test(node.nodeValue)) {
            var text = node.nodeValue;
            var replacedText = text;
            newDiv = document
                .createElement("div")
                .appendChild(document.createTextNode(replacedText));
            element.replaceChild(newDiv, node);
        }
    }
}
