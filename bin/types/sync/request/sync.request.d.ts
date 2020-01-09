import { SyncSegmentSourceRequest } from './sync.segment.source.request';
import { SyncSegmentKeyRequest } from './sync.segment.key.request';
export declare class SyncRequest {
    source_language: string;
    target_languages: string[];
    segments: SyncSegmentSourceRequest[] | SyncSegmentKeyRequest;
    purge: boolean;
    readonly: boolean;
}
