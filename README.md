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

## Usage

1. Install the extension
2. Open GitHub Copilot Chat
3. Ask questions like "Add 15 and 27" or "List files in current directory"

GitHub Copilot will automatically discover and use the tools.

## Requirements

- Python 3.x
- VS Code 1.80.0+

## Adding Custom Tools

Edit `mcp_server.py` to add your own tools:

```python
@server.tool()
def my_custom_tool(param: str) -> str:
    """Description of what your tool does."""
    return f"Processed: {param}"
```

Restart the extension to load new tools.

## License

MIT
