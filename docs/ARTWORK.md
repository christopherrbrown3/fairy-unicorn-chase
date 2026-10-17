# Home Screen and share artwork

Made with OpenAI's built-in image generation tool for Fairy Unicorn Chase. These are promotional illustrations, not gameplay screenshots. Final assets are saved in the project; generated originals remain in the tool's image folder. macOS `sips` resizes and converts the outputs without changing their content.

| Asset | Saved file | Dimensions |
| --- | --- | --- |
| Standard app icon | `public/icons/icon-512.png` | 512 × 512 PNG |
| Small app icon | `public/icons/icon-192.png` | 192 × 192 PNG |
| Android safe-area icon | `public/icons/icon-maskable-512.png` | 512 × 512 PNG |
| Apple Home Screen icon | `public/apple-touch-icon.png` | 180 × 180 PNG |
| Browser icon | `public/favicon-32.png` | 32 × 32 PNG |
| Text/social link preview | `public/share/fairy-unicorn-chase.jpg` | 1200 × 630 JPEG |

The maskable variant preserves extra sky around the unicorn head so Android's icon shapes can crop the background. There are no baked-in rounded corners. Both icons are opaque.

## App icon prompt

Use case: stylized-concept. Create one finished square mobile Home Screen app icon for the children's game Fairy Unicorn Chase, 1024x1024. Full bleed opaque sky blue background, no rounded square frame because the OS supplies its own mask. A single adorable friendly WHITE UNICORN head and upper neck, three-quarter view facing left, with a short golden spiral horn, big deep blue eyes, peach muzzle, and chunky flowing pastel pink, lavender, and turquoise mane. A little golden five-point star tucked near the mane. Art direction: beautifully crafted soft 3D storybook toy figurine, rounded sculpted shapes, matte clay, gentle lighting, joyful, pastel, polished and highly legible at 48px. Strong large silhouette centered in the middle 70 percent; keep horn, face, ears entirely inside the central circle with diameter 78 percent of image. Background sky blue #bce5f1 with just a soft cream cloud at the very bottom and two small warm gold sparkles, no busy scenery. The unicorn fills the icon but has clear safe padding. No text, no letters, no UI, no watermark, no border.

## Maskable variant edit prompt

Input: the generated standard app icon.

Edit this exact unicorn app icon into an Android maskable version. Preserve the same unicorn face, mane, white coat, gold horn, gold star, 3D storybook style and sky color. Zoom OUT enough that the ENTIRE unicorn head including the horn tip and ears fits safely inside an imaginary centered circle with diameter 76% of the square canvas. Add generous continuous sky blue around the edges by expanding the sky background; no visible inner square or frame. The unicorn should be about 68% of canvas height with quiet soft cream cloud below. Make the surrounding sky a continuous soft light blue matching the original. Full-bleed square opaque image. No rounded corners, no border, no text. This is the separate maskable safe-area icon so the important silhouette must survive a circular crop.

## Share image prompt

Use case: ads-marketing. Create one finished wide landscape illustrated link preview image for the children's browser game 'Fairy Unicorn Chase', composition approximately 1.9:1 (intended final 1200x630). A polished soft dimensional 3D storybook toy world, matte clay, warm cream and sky blue and green pastel meadow, flower-lined path, billowy clouds and a rainbow overhead. On the RIGHT HALF, a cheerful little fairy called Mia with blonde hair, blue dress, pale blue/lilac butterfly wings riding a friendly small APRICOT PONY called Glender with a bright golden-yellow mane and tail and visible gold star markings on her body (Glender is a pony, no horn). Beside them a friendly white unicorn with a golden horn and pink mane glances back as they play chase. Rounded large expressive faces, gentle and playful, no racing urgency. On the LEFT HALF put the beautifully readable three-line game title in large bold rounded friendly display letters: first line 'Fairy' in deep navy blue, second line 'Unicorn' in muted rose pink, third line 'Chase' in deep navy blue. Beneath it one smaller line in navy: 'Mia & Glender’s magical adventure'. Leave warm very pale cream/sky empty background behind the lettering for high contrast. Text exact, no extra lettering, no UI controls, no badge, no browser mockup, no border, no watermark. Main title and the characters must stay 7 percent inside outer image edges to survive preview crops. This is original promotional illustration, not a gameplay screenshot. High quality with large uncluttered forms, clearly legible when shared in a text message.
