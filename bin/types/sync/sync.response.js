"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncSegmentResponse = exports.SyncResponse = void 0;
class SyncResponse {
    constructor() {
        this.project = { name: '', url: '' };
        this.segments = {};
        this.unused_segment_ids = [];
    }
}
exports.SyncResponse = SyncResponse;
class SyncSegmentResponse {
    constructor() {
        this.source = '';
        this.target = '';
    }
}
exports.SyncSegmentResponse = SyncSegmentResponse;
//# sourceMappingURL=sync.response.js.map