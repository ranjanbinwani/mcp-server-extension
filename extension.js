const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const os = require('os');

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
  
  // Auto-start the server and configure MCP
  initializeMCPServer();
}

async function initializeMCPServer() {
  await configureMCPServer();
  await startMCPServer();
}

async function configureMCPServer() {
  try {
    const extensionPath = extensionContext?.extensionPath;
    if (!extensionPath) {
      return;
    }

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

    // Install dependencies
    try {
      await execa(pythonPath, ['-m', 'pip', 'install', 'fastmcp>=0.1.0'], { shell: true });
    } catch (pipError) {
      // Continue anyway
    }

    const pythonScriptPath = path.join(extensionPath, 'mcp_server.py');
    
    // Create MCP configuration for GitHub Copilot
    const mcpConfig = {
      "vscode-mcp-server": {
        "command": pythonPath,
        "args": [pythonScriptPath],
        "env": {}
      }
    };

    // Set the configuration in VS Code settings
    const config = vscode.workspace.getConfiguration('mcp');
    await config.update('servers', mcpConfig, vscode.ConfigurationTarget.Global);

    // Also write to MCP config file for direct GitHub Copilot access
    await writeMCPConfigFile(mcpConfig, pythonPath, pythonScriptPath);
    
  } catch (error) {
    // Fail silently
  }
}

async function writeMCPConfigFile(mcpConfig, pythonPath, pythonScriptPath) {
  try {
    const homeDir = os.homedir();
    
    // Create Claude Desktop config (common MCP config location)
    const claudeConfigDir = path.join(homeDir, 'AppData', 'Roaming', 'Claude');
    const claudeConfigPath = path.join(claudeConfigDir, 'claude_desktop_config.json');
    
    // Ensure directory exists
    if (!fs.existsSync(claudeConfigDir)) {
      fs.mkdirSync(claudeConfigDir, { recursive: true });
    }
    
    let existingConfig = {};
    if (fs.existsSync(claudeConfigPath)) {
      try {
        const configContent = fs.readFileSync(claudeConfigPath, 'utf8');
        existingConfig = JSON.parse(configContent);
      } catch (error) {
        // If parsing fails, start with empty config
      }
    }
    
    // Merge with existing config
    if (!existingConfig.mcpServers) {
      existingConfig.mcpServers = {};
    }
    
    existingConfig.mcpServers["vscode-mcp-server"] = {
      "command": pythonPath,
      "args": [pythonScriptPath]
    };
    
    fs.writeFileSync(claudeConfigPath, JSON.stringify(existingConfig, null, 2));
    
    // Also create a VS Code specific MCP config
    const vscodeConfigDir = path.join(homeDir, '.vscode');
    const mcpConfigPath = path.join(vscodeConfigDir, 'mcp_servers.json');
    
    if (!fs.existsSync(vscodeConfigDir)) {
      fs.mkdirSync(vscodeConfigDir, { recursive: true });
    }
    
    const vscodeConfig = {
      "mcpServers": mcpConfig
    };
    
    fs.writeFileSync(mcpConfigPath, JSON.stringify(vscodeConfig, null, 2));
    
  } catch (error) {
    // Fail silently
  }
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
    
    // Note: We don't start the server here anymore since GitHub Copilot
    // will start it automatically when needed using stdio protocol
    
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
