const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(__dirname, '../public');
const imagesDir = path.join(publicDir, 'images');

// Define clean subdirectories
const structure = {
  logos: [
    'huit_logo.png',
    'logo_iconic.png',
    'image.webp',
    'logo_header.webp',
    'site-logo.png',
    'ieclogo.png',
    'startuplogo.png',
    'logo.png',
    'logohuit.jpg'
  ],
  socials: [
    'zalo.png',
    'facebook.png',
    'tiktok.png',
    'instagram.png',
    'instagram.avif',
    'mail.png',
    'telephone.png'
  ],
  banners: [
    'baner.jpg',
    'poster-khoi-nghiep.jpg',
    'og-default.png',
    'startup_hero_illustration.png',
    'image974c.jpg',
    'image940e.jpg',
    'image87ce.jpg',
    'image6981.jpg',
    'image5999.jpg'
  ],
  sponsors: [
    'nhataitro.png',
    'nhataitro1.png'
  ],
  ui: [
    'glowing_hourglass.png',
    'qrdangky.png',
    'separation-bottom.80467686.png',
    'eventista.7a1126d5.svg',
    'laurel-dark-big.6d9a838c.svg',
    'laurel-dark-small.e0887cc3.svg',
    'laurel-light-big.58ee16d9.svg',
    'laurel-light-small.27b47318.svg'
  ],
  guides: [
    'b2.png',
    'b3.png',
    'b4.png',
    'dangnhap.png',
    'danhnhap.png'
  ]
};

// Create folders and organize
for (const [folder, files] of Object.entries(structure)) {
  const targetDir = path.join(imagesDir, folder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  for (const file of files) {
    const srcFile = path.join(imagesDir, file);
    const destFile = path.join(targetDir, file);

    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, destFile);
    }
  }
}

// Copy sponsors folder if exists
const sponsorSrcDir = path.join(imagesDir, 'logo nha tai tro');
const sponsorDestDir = path.join(imagesDir, 'sponsors');
if (fs.existsSync(sponsorSrcDir)) {
  const list = fs.readdirSync(sponsorSrcDir);
  for (const f of list) {
    fs.copyFileSync(path.join(sponsorSrcDir, f), path.join(sponsorDestDir, f));
  }
}

console.log('Image restructuring completed successfully!');
console.log('Categories created in public/images/:', Object.keys(structure));
