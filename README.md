SkulPadi
=========

Your lectures. Your learning. Your Padi.

SkulPadi is an AI-powered study companion designed to help university students turn lecture materials into useful study resources. Students can upload course materials, generate notes, ask questions about lecture content, and create quizzes and flashcards to support active recall and exam preparation.

Live Application:
https://skul-padi.vercel.app/

FEATURES
--------

- Lecture Material Processing: Upload supported lecture documents and extract their content for studying.
- AI-Generated Notes: Generate structured notes with detailed or concise output options.
- AI Study Chat: Ask questions about lecture content and receive AI-generated explanations.
- Quizzes and Flashcards: Create revision resources from lecture materials.
- Persistent Study Resources: Save and revisit study materials.
- Study Streaks: Track daily study activity and longest streaks.
- Leaderboard: Compare study streaks with participating users.
- Shareable Flashcard Decks: Share decks through links.
- Personalized Settings: Manage study preferences and leaderboard participation.
- Authentication: Access a personal study workspace.

TECHNOLOGY STACK
----------------

Next.js - Full-stack application framework
React - User interface
TypeScript - Type safety
Tailwind CSS - Styling
Google Gemini API - AI-powered study assistance
Supabase - Authentication, database, and document storage
Upstash Redis - API rate limiting
Vercel - Deployment

SUPPORTED FILE FORMATS
----------------------

PDF
PowerPoint (.pptx)
Word documents (.docx)
Excel workbooks (.xlsx)
CSV files

HOW IT WORKS
------------

1. Sign in to your SkulPadi account.
2. Upload a lecture document.
3. Extract and process the document content.
4. Generate notes, quizzes, and flashcards.
5. Ask questions about your lecture materials.
6. Save your study resources and track your learning consistency.

ARCHITECTURE
------------

SkulPadi uses a full-stack Next.js architecture.

Frontend: React and Tailwind CSS.
Server-side logic: Next.js API routes.
AI integration: Google Gemini API.
Authentication and database: Supabase.
Document storage: Private Supabase Storage.
Rate limiting: Upstash Redis.
Deployment: Vercel.

SECURITY
--------

The application includes authenticated access to personal study resources, Supabase Row Level Security policies, private document storage, server-side handling of sensitive credentials, and rate limiting for AI requests and document extraction.

Secure operation also depends on correct configuration of the application, database policies, storage permissions, and deployment environment.

LOCAL DEVELOPMENT
-----------------

Prerequisites:

- Node.js and npm
- A Supabase project
- A Google Gemini API key
- An Upstash Redis database

Clone the repository:

git clone https://github.com/bukunmibalogun5-eng/SkulPadi.git

cd SkulPadi

Install dependencies:

npm install

Create a .env.local file in the project root and configure these environment variables:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

Use your own credentials for each service. Never commit .env.local or expose secret keys in client-side code or a public repository.

Start the development server:

npm run dev

Open http://localhost:3000 in your browser.

Run the project checks:

npm run lint
npm run build

DEPLOYMENT
----------

SkulPadi is deployed on Vercel.

To deploy your own instance, clone the repository, configure Supabase, Gemini, and Upstash, add the required environment variables to Vercel, deploy the application, and configure the Supabase authentication URLs for your deployment domain.

PROJECT GOAL
------------

SkulPadi aims to make studying more organized, interactive, and accessible by bringing lecture materials, AI-assisted explanations, and active-recall tools into one workspace.

The goal is to help students engage with their course content and build consistent study habits.

FUTURE IMPROVEMENTS
-------------------

Potential improvements include better source references in AI answers, expanded learning analytics, improved handling of complex lecture documents, more personalized revision workflows, and continued usability improvements.

CONTRIBUTING
------------

Contributions, suggestions, and feedback are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make and test your changes.
4. Submit a pull request describing your improvement.

LICENSE
-------

No license has been specified yet. Until a license is added to the repository, permission to reuse, modify, or redistribute the code should not be assumed.

SkulPadi - Your lectures. Your learning. Your Padi.
