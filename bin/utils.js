"use strict";
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
function httpPost(url, value, proxy, callback) {
    let axios = require('axios');
    if (proxy) {
        const httpsProxyAgent = require('https-proxy-agent');
        const agent = new httpsProxyAgent(proxy);
        axios = axios.create({
            httpsAgent: agent
        });
    }
    axios.post(url, value)
        .then((res) => {
        console.log(res.data);
        console.log('{ status: ' + res.status + ' }');
        callback(res.data);
    })
        .catch((error) => {
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
    });
}
exports.httpPost = httpPost;
//# sourceMappingURL=utils.js.map