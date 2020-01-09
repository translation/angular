export class SyncRequest {
    source_language: string = '';
    target_languages: string[] = [];
    segments: SyncSegmentSourceRequest[] | SyncSegmentKeyRequest = [];
    purge: boolean = false;
    readonly: boolean = false;
}



export class SyncSegmentKeyRequest {
    type: string = 'key';
    key: string = '';
    source: string = '';
}

export class SyncSegmentSourceRequest {
    type: string = 'source';
    source: string = '';
}