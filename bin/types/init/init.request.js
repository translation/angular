"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitSegmentRequest = exports.InitRequest = void 0;
const utils_1 = require("../../utils");
const segment_options_1 = require("../segment-options");
class InitRequest {
    constructor() {
        this.source_language = '';
        this.target_languages = [];
        this.segments = {};
    }
}
exports.InitRequest = InitRequest;
class InitSegmentRequest extends segment_options_1.SegmentOptions {
    constructor(id, i18nKey) {
        super();
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
    addSourceAndTarget(transUnits) {
        const sourceElement = transUnits.getElementsByTagName('source')[0];
        if (sourceElement) {
            this.source = (0, utils_1.getXMLElementToString)('source', sourceElement);
        }
        // We need to process first the source and then the target
        this.addTarget(transUnits);
    }
    addTarget(transUnits) {
        const targetElement = transUnits.getElementsByTagName('target')[0];
        if (targetElement) {
            const target = (0, utils_1.getXMLElementToString)('target', targetElement);
            this.target = (this.source === target) ? '' : target;
        }
    }
}
exports.InitSegmentRequest = InitSegmentRequest;
//# sourceMappingURL=init.request.js.map