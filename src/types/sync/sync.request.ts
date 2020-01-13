export class SyncRequest {
    source_language: string = '';
    target_languages: string[] = [];
    segments: SyncSegmentRequest[] = [];
    purge: boolean = false;
    readonly: boolean = false;
}



export class SyncSegmentRequest {
    type: string = '';
    key?: string;
    source: string = '';

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