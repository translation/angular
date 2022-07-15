import { getXMLElementToString } from "../utils";

export class SegmentOptions {
    context?: string;
    comment?: string;
    references?: string[];

    addOptions(transUnits: Element, type: 'key' | 'source'): void {
        const noteElements = transUnits.getElementsByTagName('note');
        if (noteElements?.length) {
            for (let n = 0; n < noteElements.length; n++) {
                if (noteElements[n].hasAttribute('from')) {
                    const note_string = getXMLElementToString(
                        'note',
                        noteElements[n]
                    );

                    switch (noteElements[n].getAttribute('from')?.trim()) {
                        case 'description': {
                            this.comment = note_string;
                        } break;
                        case 'meaning': {
                            if (type === 'key') {
                                this.context = undefined;
                            } else {
                                this.context = note_string;
                            }
                        } break;
                    }
                }
            }
        }

        const contextGroupElements = transUnits.getElementsByTagName('context-group');
        if (contextGroupElements?.length) {
            this.references = [];
            for (let g = 0; g < contextGroupElements.length; g++) {
                const contextElements = contextGroupElements[g].getElementsByTagName('context');
                if (contextElements?.length) {
                    let text = '';
                    for (let c = 0; c < contextElements.length; c++) {
                        text += getXMLElementToString(
                            'context',
                            contextElements[c]
                        );

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