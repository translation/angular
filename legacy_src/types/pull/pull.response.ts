export class PullResponse {
    project: {
        name: string;
        url: string;
    } = { name: '', url: '' };
    source_edits: PullSegmentResponse[] = [];
    timestamp: number = 0;
}



export class PullSegmentResponse {
    key: string = '';
    old_source: string = '';
    new_source: string = '';
    created_at: number = 0;
}

export class PullGroupedResponse {
    key: string = '';
    segments: PullSegmentResponse[] = [];
}