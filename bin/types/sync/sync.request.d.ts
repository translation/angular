import { SegmentOptions } from "../segment-options";
export declare class SyncRequest {
    source_language: string;
    target_languages: string[];
    segments: SyncSegmentRequest[];
    purge: boolean;
    readonly: boolean;
}
export declare class SyncSegmentRequest extends SegmentOptions {
    type: 'key' | 'source';
    key?: string;
    source: string;
    constructor(id: string, i18nKey: string);
    addSource(transUnits: Element): void;
}
