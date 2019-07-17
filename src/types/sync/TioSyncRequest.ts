import { TioSyncSegment } from './TioSyncSegment';

export class TioSyncRequest {
    source_language: string = '';
    target_languages: string[] = [];
    segments: TioSyncSegment[] = []
}
