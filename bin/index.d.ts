import { TioSyncResponse } from './types/sync/TioSync.response';
/*********** MERGE ***********/
export declare function mergeXliff(filesToMerge: string[], targetLanguages: string[], sync: TioSyncResponse): void;
/*********** UTILS ***********/
export declare function getXMLElementsToArrayString(nodeName: string, xmlElements: HTMLCollectionOf<any>): string[];
export declare function httpPost(url: string, value: any, callback: (res: any) => void): void;
