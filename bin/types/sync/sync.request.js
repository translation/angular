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
    constructor(id, i18n_key) {
        this.type = '';
        this.key = '';
        this.source = '';
        if (id.startsWith(i18n_key)) {
            this.source = 'key';
            this.key = id;
        }
        else {
            this.source = 'source';
            this.key = '';
        }
    }
}
exports.SyncSegmentRequest = SyncSegmentRequest;
//# sourceMappingURL=sync.request.js.map