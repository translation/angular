import { PullSegmentResponse } from './types/pull/pull.response';
export declare function getXMLElementToString(nodeName: string, xmlElement: Element): string;
export declare function httpCall(request: string, url: string, value: any, proxy: string): Promise<any>;
export declare function getUniqueSegmentFromPull(array: PullSegmentResponse[]): PullSegmentResponse[];
export declare function delay(ms: number): Promise<unknown>;
