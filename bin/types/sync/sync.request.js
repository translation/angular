"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncSegmentRequest = exports.SyncRequest = void 0;
const utils_1 = require("../../utils");
const segment_options_1 = require("../segment-options");
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
class SyncSegmentRequest extends segment_options_1.SegmentOptions {
    constructor(id, i18nKey) {
        super();
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
    addSource(transUnits) {
        const sourceElement = transUnits.getElementsByTagName('source')[0];
        if (sourceElement) {
            this.source = (0, utils_1.getXMLElementToString)('source', sourceElement);
        }
    }
}
exports.SyncSegmentRequest = SyncSegmentRequest;
//# sourceMappingURL=sync.request.js.map