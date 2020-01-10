export class InitRequest {
    source_language: string = '';
    target_languages: string[] = [];
    segments: {
        [language: string]: InitSegmentRequest[];
    } = {};
}



export class InitSegmentRequest {
    type: string = '';
    key: string | null = '';
    source: string = '';
    target: string = '';

    constructor(id: string, i18n_key: string) {
        if (id.startsWith(i18n_key)) {
            this.source = 'key';
            this.key = id;
        } else {
            this.source = 'source';
            this.key = null;
        }
    }
}