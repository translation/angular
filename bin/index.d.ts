import { SyncResponse } from './types/sync/sync.response';
/*********** PULL ***********/
export declare function pull(callback: () => void): void;
/*********** MERGE ***********/
export declare function merge(sync: SyncResponse): void;
