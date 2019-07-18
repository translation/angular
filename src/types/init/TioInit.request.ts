import { TioInitSegmentRequest } from './TioInitSegment.request';

export class TioInitRequest {
    source_language: string = '';
    target_languages: string[] = [];
    segments: { 
        [language: string]: TioInitSegmentRequest[]; 
    } = {};
}
