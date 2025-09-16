import {Logger} from "../conference/types";

// function colorize(arg: any, colors: [RegExp, any][]) {
//     colors.forEach(([regex, color]) => {
//         if (arg.replace)
//             arg = arg.replace(regex, match => {
//                 return `${match}`;
//             });
//     })
//     return arg;
// }

export function createLogger(params?: { prefix? }): Logger {
    return (...args) => {
        params?.prefix && args.unshift(params.prefix)
        console.log(...args);
    }
}