import { promisify, TextDecoder } from 'util';
import * as vscode from 'vscode';
import { Disposable } from 'vscode';
const fs = require('fs');

class AlsDocument extends Disposable implements vscode.CustomDocument {

	static async create(
		uri: vscode.Uri,
	): Promise<AlsDocument | PromiseLike<AlsDocument>> {
		const fileData = await AlsDocument.displayOriginalContent(uri);
		return new AlsDocument(uri, fileData);
        //return new AlsDocument(uri, "fileData");
	}

	private readonly _uri: vscode.Uri;

	private _documentData: string;

	private constructor(uri: vscode.Uri, initialContent: string) {
        super(() => {});
		this._uri = uri;
		this._documentData = initialContent;
	}

	private static async displayOriginalContent(uri: vscode.Uri): Promise<string> {
		const header = "<html><textarea style='border:none;'>";
		const footer = "</textarea></html>";

		return header + (await this.readFile(uri)).toString() + footer;
	}

    private static async loadToBuffer(fileName: String) {
        const fsPromises = require('fs').promises;
        const data = await fsPromises.readFile(fileName)
                           .catch((err : any) => console.error('Failed to read file', err));
      
        return Buffer.from(data);
    }	

	private static async readFile(uri: vscode.Uri): Promise<string> {

        vscode.window.showInformationMessage(uri.fsPath);
        console.log(uri);
        if (uri.scheme === 'untitled') {
			return "";
		}

        const fileData = await this.loadToBuffer(uri.fsPath);
        vscode.window.showInformationMessage("readFile");        

        const { deflate, unzip } = require('zlib');
        const doUnzip = promisify(unzip);
        var result = "";

        doUnzip(fileData)
			.then((buf : any) => {
				console.log(buf.toString());
				return buf.toString(); //result = "buf.toString()")
			})
            .catch((err : any) => {
                console.error('An error occurred:', err);
                process.exitCode = 1;
        });

		return result;
	}

	public get uri() { return this._uri; }

	public get documentData(): string { return this._documentData; }

    dispose(): void {
		super.dispose();
	}
}

export class AlsReadonlyViewerProvider implements vscode.CustomReadonlyEditorProvider {

    private static readonly viewType = 'abletonalsreadonlyviewer';

    async openCustomDocument(uri: vscode.Uri, openContext: vscode.CustomDocumentOpenContext, token: vscode.CancellationToken): Promise<vscode.CustomDocument> {
        vscode.window.showInformationMessage("openCustomDocument");
        return await AlsDocument.create(uri);
    }

	async resolveCustomEditor(document: AlsDocument, webviewPanel: vscode.WebviewPanel,	_token: vscode.CancellationToken): Promise<void> {
        vscode.window.showInformationMessage("resolveCustomEditor");     
		webviewPanel.webview.options = {
			enableScripts: true,
		};

        webviewPanel.webview.html = document.documentData;        
	}

    public static register(context: vscode.ExtensionContext) {

        console.log("AlsReadonlyViewerProvider.regsiter called");
        vscode.window.showInformationMessage("AlsReadonlyViewerProvider.regsiter called");

		return vscode.window.registerCustomEditorProvider(
			AlsReadonlyViewerProvider.viewType,
			new AlsReadonlyViewerProvider(),
			{
				webviewOptions: {
					retainContextWhenHidden: true,
				},
				supportsMultipleEditorsPerDocument: false,
			});        
    }
}