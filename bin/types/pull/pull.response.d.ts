export declare class PullResponse {
    project: {
        name: string;
        url: string;
    };
    source_edits: PullSegmentResponse[];
    timestamp: number;
}
export declare class PullSegmentResponse {
    key: string;
    old_source: string;
    new_source: string;
    created_at: number;
}
export declare class PullGroupedResponse {
    key: string;
    segments: PullSegmentResponse[];
}
