#!/usr/bin/env python3
"""
Simple MCP Server using FastMCP for VS Code extension
"""

import asyncio
import sys
from typing import Dict, Any, List, Optional
from fastmcp import FastMCP

async def main():
    server = FastMCP(
        server_name="VSCode-MCP-Server",
        server_version="0.1.0",
        description="A basic MCP server for tool exposure"
    )
    
    @server.tool()
    def add_numbers(a: float, b: float) -> float:
        """Add two numbers together.
        
        Args:
            a: The first number
            b: The second number
            
        Returns:
            The sum of the two numbers
        """
        return a + b
    
    @server.tool()
    def get_weather(location: str, days: Optional[int] = 1) -> Dict[str, Any]:
        """Get weather forecast for a location (simulated).
        
        Args:
            location: The name of the location
            days: Number of days for forecast (default: 1)
            
        Returns:
            Weather information
        """
        return {
            "location": location,
            "days": days,
            "forecast": [
                {"day": i+1, "condition": "Sunny", "temperature": 72 + i * 2}
                for i in range(days)
            ]
        }
    
    @server.tool()
    def list_files(directory: str) -> List[str]:
        """List files in a directory.
        
        Args:
            directory: The directory path
            
        Returns:
            A list of filenames
        """
        import os
        try:
            return os.listdir(directory)
        except Exception as e:
            return [f"Error: {str(e)}"]

    try:
        await server.run_http_async(host="localhost", port=8000)
    except KeyboardInterrupt:
        pass

if __name__ == "__main__":
    asyncio.run(main())
