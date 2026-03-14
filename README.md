# にほんご よもう！ — Kids Japanese Reading Website

A fun, interactive Japanese reading learning website for children. Learn hiragana, katakana, read Japanese books with word-click dictionary, and practice pronunciation.

## Features

- 📚 **PDF Book Upload** — Admin uploads a Japanese PDF; text is automatically extracted and stored page by page
- 📖 **Interactive Reading** — Split-screen reading with clickable words that show dictionary definitions
- 🔊 **Pronunciation** — Click any word to hear it spoken (Web Speech API + Cloudinary audio)
- あ **Alphabet Learning** — Interactive hiragana & katakana grids with click-to-hear pronunciation
- 📝 **Dictionary** — Searchable dictionary with Japanese, romaji, English, and Mongolian meanings
- ⚙️ **Admin Panel** — Upload books, manage dictionary words

## Tech Stack

- **Next.js 14** (App Router) + **TypeScript**
- **TailwindCSS** — Kids-friendly soft colors, large fonts
- **MongoDB** (Mongoose) — Flexible document storage
- **Cloudinary** — PDF, image, and audio file storage
- **NextAuth.js** — Admin authentication
- **Web Speech API** — Browser-native Japanese pronunciation

## Setup

### 1. Clone & Install

```bash
git clone <your-repo>
cd reading_kids
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `NEXTAUTH_SECRET` | Random secret (min 32 chars) — use `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your site URL (`http://localhost:3000` for dev) |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Same as cloud name (for client-side use) |

### 3. Set Up MongoDB Atlas

1. Create a free cluster at [mongodb.com](https://www.mongodb.com)
2. Create a database user
3. Whitelist all IPs (`0.0.0.0/0`) for Vercel compatibility
4. Copy the connection string to `MONGODB_URI`

### 4. Set Up Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Copy Cloud Name, API Key, API Secret from the dashboard
3. Fill in the `CLOUDINARY_*` env vars

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Then add all environment variables in **Vercel Dashboard → Settings → Environment Variables**.

## Usage

### Admin Panel (`/admin`)
1. Log in with your admin credentials at `/admin/login`
2. Upload a Japanese PDF book via **Upload Book**
3. Add dictionary words with Japanese, romaji, English, and Mongolian meanings
4. Paste Cloudinary URLs for example images and audio files

### Student Experience
1. Browse books at `/books`
2. Click **Start Reading** to open the reading interface
3. Click any Japanese word to see its meaning in the dictionary panel
4. Press 🔊 to hear pronunciation
5. Learn hiragana/katakana at `/alphabet`
6. Search words at `/dictionary`

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home page
│   ├── books/                # Book library + reading pages
│   ├── alphabet/             # Hiragana/Katakana learning
│   ├── dictionary/           # Dictionary browser
│   ├── admin/                # Admin panel (protected by NextAuth)
│   └── api/                  # API routes
├── components/
│   ├── ui/                   # Button, Card, Badge, LoadingSpinner
│   ├── reading/              # ReadingLayout, DictionaryPanel, WordToken
│   ├── books/                # BookCard, BookGrid, LevelBadge
│   ├── dictionary/           # WordCard, AudioButton
│   ├── alphabet/             # AlphabetGrid, CharacterCard
│   └── admin/                # PdfUploadForm, WordForm
├── lib/
│   ├── db/                   # MongoDB connection & models (Book, Page, DictionaryWord)
│   ├── cloudinary/           # Upload helpers
│   └── pdf/                  # PDF text extraction & tokenizer
├── hooks/                    # useSpeech (Web Speech API)
├── store/                    # Zustand reading state
├── constants/                # Full hiragana, katakana charts; level config
└── types/                    # TypeScript interfaces
```
