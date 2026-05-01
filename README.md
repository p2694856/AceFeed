# AceFeed

AceFeed is a fully automated content curation platform that uses Large Language Models (LLMs) and an image database to generate posts on its website and Instagram curated for the user[cite: 1].

## Features

*   **AI-Powered Curation:** Automatically generates unique posts utilizing LLMs and a curated image database[cite: 1].
*   **Multi-Platform Publishing:** Seamlessly publishes content directly to the internal AceFeed website and the user's Instagram account[cite: 1].
*   **Personalized Feeds:** Users can select specific topics to customize the content generated for their personal feed[cite: 1].
*   **Automated Workflows:** Operates completely hands-off using GitHub Actions (`generate-posts.yml`) to schedule and trigger post generation and publishing[cite: 1].
*   **Secure Authentication:** Complete user registration and login flows powered by NextAuth[cite: 1].
*   **Advanced Admin Controls:** Includes a comprehensive admin dashboard for managing users and configuring proxy assignments to handle API limits securely[cite: 1].

## Tech Stack

AceFeed is built with a modern, full-stack architecture:
*   **Framework:** Next.js (utilizing the App Router)[cite: 1].
*   **Language:** TypeScript[cite: 1].
*   **Database ORM:** Prisma[cite: 1].
*   **Authentication:** NextAuth.js[cite: 1].
*   **Styling:** Tailwind CSS[cite: 1].
*   **Automation:** GitHub Actions[cite: 1].

## System Architecture

The application's core functionality is organized into the following areas:

*   **`/.github/workflows/`**: Houses the `generate-posts.yml` file, which acts as the chron job powering the app's automation[cite: 1].
*   **`/app/api/`**: Contains the backend infrastructure, including routes for automated generation (`/api/posts/generate`), publishing (`/api/posts/publish`), authentication (`/api/auth`), and admin proxy controls (`/api/admin/add-proxy`)[cite: 1].
*   **`/app/admin/`**: The administrative hub for managing the client user list and proxy assignments[cite: 1].
*   **`/app/posts/`**: The user-facing feed and individual post viewing pages[cite: 1].
*   **`/app/settings/topics/`**: The interface where users configure their content preferences using the topic selector[cite: 1].
*   **`/prisma/`**: Contains the database schema, migration history, and database seed scripts[cite: 1].
