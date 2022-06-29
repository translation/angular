"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PullGroupedResponse = exports.PullSegmentResponse = exports.PullResponse = void 0;
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
class PullGroupedResponse {
    constructor() {
        this.key = '';
        this.segments = [];
    }
}
exports.PullGroupedResponse = PullGroupedResponse;
//# sourceMappingURL=pull.response.js.map