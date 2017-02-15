/*
 * @CreateTime: Feb 14, 2017 3:19 PM
 * @Author: wh01am
 * @Contact: wh0197m@gmail.com
 * @Last Modified By: wh01am
 * @Last Modified Time: Feb 14, 2017 3:19 PM
 * @Description: extension logic
 */
import * as vscode from 'vscode';
import * as moment from 'moment'
import {window, commands, Disposable, ExtensionContext, TextDocument} from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "CodeHeader" is now active!');
    let codeHeader = new CodeHeaderGen();
    let config = vscode.workspace.getConfiguration('codeheader');
    var disposable = vscode.commands.registerCommand('extension.insertHeader', () => {
        codeHeader.insertHeader();
    });

    context.subscriptions.push(codeHeader);
    context.subscriptions.push(disposable);
    vscode.workspace.onDidSaveTextDocument( (file) => {
      setTimeout(function() {
        try {
          let f = file;
          let editor = vscode.window.activeTextEditor;
          let document = editor.document;
          let updateTime = null;
          let updateAuthor = null;
          let timeLine = null;
          let authorLine = null;
          let prefix = null;
          // CodeHeader default set comments within the first 10 lines
          for (let i = 0; i < 10; ++i) {
            let line = document.lineAt(i);
            let content = line.text.trim();
            if (content.indexOf('@Last\ Modified\ Time') > -1) {
              updateTime = moment().format('lll');
              timeLine = line.range;
              prefix = content.startsWith('#') ? '#' : ' *';
            }
            if (content.indexOf('@Last\ Modified\ By') > -1) {
              updateAuthor = String(config.get('author'));
              authorLine = line.range;
            }
          }
          if ((updateAuthor !== null) && (updateTime !== null)) {
            setTimeout(function() {
              editor.edit(function(edit) {
                edit.replace(timeLine, `${prefix} @Last Modified Time: ${updateTime}`);
                edit.replace(authorLine, `${prefix} @Last Modified By: ${updateAuthor}`);
              })
            }, 200)
          }
        } catch (err) {
          console.error(err);
        }
      },200)
    })
}

class CodeHeaderGen {
    private _disposable: Disposable;
    public insertHeader() {

        // Get the current text editor
        let editor = window.activeTextEditor;
        if (!editor) {
            return;
        }

        let config = vscode.workspace.getConfiguration('codeheader');

        // Get the fileType
        let fileName = vscode.window.activeTextEditor.document.fileName
        let fileType = fileName.lastIndexOf('.') > -1 ? fileName.substr(fileName.lastIndexOf('.') + 1) : 'None';

        // Define header content
        // var header = moment().format('llll');
        var header = diffComment(fileType, config);

        // Get the document
        var doc = editor.document;

        // Insert header
        editor.edit((eb) => {
            eb.insert(doc.positionAt(0), header);
        });
    }

     dispose() {
        this._disposable.dispose();
    }
}

// output difference comment style based on file type
function diffComment(type, config) {
  var template: string;
  var currentTime = moment().format('lll');
  if (type === 'js' || type === 'c' || type === 'cpp' || type === 'ts' || type === 'go') {
    template = `/*\r\n * @CreateTime: ${currentTime} \r\n * @Author: ${config.author} \r\n * @Contact: ${config.contact} \r\n * @Last Modified By: ${config.author} \r\n * @Last Modified Time: ${currentTime} \r\n * @Description: Modify Here, Please  \r\n */\r\n`
  } else if (type === 'py' || type === 'rb') {
    template = `# @CreateTime: ${currentTime} \r\n# @Author: ${config.author} \r\n# @Contact: ${config.contact} \r\n# @Last Modified By: ${config.author} \r\n# @Last Modified Time: ${currentTime} \r\n# @Description: Modify Here, Please \r\n`
  } else if (type === 'sh') {
    template = `#！/bin/bash - \r\n# @CreateTime: ${currentTime} \r\n# @Author: ${config.author} \r\n# @Contact: ${config.contact} \r\n# @Last Modified By: ${config.author} \r\n# @Last Modified Time: ${currentTime} \r\n# @Description: Modify Here, Please \r\n`
  } else {
    template = `/*\r\n * @CreateTime: ${currentTime} \r\n * @Author: ${config.author} \r\n * @Contact: ${config.contact} \r\n * @Last Modified By: ${config.author} \r\n * @Last Modified Time: ${currentTime} \r\n * @Description: Modify Here, Please  \r\n */\r\n`
  }
  return template;
}
