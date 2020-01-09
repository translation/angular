import { SyncSegmentSourceResponse } from './sync.segment.source.response';
import { SyncSegmentKeyResponse } from './sync.segment.key.response';
export declare class SyncResponse {
    project: {
        name: string;
        url: string;
    };
    segments: {
        [language: string]: SyncSegmentSourceResponse[] | SyncSegmentKeyResponse[];
    };
    unused_segment_ids: any[];
}
