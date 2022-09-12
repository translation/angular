export class Options {
    api_key: string = '';
    i18n_key: string = '';
    source_language: I18nFile = new I18nFile;
    target_languages: I18nFile[] = [];
    proxy: string = '';
}



export class I18nFile {
    language: string = '';
    file: string = '';
}