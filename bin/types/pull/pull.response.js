"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PullResponse {
    constructor() {
        this.project = { name: '', url: '' };
        this.source_edits = [];
        this.timestamp = 0;
    }
}
exports.PullResponse = PullResponse;
class PullSegmentResponse {
    constructor() {
        this.key = '';
        this.old_source = '';
        this.new_source = '';
        this.created_at = 0;
    }
}
exports.PullSegmentResponse = PullSegmentResponse;
//# sourceMappingURL=pull.response.js.map