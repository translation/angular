export declare class InitRequest {
    source_language: string;
    target_languages: string[];
    segments: {
        [language: string]: InitSegmentRequest[];
    };
}
export declare class InitSegmentRequest {
    type: string;
    key: string | null;
    source: string;
    target: string;
    constructor(id: string, i18n_key: string);
}
