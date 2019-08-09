import { TioSyncResponse } from './types/sync/TioSync.response';
/*********** MERGE ***********/
export declare function mergeXliff(filesToMerge: string[], targetLanguages: string[], sync: TioSyncResponse): void;
export declare function getSourceToString(sources: HTMLCollectionOf<HTMLSourceElement>): string[];
export declare function getTargetToString(targets: HTMLCollectionOf<Element>): string[];
export declare function httpPost(url: string, value: any, callback: (res: any) => void): void;
