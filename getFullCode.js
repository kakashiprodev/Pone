import fs from 'fs/promises';
import path from 'path';
import * as glob from 'glob';

const foldersToInclude = ['src/components', 'src/views', 'src/stores', 'src/services'];

const rootDir = '.'; // Set the path to your repository
const outputFile = path.join(rootDir, 'repository_contents.md');

async function categorizeFiles() {
    const files = [];

    for (const folder of foldersToInclude) {
        const folderFiles = glob.sync(`${folder}/**/*.{vue,ts}`, { cwd: rootDir });
        files.push(...folderFiles);
    }

    let markdownContent = `# Repository\n\n`;

    for (const file of files) {
        const filePath = path.join(rootDir, file);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        let category = 'Other';

        if (file.includes('src/components/')) category = 'UI Components';
        else if (file.includes('src/views/')) category = 'UI Views';
        else if (file.includes('src/stores/')) category = 'Pinia Stores';
        else if (file.endsWith('.ts')) category = 'Services';

        markdownContent += `## ${category}: ${file}\n\n\`\`\`${file.endsWith('.ts') ? 'typescript' : 'vue'}\n${fileContent}\n\`\`\`\n\n`;
    }

    await fs.writeFile(outputFile, markdownContent);
    console.log(`Markdown file created at ${outputFile}`);
}

categorizeFiles().catch(console.error);
