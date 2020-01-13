"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const xmlDom = __importStar(require("xmldom"));
const xmlSerializer = new xmlDom.XMLSerializer();
function getXMLElementToString(nodeName, xmlElement) {
    const regexNode = new RegExp('<' + nodeName + ' .*?>');
    return xmlSerializer.serializeToString(xmlElement)
        .replace(regexNode, '')
        .replace('</' + nodeName + '>', '')
        .replace(/\t/g, '')
        .replace(/\s+/g, ' ').trim();
}
exports.getXMLElementToString = getXMLElementToString;
function httpCall(request, url, value, proxy) {
    return __awaiter(this, void 0, void 0, function* () {
        let axios = require('axios');
        if (proxy) {
            const httpsProxyAgent = require('https-proxy-agent');
            const agent = new httpsProxyAgent(proxy);
            axios = axios.create({
                httpsAgent: agent
            });
        }
        if (request === 'POST') {
            try {
                return yield axios.post(url, value)
                    .then((res) => {
                    console.log(res.data);
                    console.log('{ status: ' + res.status + ' }');
                    return res.data;
                });
            }
            catch (error) {
                logErrors(request, error);
            }
        }
        else {
            try {
                return yield axios.get(url + value)
                    .then((res) => {
                    console.log(res.data);
                    console.log('{ status: ' + res.status + ' }');
                    return res.data;
                });
            }
            catch (error) {
                logErrors(request, error);
            }
        }
    });
}
exports.httpCall = httpCall;
function getUniqueSegmentFromPull(array) {
    const groupedSegments = [];
    // On groupe les segment par "key"
    array.forEach((response) => {
        const index = groupedSegments.findIndex((item) => {
            return item.key === response.key;
        });
        if (index !== -1) {
            groupedSegments[index].segments.push(response);
        }
        else {
            const data = {
                key: response.key,
                segments: [response]
            };
            groupedSegments.push(data);
        }
    });
    // On récupère la dernière valeur et on l'ajoute au tableau
    const data = [];
    groupedSegments.forEach(element => {
        element.segments = element.segments.sort((varA, varB) => varB.created_at - varA.created_at).slice();
        data.push(element.segments[0]);
    });
    return data.slice();
}
exports.getUniqueSegmentFromPull = getUniqueSegmentFromPull;
function logErrors(request, error) {
    console.error('HTTP ' + request + ' error : ');
    if (error.response) {
        console.error('{ error.response }');
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(error.response.data);
        console.error(error.response.headers);
        console.error('{ status: ' + error.response.status + ' }');
    }
    else if (error.request) {
        console.error('{ error.request }');
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.error(error.request);
    }
    else {
        // Something happened in setting up the request that triggered an Error
        console.error('{ other error }');
        console.error(error.message);
    }
    console.error(error.config);
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.delay = delay;
//# sourceMappingURL=utils.js.map