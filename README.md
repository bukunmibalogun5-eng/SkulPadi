# SkulPadi

**Your lectures. Your learning. Your Padi.**

SkulPadi is an AI-powered study companion designed to help university students transform lecture materials into useful study resources. Students can upload course materials, generate structured notes, ask questions about lecture content, and create quizzes and flashcards to support active recall and exam preparation.

**Live Application:** [https://skul-padi.vercel.app/](https://skul-padi.vercel.app/)

## Features

- **Lecture Material Processing:** Upload supported lecture documents and extract their content for studying.
- **AI-Generated Notes:** Transform lecture materials into structured notes, with options for detailed or concise summaries.
- **Lecture-Based AI Chat:** Ask questions about learning materials and receive AI-generated explanations grounded in the available lecture context.
- **Quizzes and Flashcards:** Generate revision resources from lecture content, with configurable quiz lengths.
- **Persistent Study Resources:** Save and revisit study materials associated with your account.
- **Study Streaks:** Track learning activity, maintain daily consistency, and monitor your longest streak.
- **Leaderboard:** Compare study streaks with other participating users.
- **Shareable Flashcard Decks:** Generate shareable links so others can access shared decks.
- **Personalized Settings:** Customize supported study preferences, manage your display name, and control leaderboard participation.
- **Authentication:** Sign in to access your personal study workspace.

## Technology Stack

| Technology | Purpose |
|---|---|
| Next.js App Router | Full-stack application framework |
| React | User interface |
| TypeScript | Type safety |
| Tailwind CSS | Styling and responsive interface |
| Google Gemini API | AI-powered study assistance and content generation |
| Supabase | Authentication, database, and document storage |
| Upstash Redis | API rate limiting |
| Vercel | Application deployment |

## Supported Study Materials

SkulPadi includes document-processing support for common academic file formats:

- PDF
- PowerPoint (`.pptx`)
- Word documents (`.docx`)
- Excel workbooks (`.xlsx`)
- CSV files

The amount and structure of extracted content may vary depending on the document format and its contents.

## How It Works

1. **Sign in** to your SkulPadi account.
2. **Upload** a lecture document containing the material you want to study.
3. **Extract and process** the document's content.
4. **Generate study resources**, including notes, quizzes, and flashcards.
5. **Ask questions** about lecture material using the AI study assistant.
6. **Save and revisit** your resources while tracking your study consistency.

## Architecture Overview

SkulPadi uses a full-stack Next.js architecture.

- **Frontend:** React components and Tailwind CSS provide the student-facing interface.
- **Server-side logic:** Next.js API routes handle AI requests and document extraction.
- **AI integration:** The Gemini API powers study assistance and content generation.
- **Authentication and database:** Supabase manages user authentication and persistent application data.
- **Document storage:** A private Supabase Storage bucket stores uploaded documents.
- **Rate limiting:** Upstash Redis helps limit AI requests and document uploads.
- **Deployment:** Vercel hosts the production application.

## Security

The application incorporates several measures to help protect user data and control resource usage:

- Authenticated access to personal study resources.
- Supabase Row Level Security (RLS) policies for protected database tables.
- Private document storage with user-scoped access.
- Server-side handling of sensitive API credentials.
- Rate limits on AI requests and document extraction.
- Controlled access to data exposed through shared flashcard links.

Security also depends on correct configuration of the application, database policies, storage permissions, and deployment environment.

## Local Development

### Prerequisites

- Node.js and npm
- A Supabase project
- A Google Gemini API key
- An Upstash Redis database

### 1. Clone the repository

```bash
git clone https://github.com/bukunmibalogun5-eng/SkulPadi.git
cd SkulPadi
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root and add the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Populate these variables with credentials from your own Supabase, Google AI, and Upstash projects.

**Important:** Never commit `.env.local` or expose service-role keys, API keys, or Redis tokens in client-side code or a public repository.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run checks

```bash
npm run lint
npm run build
```

## Deployment

SkulPadi is deployed on Vercel and connected to its GitHub repository.

To deploy your own instance:

1. Fork or clone the repository.
2. Configure your Supabase, Gemini, and Upstash services.
3. Add the required environment variables to your Vercel project.
4. Deploy the application.
5. Configure Supabase authentication URLs to match your deployment domain.

## Project Goal

SkulPadi aims to make studying more organized, interactive, and accessible by bringing lecture materials, AI-assisted explanations, and active-recall tools into one workspace.

Rather than simply generating summaries, the goal is to help students engage with their course content and build more consistent study habits.

## Future Improvements

Potential areas for further development include:

- Improved document-grounded answers and source references.
- More advanced learning analytics and progress insights.
- Better handling of complex lecture documents and diagrams.
- Expanded revision workflows based on student performance.
- Further usability and accessibility improvements.

## Contributing

Contributions, suggestions, and feedback are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make and test your changes.
4. Submit a pull request describing the improvement.

## License

No license has been specified yet. Until a license is added to the repository, permission to reuse, modify, or redistribute the code should not be assumed.

---

**SkulPadi — Your lectures. Your learning. Your Padi.**
