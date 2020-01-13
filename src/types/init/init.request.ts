export class InitRequest {
    source_language: string = '';
    target_languages: string[] = [];
    segments: {
        [language: string]: InitSegmentRequest[];
    } = {};
}



export class InitSegmentRequest {
    type: string = '';
    key?: string;
    source: string = '';
    target: string = '';

    constructor(id: string, i18nKey: string) {
        if (id.startsWith(i18nKey)) {
            this.type = 'key';
            this.key = id;
        } else {
            this.type = 'source';
            this.key = undefined;
        }
    }
}