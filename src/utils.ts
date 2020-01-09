
import * as xmlDom from 'xmldom';
const xmlSerializer = new xmlDom.XMLSerializer();





export function getXMLElementToString(nodeName: string, xmlElement: Element): string {
    const regexNode = new RegExp('<' + nodeName + ' .*?>');
    return xmlSerializer.serializeToString(xmlElement)
        .replace(regexNode, '')
        .replace('</' + nodeName + '>', '')
        .replace(/\t/g, '')
        .replace(/\s+/g, ' ').trim();
}





export function httpPost(url: string, value: any, proxy: string, callback: (res: any) => void) {
    let axios = require('axios');
    if (proxy) {
        const httpsProxyAgent = require('https-proxy-agent');
        const agent = new httpsProxyAgent(proxy);
        axios = axios.create({
            httpsAgent: agent
        });
    }

    axios.post(url, value)
        .then((res: any) => {
            console.log(res.data);
            console.log('{ status: ' + res.status + ' }');
            callback(res.data);
        })
        .catch((error: any) => {
            if (error.response) {
                console.error('{ error.response }');
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error(error.response.data);
                console.error(error.response.headers);
                console.error('{ status: ' + error.response.status + ' }');
            } else if (error.request) {
                console.error('{ error.request }');
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.error(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('{ other error }');
                console.error(error.message);
            }
        });
}