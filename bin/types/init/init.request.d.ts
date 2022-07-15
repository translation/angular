import { SegmentOptions } from "../segment-options";
export declare class InitRequest {
    source_language: string;
    target_languages: string[];
    segments: {
        [language: string]: InitSegmentRequest[];
    };
}
export declare class InitSegmentRequest extends SegmentOptions {
    type: 'key' | 'source';
    key?: string;
    source: string;
    target: string;
    constructor(id: string, i18nKey: string);
    addSourceAndTarget(transUnits: Element): void;
    private addTarget;
}
