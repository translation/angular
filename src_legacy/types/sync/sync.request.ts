import { getXMLElementToString } from "../../utils";
import { SegmentOptions } from "../segment-options";

export class SyncRequest {
    source_language: string = '';
    target_languages: string[] = [];
    segments: SyncSegmentRequest[] = [];
    purge: boolean = false;
    readonly: boolean = false;
}



export class SyncSegmentRequest extends SegmentOptions {
    type: 'key' | 'source';
    key?: string;
    source: string = '';

    constructor(id: string, i18nKey: string) {
        super();
        if (id.startsWith(i18nKey)) {
            this.type = 'key';
            this.key = id;
        } else {
            this.type = 'source';
            this.key = undefined;
        }
    }

    addSource(transUnits: Element): void {
        const sourceElement = transUnits.getElementsByTagName('source')[0];
        if (sourceElement) {
            this.source = getXMLElementToString(
                'source', sourceElement
            );
        }
    }
}