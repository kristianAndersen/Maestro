#!/usr/bin/env python3
"""
Gemini Delegator - Send heavy context tasks to Gemini CLI and get structured summaries
"""

import subprocess
import sys
import json
from pathlib import Path


def estimate_tokens(text):
    """Rough token estimation (1 token ≈ 4 characters)"""
    return len(text) // 4


def should_delegate(file_paths=None, total_lines=None, file_count=None):
    """
    Determine if task should be delegated to Gemini based on context size
    
    Delegation triggers:
    - Single file > 1000 lines
    - Multiple files (>5) 
    - Total lines across files > 2000
    - Explicit request for codebase analysis
    """
    if file_count and file_count > 5:
        return True
    if total_lines and total_lines > 2000:
        return True
    if file_paths:
        for path in file_paths:
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    lines = len(f.readlines())
                    if lines > 1000:
                        return True
            except:
                pass
    return False


def delegate_to_gemini(prompt, files=None, custom_instructions=None):
    """
    Send task to Gemini CLI and return structured summary
    
    Args:
        prompt: The analysis task
        files: List of file paths to include
        custom_instructions: Optional additional instructions
    
    Returns:
        dict: Structured summary for Claude Code
    """
    
    # Build Gemini prompt
    full_prompt = f"""You are analyzing code/documents for Claude Code (an AI coding assistant).
Your job is to do the heavy lifting of reading and analyzing large contexts, then provide
a structured summary that Claude Code can use to do precise implementation work.

TASK: {prompt}

"""
    
    if custom_instructions:
        full_prompt += f"\nADDITIONAL INSTRUCTIONS: {custom_instructions}\n"
    
    full_prompt += """
Please provide a structured summary in JSON format with these sections:

{
  "overview": "Brief summary of what you analyzed",
  "key_findings": ["List of important discoveries, patterns, or issues"],
  "file_structure": {
    "description": "Organization and architecture overview",
    "main_components": ["Key files/modules and their purposes"]
  },
  "recommendations": ["Actionable suggestions for Claude Code"],
  "areas_of_concern": ["Specific issues that need attention"],
  "code_snippets": [
    {
      "file": "path/to/file",
      "line_range": "10-20",
      "issue": "Description of issue",
      "suggestion": "How to fix it"
    }
  ]
}

Be concise but thorough. Focus on actionable insights.
"""
    
    # Build gemini-cli command
    cmd = ["gemini", full_prompt]
    
    # Add files if provided
    if files:
        for file in files:
            if Path(file).exists():
                cmd.extend(["--file", file])
    
    try:
        # Run Gemini CLI
        print("🔄 Delegating to Gemini...", file=sys.stderr)
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=120  # 2 minute timeout
        )
        
        if result.returncode != 0:
            return {
                "error": "Gemini CLI failed",
                "stderr": result.stderr,
                "overview": "Failed to analyze with Gemini"
            }
        
        # Try to parse JSON response
        try:
            # Extract JSON from markdown code blocks if present
            response = result.stdout.strip()
            if "```json" in response:
                response = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                response = response.split("```")[1].split("```")[0].strip()
            
            summary = json.loads(response)
            print("✅ Gemini analysis complete", file=sys.stderr)
            return summary
        except json.JSONDecodeError:
            # If not JSON, return as plain text summary
            return {
                "overview": "Gemini analysis (unstructured)",
                "raw_response": result.stdout,
                "key_findings": ["See raw_response for full analysis"]
            }
    
    except subprocess.TimeoutExpired:
        return {
            "error": "Gemini analysis timed out (>2 minutes)",
            "overview": "Analysis took too long"
        }
    except Exception as e:
        return {
            "error": f"Unexpected error: {str(e)}",
            "overview": "Failed to complete Gemini analysis"
        }


def format_for_claude(summary):
    """Format Gemini summary in a Claude-friendly way"""
    output = []
    
    output.append("=" * 60)
    output.append("GEMINI ANALYSIS SUMMARY")
    output.append("=" * 60)
    output.append("")
    
    if "error" in summary:
        output.append(f"⚠️  ERROR: {summary['error']}")
        return "\n".join(output)
    
    # Overview
    if "overview" in summary:
        output.append(f"OVERVIEW:\n{summary['overview']}")
        output.append("")
    
    # Key Findings
    if "key_findings" in summary and summary["key_findings"]:
        output.append("KEY FINDINGS:")
        for i, finding in enumerate(summary["key_findings"], 1):
            output.append(f"  {i}. {finding}")
        output.append("")
    
    # File Structure
    if "file_structure" in summary:
        fs = summary["file_structure"]
        output.append("FILE STRUCTURE:")
        if "description" in fs:
            output.append(f"  {fs['description']}")
        if "main_components" in fs:
            output.append("  Main Components:")
            for comp in fs["main_components"]:
                output.append(f"    - {comp}")
        output.append("")
    
    # Recommendations
    if "recommendations" in summary and summary["recommendations"]:
        output.append("RECOMMENDATIONS FOR CLAUDE CODE:")
        for i, rec in enumerate(summary["recommendations"], 1):
            output.append(f"  {i}. {rec}")
        output.append("")
    
    # Areas of Concern
    if "areas_of_concern" in summary and summary["areas_of_concern"]:
        output.append("AREAS OF CONCERN:")
        for i, concern in enumerate(summary["areas_of_concern"], 1):
            output.append(f"  {i}. {concern}")
        output.append("")
    
    # Code Snippets
    if "code_snippets" in summary and summary["code_snippets"]:
        output.append("SPECIFIC CODE ISSUES:")
        for i, snippet in enumerate(summary["code_snippets"], 1):
            output.append(f"\n  Issue #{i}:")
            output.append(f"    File: {snippet.get('file', 'unknown')}")
            output.append(f"    Lines: {snippet.get('line_range', 'unknown')}")
            output.append(f"    Problem: {snippet.get('issue', 'unknown')}")
            output.append(f"    Fix: {snippet.get('suggestion', 'unknown')}")
        output.append("")
    
    # Raw response if present
    if "raw_response" in summary:
        output.append("-" * 60)
        output.append("FULL GEMINI RESPONSE:")
        output.append("-" * 60)
        output.append(summary["raw_response"])
    
    output.append("=" * 60)
    output.append("END GEMINI ANALYSIS")
    output.append("=" * 60)
    
    return "\n".join(output)


if __name__ == "__main__":
    # Example usage
    if len(sys.argv) < 2:
        print("Usage: python delegate_to_gemini.py <prompt> [--files file1 file2 ...] [--instructions 'custom instructions']")
        sys.exit(1)
    
    prompt = sys.argv[1]
    files = []
    custom_instructions = None
    
    i = 2
    while i < len(sys.argv):
        if sys.argv[i] == "--files":
            i += 1
            while i < len(sys.argv) and not sys.argv[i].startswith("--"):
                files.append(sys.argv[i])
                i += 1
        elif sys.argv[i] == "--instructions":
            i += 1
            if i < len(sys.argv):
                custom_instructions = sys.argv[i]
                i += 1
        else:
            i += 1
    
    # Delegate to Gemini
    summary = delegate_to_gemini(prompt, files, custom_instructions)
    
    # Format and print
    formatted = format_for_claude(summary)
    print(formatted)
