import { TioSyncSegmentResponse } from './TioSyncSegment.response';

export class TioSyncResponse {
    segments: TioSyncSegmentResponse[] = [];
    unused_segment_ids: any[] = [];
}
