export declare class SyncResponse {
    project: {
        name: string;
        url: string;
    };
    segments: {
        [language: string]: SyncSegmentResponse[];
    };
    unused_segment_ids: any[];
}
export declare class SyncSegmentResponse {
    type: 'key' | 'source';
    key?: string;
    source: string;
    target: string;
}
