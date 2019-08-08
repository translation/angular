import { TioSyncSegmentResponse } from './TioSyncSegment.response';
export declare class TioSyncResponse {
    project: {
        name: string;
        url: string;
    };
    segments: {
        [language: string]: TioSyncSegmentResponse[];
    };
    unused_segment_ids: any[];
}
