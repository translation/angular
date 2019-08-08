import { TioInitSegmentRequest } from './TioInitSegment.request';
export declare class TioInitRequest {
    source_language: string;
    target_languages: string[];
    segments: {
        [language: string]: TioInitSegmentRequest[];
    };
}
