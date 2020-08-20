
import * as xmlDom from 'xmldom';
import { PullSegmentResponse, PullGroupedResponse } from './types/pull/pull.response';
const xmlSerializer = new xmlDom.XMLSerializer();

export function getXMLElementToString(nodeName: string, xmlElement: Element): string {
    const regexNode = new RegExp('<' + nodeName + ' .*?>');
    return xmlSerializer.serializeToString(xmlElement)
        .replace(regexNode, '')
        .replace('</' + nodeName + '>', '')
        .replace(/\t/g, '')
        .replace(/\s+/g, ' ').trim();
}

export async function httpCall(request: string, url: string, value: any, proxy: string): Promise<any> {
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
            const headers = {
                'Content-Type': 'application/json',
            }
            return await axios.post(url, value, {
                headers: headers
            }).then((res: any) => {
                console.log(res.data);
                console.log('{ status: ' + res.status + ' }');
                return res.data;
            })
        }
        catch (error) {
            logErrors(request, error);
        }
    } else {
        try {
            return await axios.get(url + value)
                .then((res: any) => {
                    console.log(res.data);
                    console.log('{ status: ' + res.status + ' }');
                    return res.data;
                })
        }
        catch (error) {
            logErrors(request, error);
        }
    }
}

export function getUniqueSegmentFromPull(array: PullSegmentResponse[]): PullSegmentResponse[] {
    const groupedSegments: PullGroupedResponse[] = [];
    // On groupe les segment par "key"
    array.forEach((response: PullSegmentResponse) => {
        const index = groupedSegments.findIndex((item: PullGroupedResponse) => {
            return item.key === response.key;
        });
        if (index !== -1) {
            groupedSegments[index].segments.push(response);
        } else {
            const data: PullGroupedResponse = {
                key: response.key,
                segments: [response]
            }
            groupedSegments.push(data);
        }
    });
    // On récupère la dernière valeur et on l'ajoute au tableau
    const data: PullSegmentResponse[] = [];
    groupedSegments.forEach(element => {
        element.segments = element.segments.sort((varA, varB) => varB.created_at - varA.created_at).slice();
        data.push(element.segments[0]);
    });
    return data.slice();
}





function logErrors(request: string, error: any): void {
    console.error('HTTP ' + request + ' error : ');
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
    console.error(error.config);
}

export function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}