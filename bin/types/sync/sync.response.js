"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        this.type = '';
        this.source = '';
        this.target = '';
    }
}
exports.SyncSegmentResponse = SyncSegmentResponse;
//# sourceMappingURL=sync.response.js.map