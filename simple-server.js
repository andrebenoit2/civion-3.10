import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = createServer(async (req, res) => {
    try {
        let path = req.url === '/' ? '/index.html' : req.url;
        const filePath = join(__dirname, path);
        const content = await readFile(filePath);
        
        const ext = path.split('.').pop();
        const contentType = {
            'html': 'text/html',
            'css': 'text/css',
            'js': 'text/javascript',
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif'
        }[ext] || 'text/plain';

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    } catch (err) {
        res.writeHead(404);
        res.end('File not found');
    }
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});
