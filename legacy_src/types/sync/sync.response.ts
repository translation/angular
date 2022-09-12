export class SyncResponse {
    project: {
        name: string;
        url: string;
    } = { name: '', url: '' };
    segments: {
        [language: string]: SyncSegmentResponse[];
    } = {};
    unused_segment_ids: any[] = [];
}



export class SyncSegmentResponse {
    type!: 'key' | 'source';
    key?: string;
    source: string = '';
    target: string = '';
}