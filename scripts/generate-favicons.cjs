const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Master Vector Icon matching the site's brand logo exactly:
// White rounded squircle container with crisp dark chess king emblem
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <!-- White squircle container matching header brand logo -->
  <rect width="512" height="512" rx="140" fill="#ffffff" />
  <!-- Subtle hairline border for crisp contrast on light/white backgrounds -->
  <rect x="2" y="2" width="508" height="508" rx="138" fill="none" stroke="#e5e7eb" stroke-width="4" />

  <!-- Black chess king / crown glyph matching the site brand logo -->
  <g fill="#171717">
    <!-- Top Finial Orb -->
    <circle cx="256" cy="160" r="18" />

    <!-- Central Vertical Stem -->
    <rect x="246" y="162" width="20" height="46" rx="3" />

    <!-- Crown Body & Base -->
    <path d="M 246 208
             C 234 200 215 192 192 192
             C 162 192 140 214 140 244
             C 140 268 152 284 165 296
             L 165 378
             C 165 382 168 384 174 384
             L 338 384
             C 344 384 347 382 347 378
             L 347 296
             C 360 284 372 268 372 244
             C 372 214 350 192 320 192
             C 297 192 278 200 266 208
             Z" />
  </g>
</svg>`;

function buildIco(pngBuffers) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // ICO format = 1
  header.writeUInt16LE(pngBuffers.length, 4);

  let offset = 6 + 16 * pngBuffers.length;
  const dirEntries = [];

  for (const { width, height, buffer } of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(width >= 256 ? 0 : width, 0);
    entry.writeUInt8(height >= 256 ? 0 : height, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    dirEntries.push(entry);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map(p => p.buffer)]);
}

async function main() {
  const publicDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Write favicon.svg
  const svgPath = path.join(publicDir, 'favicon.svg');
  fs.writeFileSync(svgPath, svgContent, 'utf8');
  console.log('✓ Created', svgPath);

  const svgBuffer = Buffer.from(svgContent);

  // 2. Generate apple-touch-icon.png (180x180)
  const appleTouchPath = path.join(publicDir, 'apple-touch-icon.png');
  await sharp(svgBuffer).resize(180, 180).png().toFile(appleTouchPath);
  console.log('✓ Created', appleTouchPath);

  // 3. Generate favicon-96x96.png (96x96)
  const favicon96Path = path.join(publicDir, 'favicon-96x96.png');
  await sharp(svgBuffer).resize(96, 96).png().toFile(favicon96Path);
  console.log('✓ Created', favicon96Path);

  // 4. Generate web-app-manifest-192x192.png (192x192)
  const pwa192Path = path.join(publicDir, 'web-app-manifest-192x192.png');
  await sharp(svgBuffer).resize(192, 192).png().toFile(pwa192Path);
  console.log('✓ Created', pwa192Path);

  // 5. Generate web-app-manifest-512x512.png (512x512)
  const pwa512Path = path.join(publicDir, 'web-app-manifest-512x512.png');
  await sharp(svgBuffer).resize(512, 512).png().toFile(pwa512Path);
  console.log('✓ Created', pwa512Path);

  // 6. Generate favicon.ico (16x16, 32x32, 48x48)
  const ico16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
  const ico32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  const ico48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();

  const icoBuffer = buildIco([
    { width: 16, height: 16, buffer: ico16 },
    { width: 32, height: 32, buffer: ico32 },
    { width: 48, height: 48, buffer: ico48 }
  ]);
  const icoPath = path.join(publicDir, 'favicon.ico');
  fs.writeFileSync(icoPath, icoBuffer);
  console.log('✓ Created', icoPath);

  // 7. Write site.webmanifest
  const manifest = {
    name: "チェスweb - 無料オンラインチェス",
    short_name: "チェスweb",
    description: "登録不要ですぐに遊べる無料オンラインチェス。Stockfish AI対戦・リアルタイム2人対戦・戦術学習に対応。",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
  const manifestPath = path.join(publicDir, 'site.webmanifest');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log('✓ Created', manifestPath);

  console.log('All icons and manifest updated to match the site logo!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
