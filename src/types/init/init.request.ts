export class InitRequest {
    source_language: string = '';
    target_languages: string[] = [];
    segments: { 
        [language: string]: InitSegmentSourceRequest[] | InitSegmentKeyRequest[]; 
    } = {};
}



export class InitSegmentKeyRequest {
    type: string = 'key';
    key: string = '';
    source: string = '';
    target: string = '';
}

export class InitSegmentSourceRequest {
    type: string = 'source';
    source: string = '';
    target: string = '';
}