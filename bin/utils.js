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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xmlDom = __importStar(require("xmldom"));
const axios_1 = __importDefault(require("axios"));
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
        let httpAxios = axios_1.default.create();
        if (proxy) {
            const httpsProxyAgent = require('https-proxy-agent');
            const agent = new httpsProxyAgent(proxy);
            httpAxios = axios_1.default.create({
                httpsAgent: agent
            });
        }
        if (request === 'POST') {
            const headers = {
                'Content-Type': 'application/json',
            };
            return httpAxios.post(url, value, {
                headers: headers
            }).then((res) => {
                console.log(res.data);
                console.log('{ status: ' + res.status + ' }');
                return res.data;
            }, error => {
                return logErrors(request, error);
            });
        }
        else {
            return httpAxios.get(url + value)
                .then((res) => {
                console.log(res.data);
                console.log('{ status: ' + res.status + ' }');
                return res.data;
            }, error => {
                return logErrors(request, error);
            });
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
    return Promise.reject();
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.delay = delay;
//# sourceMappingURL=utils.js.map