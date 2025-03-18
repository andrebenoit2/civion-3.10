const fs = require('fs');
const path = require('path');

// Get all HTML files in the directory
const directory = __dirname;
const htmlFiles = fs.readdirSync(directory).filter(file => file.endsWith('.html'));

// Mobile navigation HTML to insert
const mobileNavHTML = `
            <div class="mobile-menu-toggle">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </nav>
        <div class="mobile-nav">
            <a href="demo.html">Demo</a>
            <a href="faq.html">FAQ</a>
            <a href="https://calendly.com/management-civion/30min" target="_blank" class="request-demo-btn">Schedule Demo</a>
        </div>
    </header>`;

// JavaScript to add at the end of each file
const mobileScript = `
    <script>
        // Mobile menu toggle functionality
        document.addEventListener('DOMContentLoaded', function() {
            const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
            const mobileNav = document.querySelector('.mobile-nav');
            
            if (mobileMenuToggle && mobileNav) {
                mobileMenuToggle.addEventListener('click', function() {
                    mobileMenuToggle.classList.toggle('active');
                    mobileNav.classList.toggle('active');
                });
            }
        });
    </script>
</body>`;

// Process each HTML file
htmlFiles.forEach(file => {
    const filePath = path.join(directory, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip index.html as it's already updated
    if (file === 'index.html') {
        console.log(`Skipping ${file} (already updated)`);
        return;
    }
    
    // Add mobile-styles.css link
    if (!content.includes('mobile-styles.css')) {
        content = content.replace(
            /<link rel="stylesheet" href="styles.css">/,
            '<link rel="stylesheet" href="styles.css">\n    <link rel="stylesheet" href="mobile-styles.css">'
        );
    }
    
    // Add mobile navigation
    if (!content.includes('mobile-menu-toggle')) {
        // Try to find the navigation section
        const navPattern = /<div class="nav-links">[\s\S]*?<\/div>\s*<\/nav>/;
        const navMatch = content.match(navPattern);
        
        if (navMatch) {
            const navSection = navMatch[0];
            const updatedNav = navSection.replace(
                /<\/div>\s*<\/nav>/,
                '</div>\n            <div class="mobile-menu-toggle">\n                <span></span>\n                <span></span>\n                <span></span>\n            </div>\n        </nav>'
            );
            
            content = content.replace(navSection, updatedNav);
            
            // Add mobile nav after header opening tag
            content = content.replace(
                /<header>[\s\S]*?<\/nav>/,
                match => match + '\n        <div class="mobile-nav">\n            <a href="demo.html">Demo</a>\n            <a href="faq.html">FAQ</a>\n            <a href="https://calendly.com/management-civion/30min" target="_blank" class="request-demo-btn">Schedule Demo</a>\n        </div>'
            );
        }
    }
    
    // Add mobile menu JavaScript
    if (!content.includes('Mobile menu toggle functionality')) {
        content = content.replace(
            /<\/body>/,
            mobileScript
        );
    }
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file} with mobile optimizations`);
});

console.log('All HTML files have been updated with mobile optimizations');
