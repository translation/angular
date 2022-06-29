"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitSegmentRequest = exports.InitRequest = void 0;
class InitRequest {
    constructor() {
        this.source_language = '';
        this.target_languages = [];
        this.segments = {};
    }
}
exports.InitRequest = InitRequest;
class InitSegmentRequest {
    constructor(id, i18nKey) {
        this.type = '';
        this.source = '';
        this.target = '';
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
exports.InitSegmentRequest = InitSegmentRequest;
//# sourceMappingURL=init.request.js.map