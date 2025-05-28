const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

let execa;
try {
  const execaModule = require('execa');
  if (typeof execaModule === 'function') {
    execa = execaModule;
  } else if (execaModule && typeof execaModule.execa === 'function') {
    execa = execaModule.execa;
  } else if (execaModule && typeof execaModule.default === 'function') {
    execa = execaModule.default;
  } else {
    ({ execa } = execaModule);
  }
} catch (fallbackError) {
  execa = async () => {
    throw new Error('Execa module not available - extension may need to be rebuilt');
  };
}

let mcpServerProcess = null;
let extensionContext = null;

function activate(context) {
  extensionContext = context;
  
  let startDisposable = vscode.commands.registerCommand('mcp-server.start', startMCPServer);
  let stopDisposable = vscode.commands.registerCommand('mcp-server.stop', stopMCPServer);
  
  context.subscriptions.push(startDisposable, stopDisposable);
  
  // Auto-start the server silently
  startMCPServer();
}

async function startMCPServer() {
  if (mcpServerProcess) {
    return;
  }
  
  try {
    if (typeof execa !== 'function') {
      return;
    }
    
    const extensionPath = extensionContext?.extensionPath;
    if (!extensionPath) {
      throw new Error("Could not determine extension path");
    }
    
    const pythonScriptPath = path.join(extensionPath, 'mcp_server.py');
    
    // Find Python executable
    const pythonPaths = [
      'python', 'python3', 'py',
      'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Programs\\Python\\Python313\\python.exe',
      'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Microsoft\\WindowsApps\\python.exe'
    ];
    
    let pythonPath = null;
    for (const path of pythonPaths) {
      try {
        await execa(path, ['--version'], { shell: true, timeout: 5000 });
        pythonPath = path;
        break;
      } catch (error) {
        continue;
      }
    }
    
    if (!pythonPath) {
      return;
    }
    
    // Install dependencies silently
    try {
      await execa(pythonPath, ['-m', 'pip', 'install', 'fastmcp>=0.1.0'], { shell: true });
    } catch (pipError) {
      // Continue anyway
    }
    
    // Start server
    mcpServerProcess = execa(pythonPath, [pythonScriptPath], { shell: true });
    
    mcpServerProcess.on('close', (code) => {
      mcpServerProcess = null;
    });
    
  } catch (error) {
    // Fail silently
  }
}

async function stopMCPServer() {
  if (!mcpServerProcess) {
    return;
  }
  
  try {
    mcpServerProcess.kill();
    mcpServerProcess = null;
  } catch (error) {
    // Fail silently
  }
}

function deactivate() {
  if (mcpServerProcess) {
    mcpServerProcess.kill();
    mcpServerProcess = null;
  }
}

module.exports = {
  activate,
  deactivate
};
