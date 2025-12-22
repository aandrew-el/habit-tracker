const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, '..', 'public');

// Create a simple HabitFlow icon - blue circle with white checkmark
async function generateIcon(size) {
  const padding = Math.floor(size * 0.15);
  const circleSize = size - (padding * 2);
  const strokeWidth = Math.max(2, Math.floor(size * 0.08));

  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.2}"/>
      <polyline
        points="${size * 0.25},${size * 0.5} ${size * 0.42},${size * 0.67} ${size * 0.75},${size * 0.33}"
        fill="none"
        stroke="white"
        stroke-width="${strokeWidth}"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `;

  const outputPath = path.join(publicDir, `icon-${size}x${size}.png`);

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);

  console.log(`Generated: icon-${size}x${size}.png`);
}

// Also create favicon.ico and apple-touch-icon
async function generateFavicon() {
  const size = 32;
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.2}"/>
      <polyline
        points="${size * 0.25},${size * 0.5} ${size * 0.42},${size * 0.67} ${size * 0.75},${size * 0.33}"
        fill="none"
        stroke="white"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `;

  // Create favicon as PNG (browsers accept it)
  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('Generated: favicon.ico');

  // Create 16x16 favicon
  const svg16 = `
    <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="16" height="16" fill="url(#grad)" rx="3"/>
      <polyline
        points="4,8 6.7,10.7 12,5.3"
        fill="none"
        stroke="white"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `;

  await sharp(Buffer.from(svg16))
    .png()
    .toFile(path.join(publicDir, 'favicon-16x16.png'));

  console.log('Generated: favicon-16x16.png');
}

async function generateAppleTouchIcon() {
  const size = 180;
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#grad)"/>
      <polyline
        points="${size * 0.25},${size * 0.5} ${size * 0.42},${size * 0.67} ${size * 0.75},${size * 0.33}"
        fill="none"
        stroke="white"
        stroke-width="14"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  console.log('Generated: apple-touch-icon.png');
}

async function main() {
  console.log('Generating PWA icons...\n');

  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Generate all sizes
  for (const size of sizes) {
    await generateIcon(size);
  }

  await generateFavicon();
  await generateAppleTouchIcon();

  console.log('\nAll icons generated successfully!');
}

main().catch(console.error);
