import { TioSyncSegmentRequest } from './TioSyncSegment.request';
export declare class TioSyncRequest {
    source_language: string;
    target_languages: string[];
    segments: TioSyncSegmentRequest[];
}
