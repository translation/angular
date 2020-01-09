export class Options {
    apiKey: string = '';
    i18nKey: string = '';
    source_language: I18nFile = new I18nFile;
    target_languages: I18nFile[] = [];
    proxy: ProxyOption = new ProxyOption();
}



export class I18nFile {
    language: string = '';
    file: string = '';
}

export class ProxyOption {
    url: string = '';
    port: string = '';
}