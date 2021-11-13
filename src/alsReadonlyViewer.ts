import { promisify, TextDecoder } from "util";
import * as vscode from "vscode";
import { Disposable } from "vscode";
import { getNonce } from './util';
import AbletonParser from "./abletonParser";
const fs = require("fs");

class AlsDocument extends Disposable implements vscode.CustomDocument {
  static async create(
    uri: vscode.Uri,
  ): Promise<AlsDocument | PromiseLike<AlsDocument>> {
    return new AlsDocument(uri, "");
  }

  private readonly _uri: vscode.Uri;

  private _documentData: string;

  private constructor(uri: vscode.Uri, initialContent: string) {
    super(() => {});
    this._uri = uri;
    this._documentData = initialContent;
  }

  
  public static async displayOriginalContent(uri: vscode.Uri, webview: vscode.Webview, context: vscode.ExtensionContext): Promise<string> {

		const simpleTreeStyleUri = webview.asWebviewUri(vscode.Uri.joinPath(
		context.extensionUri, 'media', 'simpleTree.css'));		

    const nonce = getNonce();
    const xmlData = (await this.readFile(uri)).toString();
    var ableton = AbletonParser.parse(xmlData);

    const result = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} blob:; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <link href="${simpleTreeStyleUri}" rel="stylesheet" />
        <title>Raw Content</title>
      </head>
      <body>
        <ul class="tree">
          <li><span class="caret">${ableton.creator}</span>
            <ul class="nested">
              ${ableton.tracksToHtmlList()}
            </ul>
          </li>
        </ul>

        <script nonce="${nonce}">
          var toggler = document.getElementsByClassName("caret");
          var i;
          
          for (i = 0; i < toggler.length; i++) {
            toggler[i].addEventListener("click", function() {
              this.parentElement.querySelector(".nested").classList.toggle("active");
              this.classList.toggle("caret-down");
            });
            toggler[i].click.apply(toggler[i]);          
          }
            
        </script>

      </body>
      </html>`;

		return result;
  }

  private static async readFile(uri: vscode.Uri): Promise<string> {
    console.log(uri);
    if (uri.scheme === "untitled") {
      return "";
    }

    const fileData = await vscode.workspace.fs.readFile(uri);

    const { deflate, unzip } = require("zlib");
    const doUnzip = promisify(unzip);

    return await doUnzip(fileData);
  }

  public get uri() {
    return this._uri;
  }

  public get documentData(): string {
    return this._documentData;
  }

  dispose(): void {
    super.dispose();
  }
}

export class AlsReadonlyViewerProvider implements vscode.CustomReadonlyEditorProvider
{
  private static readonly viewType = "abletonalsreadonlyviewer";
  private readonly _callbacks = new Map<number, (response: any) => void>();

  constructor(private readonly _context: vscode.ExtensionContext) { }

  async openCustomDocument(uri: vscode.Uri, openContext: vscode.CustomDocumentOpenContext, token: vscode.CancellationToken): Promise<vscode.CustomDocument> {
    vscode.window.showInformationMessage("openCustomDocument");
    return await AlsDocument.create(uri);
  }

  async resolveCustomEditor(document: AlsDocument, webviewPanel: vscode.WebviewPanel,_token: vscode.CancellationToken): Promise<void> {
    vscode.window.showInformationMessage("resolveCustomEditor");
    webviewPanel.webview.options = {
      enableScripts: true,
    };

    webviewPanel.webview.html = await AlsDocument.displayOriginalContent(document.uri, webviewPanel.webview, this._context);
  }

  public static register(context: vscode.ExtensionContext) {
    console.log("AlsReadonlyViewerProvider.regsiter called");

    return vscode.window.registerCustomEditorProvider(AlsReadonlyViewerProvider.viewType,
      new AlsReadonlyViewerProvider(context),
      {
        webviewOptions: {
          retainContextWhenHidden: true,
        },
        supportsMultipleEditorsPerDocument: false,
      }
    );
  }
}
