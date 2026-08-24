# Image Assets Directory Structure

The **HUIT's ICONIC 2026** project organizes image assets in `public/images/` into clear, specialized groups for easier management:

```text
public/
├── images/
│   ├── logos/          # University and competition identity logos
│   │   ├── huit_logo.png       # Ho Chi Minh City University of Industry and Trade logo
│   │   ├── logo_iconic.png     # Official HUIT's ICONIC 2026 competition logo
│   │   ├── image.webp          # Standard header display logo
│   │   ├── site-logo.png       # Square logo used for Admin / OG Meta / App
│   │   └── ieclogo.png         # Admissions and Communications Center logo
│   │
│   ├── socials/        # Social media icons and quick-contact icons
│   │   ├── zalo.png            # Zalo chat icon
│   │   ├── facebook.png        # Facebook fanpage icon
│   │   ├── tiktok.png          # TikTok icon
│   │   ├── instagram.png       # Instagram icon
│   │   ├── telephone.png       # Hotline icon
│   │   └── mail.png            # Email icon
│   │
│   ├── banners/        # Homepage banners, event posters, and OG image
│   │   ├── baner.jpg               # Main competition banner
│   │   ├── poster-khoi-nghiep.jpg  # Program introduction poster
│   │   └── og-default.png          # Social sharing preview image
│   │
│   ├── sponsors/       # Logos of sponsors and partner organizations
│   │   ├── logo-amangon.webp
│   │   ├── logo-mb-scaled.webp
│   │   └── ...
│   │
│   ├── ui/             # UI graphics, badges, laurel assets, and supporting icons
│   │   ├── glowing_hourglass.png   # Countdown graphic
│   │   ├── qrdangky.png            # Registration QR code
│   │   ├── laurel-dark-big.svg     # Honor laurel (dark)
│   │   └── laurel-light-big.svg
│   │
│   └── guides/         # Step-by-step voting guide illustrations
│       ├── dangnhap.png
│       ├── b2.png
│       └── b3.png
│
├── uploads/            # Storage for dynamic uploads from the Admin Portal
└── favicon.png         # Browser tab favicon
```

---

> 💡 **Note**: To maintain 100% backward compatibility with legacy paths and previously stored database records, files in the root `public/images/` directory are still preserved alongside the newer categorized folders.
