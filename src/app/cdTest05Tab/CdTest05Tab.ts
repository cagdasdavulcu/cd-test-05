import { PreventIframe } from "express-msteams-host";

/**
 * Used as place holder for the decorators
 */
@PreventIframe("/cdTest05Tab/index.html")
@PreventIframe("/cdTest05Tab/config.html")
@PreventIframe("/cdTest05Tab/remove.html")
export class CdTest05Tab {
}
