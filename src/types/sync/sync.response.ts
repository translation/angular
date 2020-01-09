export class SyncResponse {
    project: {
        name: string;
        url: string
    } = { name: '', url: '' };
    segments: { 
        [language: string]: SyncSegmentSourceResponse[] | SyncSegmentKeyResponse[]; 
    } = {};
    unused_segment_ids: any[] = [];
}



export class SyncSegmentKeyResponse {
    type: string = '';
    key: string = '';
    source: string = '';
    target: string = '';
}

export class SyncSegmentSourceResponse {
    type: string = '';
    source: string = '';
    target: string = '';
}