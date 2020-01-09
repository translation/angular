export declare class Options {
    apiKey: string;
    i18nKey: string;
    source_language: I18nFile;
    target_languages: I18nFile[];
    proxy: ProxyOption;
}
export declare class I18nFile {
    language: string;
    file: string;
}
export declare class ProxyOption {
    url: string;
    port: string;
}
