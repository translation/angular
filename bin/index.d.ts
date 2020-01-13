import { SyncResponse } from './types/sync/sync.response';
/*********** PULL ***********/
export declare function pull(): Promise<any>;
/*********** MERGE ***********/
export declare function merge(sync: SyncResponse): void;
