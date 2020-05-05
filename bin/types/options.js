"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Options {
    constructor() {
        this.api_key = '';
        this.i18n_key = '';
        this.source_language = new I18nFile;
        this.target_languages = [];
        this.proxy = '';
    }
}
exports.Options = Options;
class I18nFile {
    constructor() {
        this.language = '';
        this.file = '';
    }
}
exports.I18nFile = I18nFile;
//# sourceMappingURL=options.js.map