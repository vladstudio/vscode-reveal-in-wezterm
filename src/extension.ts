import * as vscode from 'vscode';
import { spawn } from 'child_process';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    const revealFileCommand = vscode.commands.registerCommand(
        'revealInWezterm.revealFile',
        (uri?: vscode.Uri) => {
            const filePath = getFilePath(uri);
            if (filePath) {
                openWezterm(filePath);
            }
        }
    );

    const revealProjectCommand = vscode.commands.registerCommand(
        'revealInWezterm.revealProject',
        () => {
            const projectPath = getProjectPath();
            if (projectPath) {
                openWezterm(projectPath);
            }
        }
    );

    context.subscriptions.push(revealFileCommand, revealProjectCommand);
}

function getFilePath(uri?: vscode.Uri): string | undefined {
    if (uri) {
        return uri.fsPath;
    }

    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        return path.dirname(activeEditor.document.fileName);
    }

    return getProjectPath();
}

function getProjectPath(): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
        return workspaceFolders[0].uri.fsPath;
    }
    return undefined;
}

function openWezterm(filePath: string) {
    try {
        console.log(`Opening WezTerm at: ${filePath}`);

        // Use wezterm cli spawn to create a new tab in existing window
        const child = spawn('wezterm', ['cli', 'spawn', '--cwd', filePath], {
            detached: true,
            stdio: 'ignore'
        });

        child.unref();

        child.on('error', (error) => {
            console.error('Failed to open WezTerm:', error);
            vscode.window.showErrorMessage(
                `Failed to open WezTerm: ${error.message}. Make sure WezTerm is installed and available in PATH.`
            );
        });

        // Focus WezTerm application after spawning new tab
        spawn('osascript', ['-e', 'tell application "WezTerm" to activate'], {
            detached: true,
            stdio: 'ignore'
        });

    } catch (error) {
        console.error('Error opening WezTerm:', error);
        vscode.window.showErrorMessage(
            `Failed to open WezTerm: ${error}. Make sure WezTerm is installed and available in PATH.`
        );
    }
}

export function deactivate() {}