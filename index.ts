const fs = require('fs');
const path = require('path');


// check if process.argv[2] is a valid path
try{
	if(process.argv.length < 3){
		throw new Error('No dist folder provided. Usage: node index.js <dist-folder> <url>');
	}
	const distFolder = process.argv[2] as string;
	const fullDistPath = path.isAbsolute(distFolder) ? distFolder : path.join(__dirname, distFolder);
	if(!fs.existsSync(fullDistPath) || !fs.statSync(fullDistPath).isDirectory()){
		throw new Error('Dist folder does not exist or is not a directory: ' + fullDistPath);
	}
}catch(e){
	console.error('❌ Invalid dist folder provided:', e.message);
	process.exit(1);
}	

try{
	// check if process.argv[3] is a valid url
	if(process.argv.length < 4){
		throw new Error('No URL provided. Usage: node index.js <dist-folder> <url>');
	}
	new URL(process.argv[3] as string);
}catch(e){
	console.error('❌ Invalid URL provided:', e.message);
	process.exit(1);
}

const url = process.argv[3];


/**
 * Recursively get all files in a directory
 */
function getAllFiles(dirPath, arrayOfFiles = [], excludeDir = null) {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const filePath = path.join(dirPath, file);

        // Skip the excluded directory
        if (excludeDir && filePath === excludeDir) {
            return;
        }

        if (fs.statSync(filePath).isDirectory()) {
            arrayOfFiles = getAllFiles(filePath, arrayOfFiles, excludeDir);
        } else {
            arrayOfFiles.push(filePath);
        }
    });

    return arrayOfFiles;
}

/**
 * Replace all instances of ./ with the URL in a file and save to processed directory
 */
function replaceRelativePathsInFile(filePath, distDir, processedDir) {
    // Only process text files (html, js, css, etc.)
    const ext = path.extname(filePath).toLowerCase();
    const textExtensions = ['.html', '.js', '.css', '.json', '.xml', '.svg', '.txt'];

    if (!textExtensions.includes(ext)) {
        return false;
    }

    try {
        let content = fs.readFileSync(filePath, 'utf-8');
        const originalContent = content;

        // Replace all instances of ./
        content = content.replace(/\.\//g, url);

        // Calculate the output path in the processed directory
        const relativePath = path.relative(distDir, filePath);
        const outputPath = path.join(processedDir, relativePath);

        // Create parent directory if it doesn't exist
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Write to the processed directory
        fs.writeFileSync(outputPath, content, 'utf-8');

        // Return true if content was modified
        return content !== originalContent;
    } catch (error) {
        console.error(`  ❌ Error processing ${filePath}:`, error.message);
        return false;
    }
}

// Main execution
async function main() {
    console.log('🔧 Post-build: Replacing relative paths with URL...');

    if (!url) {
        console.error('❌ No URL found in package.json');
        process.exit(1);
    }

    console.log(`📍 Using URL: ${url}`);

    // get all files in the dist folder, then any instance of ./ replace with url
	// get folder from the second argument of the script
	let distDir = process.argv[2] || null;
	if (distDir) {
		distDir = path.isAbsolute(distDir) ? distDir : path.join(__dirname, distDir);
	} else {
		distDir = path.join(__dirname, 'dist');
	}
    const processedDir = path.join(distDir, 'processed');

    if (!fs.existsSync(distDir)) {
        console.error(`❌ Dist folder not found: ${distDir}`);
        console.error('Please run the build script first.');
        process.exit(1);
    }

    // Create processed directory
    if (!fs.existsSync(processedDir)) {
        fs.mkdirSync(processedDir, { recursive: true });
    }

    // Get all files, excluding the processed directory
    const allFiles = getAllFiles(distDir, [], processedDir);
    console.log(`📦 Found ${allFiles.length} files in dist folder (excluding processed directory)`);

    let processedCount = 0;
    let modifiedCount = 0;

    allFiles.forEach(filePath => {
        const relativePath = path.relative(distDir, filePath);
        const wasModified = replaceRelativePathsInFile(filePath, distDir, processedDir);

        if (wasModified) {
            console.log(`  ✅ Modified: ${relativePath}`);
            modifiedCount++;
        } else {
            console.log(`  📄 Copied: ${relativePath}`);
        }
        processedCount++;
    });

    console.log(`\n✨ Post-build complete!`);
    console.log(`📊 Processed ${processedCount} files, modified ${modifiedCount} files`);
    console.log(`📁 Output saved to: ${processedDir}`);
}

main().catch(error => {
    console.error('❌ Build error:', error);
    process.exit(1);
});
