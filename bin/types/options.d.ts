export declare class Options {
    api_key: string;
    i18n_key: string;
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
