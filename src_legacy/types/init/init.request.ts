import { getXMLElementToString } from "../../utils";
import { SegmentOptions } from "../segment-options";

export class InitRequest {
    source_language: string = '';
    target_languages: string[] = [];
    segments: {
        [language: string]: InitSegmentRequest[];
    } = {};
}



export class InitSegmentRequest extends SegmentOptions {
    type: 'key' | 'source';
    key?: string;
    source: string = '';
    target: string = '';

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

    addSourceAndTarget(transUnits: Element): void {
        const sourceElement = transUnits.getElementsByTagName('source')[0];
        if (sourceElement) {
            this.source = getXMLElementToString(
                'source', sourceElement
            );
        }

        // We need to process first the source and then the target
        this.addTarget(transUnits);
    }

    private addTarget(transUnits: Element): void {
        const targetElement = transUnits.getElementsByTagName('target')[0];
        if (targetElement) {
            const target = getXMLElementToString(
                'target', targetElement
            );

            this.target = (this.source === target) ? '' : target;
        }
    }
}