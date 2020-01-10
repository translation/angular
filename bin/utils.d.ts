import { PullSegmentResponse } from './types/pull/pull.response';
export declare function getXMLElementToString(nodeName: string, xmlElement: Element): string;
export declare function httpPost(url: string, value: any, proxy: string, callback: (res: any) => void): void;
export declare function getUniqueSegmentFromPull(array: PullSegmentResponse[]): PullSegmentResponse[];
