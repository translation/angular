"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SegmentOptions = void 0;
const utils_1 = require("../utils");
class SegmentOptions {
    addOptions(transUnits, type) {
        var _a;
        const noteElements = transUnits.getElementsByTagName('note');
        if (noteElements === null || noteElements === void 0 ? void 0 : noteElements.length) {
            for (let n = 0; n < noteElements.length; n++) {
                if (noteElements[n].hasAttribute('from')) {
                    const note_string = (0, utils_1.getXMLElementToString)('note', noteElements[n]);
                    switch ((_a = noteElements[n].getAttribute('from')) === null || _a === void 0 ? void 0 : _a.trim()) {
                        case 'description':
                            {
                                this.comment = note_string;
                            }
                            break;
                        case 'meaning':
                            {
                                if (type === 'key') {
                                    this.context = undefined;
                                }
                                else {
                                    this.context = note_string;
                                }
                            }
                            break;
                    }
                }
            }
        }
        const contextGroupElements = transUnits.getElementsByTagName('context-group');
        if (contextGroupElements === null || contextGroupElements === void 0 ? void 0 : contextGroupElements.length) {
            this.references = [];
            for (let g = 0; g < contextGroupElements.length; g++) {
                const contextElements = contextGroupElements[g].getElementsByTagName('context');
                if (contextElements === null || contextElements === void 0 ? void 0 : contextElements.length) {
                    let text = '';
                    for (let c = 0; c < contextElements.length; c++) {
                        text += (0, utils_1.getXMLElementToString)('context', contextElements[c]);
                        if (c !== (contextElements.length - 1)) {
                            text += ':';
                        }
                    }
                    if (text.trim().length) {
                        this.references.push(text);
                    }
                }
            }
        }
    }
}
exports.SegmentOptions = SegmentOptions;
//# sourceMappingURL=segment-options.js.map