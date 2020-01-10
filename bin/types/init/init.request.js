"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InitRequest {
    constructor() {
        this.source_language = '';
        this.target_languages = [];
        this.segments = {};
    }
}
exports.InitRequest = InitRequest;
class InitSegmentRequest {
    constructor(id, i18n_key) {
        this.type = '';
        this.key = '';
        this.source = '';
        this.target = '';
        if (id.startsWith(i18n_key)) {
            this.source = 'key';
            this.key = id;
        }
        else {
            this.source = 'source';
            this.key = null;
        }
    }
}
exports.InitSegmentRequest = InitSegmentRequest;
//# sourceMappingURL=init.request.js.map