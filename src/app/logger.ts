import {Logger} from "../conference/types";
import {stringHash, xorShift128} from "../conference/determineMaster";

// function colorize(arg: any, colors: [RegExp, any][]) {
//     colors.forEach(([regex, color]) => {
//         if (arg.replace)
//             arg = arg.replace(regex, match => {
//                 return `${match}`;
//             });
//     })
//     return arg;
// }

export function createLogger(params?: { prefix?, color?: string, disabled?:boolean }): Logger {
    const p = params?.prefix;
    const c = p && params?.color;
    return (...args) => {
        if (params.disabled)
            return;
        document.querySelector('#log').innerHTML += "<pre style='margin: 0'>" +
            colored(p,c) + " " + args.map(objectPrettify).join(" ") + "\n" + "</pre>"
        c && args.unshift("background-color: " + c)
        p && args.unshift((c ? "%c" : "") + p)
        console.log(...args);
    }
}

function colored(text, color) {
    return `<span style="background-color: ${color}">${text}</span>`
}

function objectPrettify(x) {
    if (typeof x == "object")
        return `<details><summary>${x}</summary>${JSON.stringify(x, null, 2)}</details>`;
    let split = x.split("-");
    if (split.length > 3)
        return split[0]
    return x
}