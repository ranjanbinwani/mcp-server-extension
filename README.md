# MCP Server Extension

Simple VS Code extension that automatically starts an MCP server for GitHub Copilot tool discovery.

## Features

- Auto-starts MCP server when extension loads
- Three built-in tools for GitHub Copilot
- No configuration required

## Available Tools

- **add_numbers** - Add two numbers together
- **get_weather** - Get weather forecast (simulated)  
- **list_files** - List files in a directory

## Installation

### Option 1: Download Pre-built Extension
1. Download the latest `.vsix` file from the [releases](https://github.com/ranjanbinwani/mcp-server-extension/releases) or directly from this repository
2. Open VS Code
3. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) to open the Command Palette
4. Type "Extensions: Install from VSIX..." and select it
5. Browse and select the downloaded `.vsix` file
6. Restart VS Code if prompted

### Option 2: Build from Source
1. Clone this repository:
   ```bash
   git clone https://github.com/ranjanbinwani/mcp-server-extension.git
   cd mcp-server-extension
   ```
2. Install VS Code Extension Manager (if not already installed):
   ```bash
   npm install -g vsce
   ```
3. Package the extension:
   ```bash
   vsce package
   ```
4. Install the generated `.vsix` file using the steps from Option 1

## Usage

1. **Install the extension** - The extension automatically configures itself when VS Code loads
2. **Restart VS Code** after installation to ensure proper configuration
3. **Open GitHub Copilot Chat**
4. **Ask questions** like:
   - "Add 15 and 27"
   - "What's the weather forecast for New York for 3 days?" 
   - "List files in the current directory"

GitHub Copilot will automatically discover and use the tools through the MCP protocol.

## How It Works

The extension automatically:
- Installs the required Python dependencies (`fastmcp`)
- Configures the MCP server for GitHub Copilot discovery
- Sets up the proper MCP configuration files
- Makes the tools available through the stdio protocol

## Troubleshooting

If GitHub Copilot doesn't discover the tools:

1. **Restart VS Code** completely
2. **Check Python installation** - Ensure Python 3.x is available in your PATH
3. **Manual configuration** - The extension creates configuration files at:
   - `%USERPROFILE%\.vscode\mcp_servers.json`
   - `%USERPROFILE%\AppData\Roaming\Claude\claude_desktop_config.json`
4. **Test the server** independently:
   ```bash
   python mcp_server.py
   ```
   The server should start and wait for stdio input.

## Requirements

- Python 3.x (in PATH)
- VS Code 1.80.0+
- GitHub Copilot extension
- For building: Node.js and npm

## Development & Building

### Making Changes to the Extension

1. **Modify the code** - Edit `extension.js`, `mcp_server.py`, or other files as needed
2. **Test your changes**:
   - Press `F5` in VS Code to open an Extension Development Host window
   - Test the extension functionality in the new window
3. **Update version numbers**:
   - Increment the `version` field in `package.json`
   - Update `server_version` in `mcp_server.py` if you modified the server
4. **Build the extension**:
   ```bash
   vsce package
   ```
   This creates a new `.vsix` file with your changes
5. **Install and test** the new `.vsix` file using the installation steps above

### Adding New Tools

Edit `mcp_server.py` to add your own tools:

```python
@server.tool()
def my_custom_tool(param: str) -> str:
    """Description of what your tool does."""
    return f"Processed: {param}"
```

After adding tools:
1. **Save the file**
2. **Test the Python server** independently: `python mcp_server.py`
3. **Rebuild the extension**: `vsce package`
4. **Reinstall** the updated `.vsix` file
5. **Restart VS Code** to reload the MCP configuration

### Publishing Changes

1. **Update the repository**:
   ```bash
   git add .
   git commit -m "Description of your changes"
   git push origin main
   ```
2. **Include the .vsix file** in your commits so users can download the latest version
3. **Create a release** (optional) for major updates:
   - Go to your GitHub repository
   - Click "Releases" → "Create a new release"
   - Upload the `.vsix` file as a release asset

## License

MIT
