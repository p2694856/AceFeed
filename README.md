# AceFeed

AceFeed is a fully automated content curation platform that uses Large Language Models (LLMs) and an image database to generate posts on its website and Instagram curated for the user.

## Features

*   **AI-Powered Curation:** Automatically generates unique posts utilizing LLMs and a curated image database.
*   **Multi-Platform Publishing:** Seamlessly publishes content directly to the internal AceFeed website and the user's Instagram account.
*   **Personalized Feeds:** Users can select specific topics to customize the content generated for their personal feed.
*   **Automated Workflows:** Operates completely hands-off using GitHub Actions (`generate-posts.yml`) to schedule and trigger post generation and publishing
*   **Secure Authentication:** Complete user registration and login flows powered by NextAuth.
*   **Advanced Admin Controls:** Includes a comprehensive admin dashboard for managing users and configuring proxy assignments to handle API limits securely.

## Tech Stack

AceFeed is built with a modern, full-stack architecture:
*   **Framework:** Next.js (utilizing the App Router).
*   **Language:** TypeScript.
*   **Database ORM:** Prisma.
*   **Authentication:** NextAuth.js.
*   **Styling:** Tailwind CSS.
*   **Automation:** GitHub Actions.

## System Architecture

The application's core functionality is organized into the following areas:

*   **`/.github/workflows/`**: Houses the `generate-posts.yml` file, which acts as the chron job powering the app's automation.
*   **`/app/api/`**: Contains the backend infrastructure, including routes for automated generation (`/api/posts/generate`), publishing (`/api/posts/publish`), authentication (`/api/auth`), and admin proxy controls (`/api/admin/add-proxy`).
*   **`/app/admin/`**: The administrative hub for managing the client user list and proxy assignments.
*   **`/app/posts/`**: The user-facing feed and individual post viewing pages.
*   **`/app/settings/topics/`**: The interface where users configure their content preferences using the topic selector.
*   **`/prisma/`**: Contains the database schema, migration history, and database seed scripts.
