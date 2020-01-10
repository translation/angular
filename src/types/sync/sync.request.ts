export class SyncRequest {
    source_language: string = '';
    target_languages: string[] = [];
    segments: SyncSegmentRequest[] = [];
    purge: boolean = false;
    readonly: boolean = false;
}



export class SyncSegmentRequest {
    type: string = '';
    key: string | null = '';
    source: string = '';

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