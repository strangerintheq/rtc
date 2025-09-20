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

export function createLogger(params?: { prefix?, color?: string }): Logger {
    const p = params?.prefix;
    const c = p && params?.color;
    return (...args) => {
        c && args.unshift("background-color: " + c)
        p && args.unshift((c ? "%c" : "") + p)
        console.log(...args);
    }
}