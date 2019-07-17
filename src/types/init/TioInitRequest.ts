import { TioInitSegment } from './TioInitSegment';

export class TioInitRequest {
    source_language: string = '';
    target_languages: string[] = [];
    segments: { 
        [language: string]: TioInitSegment[]; 
    } = {};
}