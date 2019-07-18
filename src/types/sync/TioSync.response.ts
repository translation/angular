import { TioSyncSegmentResponse } from './TioSyncSegment.response';

export class TioSyncResponse {
    project: {
        name: string;
        url: string
    } = { name: '', url: '' };
    segments: { 
        [language: string]: TioSyncSegmentResponse[]; 
    } = {};
    unused_segment_ids: any[] = [];
}
