# ubuild-url

A post-build tool that replaces relative paths (`./`) in your static files with a base URL, making them work correctly when deployed. This allows you to host your built files on any URL without worrying about broken links and paste in the built html to SquareSpace or other CMS platforms.

## Features

- Replaces all instances of `./` with the provided base URL in supported file types
- Processes HTML, JS, CSS, JSON, XML, SVG, and text files
- Creates a `processed` directory to store modified files while preserving original structure
- Validates input paths and URLs before processing
- Provides detailed progress reporting

## Installation

1. Install Bun (if not already installed):
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

## Usage

Run the tool after your build process:

```bash
bun run index.ts <dist-folder> <url>
```

## Build OS-Specific Binaries
You can build OS-specific binaries to `./ubuild-url` using the following commands:
### Linux:
  ```bash
  bun run build-linux
  ```
### macOS (Intel):
  ```bash
  bun run build-osx
  ```
### macOS (Apple Silicon):
  ```bash
  bun run build-osx-mchip
  ```
### Windows:
  ```bash
  bun run build-windows
  ```

### Arguments

- `<dist-folder>`: Path to your built files (default: `./dist`)
- `<url>`: Base URL for your deployment (e.g., `https://example.com`)

## Example

```bash
bun run index.ts dist https://myapp.com
```

This will:
1. Process all files in the `dist` directory
2. Replace `./` with `https://myapp.com/`
3. Save modified files to `dist/processed`

## Supported File Types

- HTML (`.html`)
- JavaScript (`.js`)
- CSS (`.css`)
- JSON (`.json`)
- XML (`.xml`)
- SVG (`.svg`)
- Text (`.txt`)

## Output

After processing, you'll see output like:
```
🔧 Post-build: Replacing relative paths with URL...
📍 Using URL: https://myapp.com
📦 Found 42 files in dist folder (excluding processed directory)
  ✅ Modified: assets/js/main.js
  📄 Copied: index.html
  ✅ Modified: styles/main.css

✨ Post-build complete!
📊 Processed 42 files, modified 15 files
📁 Output saved to: dist/processed
```

## License

MIT