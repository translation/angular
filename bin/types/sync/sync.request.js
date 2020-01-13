"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SyncRequest {
    constructor() {
        this.source_language = '';
        this.target_languages = [];
        this.segments = [];
        this.purge = false;
        this.readonly = false;
    }
}
exports.SyncRequest = SyncRequest;
class SyncSegmentRequest {
    constructor(id, i18nKey) {
        this.type = '';
        this.source = '';
        if (id.startsWith(i18nKey)) {
            this.type = 'key';
            this.key = id;
        }
        else {
            this.type = 'source';
            this.key = undefined;
        }
    }
}
exports.SyncSegmentRequest = SyncSegmentRequest;
//# sourceMappingURL=sync.request.js.map