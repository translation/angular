import { TioSegment } from './TioSegment';

export class TioInitRequest {
    source_language: string = '';
    target_languages: string[] = [];
    segments: { 
        [language: string]: TioSegment[]; 
    } = {};
}
