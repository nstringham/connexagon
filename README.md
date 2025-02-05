# Connexagon

Play connexagon now at https://connexagon.vercel.app

## Setting up a Local Development Environment

1.  Prerequisites

    1. [Node](https://nodejs.org/)
    1. [Docker Desktop](https://www.docker.com/products/docker-desktop/)
    1. [VS Code](https://code.visualstudio.com/) (optional)

1.  Clone this repository

1.  Set git to rebase by default when pulling

    ```bash
    git config pull.rebase true
    ```

1.  Install npm dependencies

    ```bash
    npm ci
    ```

1.  Install workspace recommended VS Code extensions (optional)

1.  Start Supabase local database

    ```bash
    npx supabase start
    ```

1.  create a `.env.local` file and fill in the information from the previous step

    ```
    PUBLIC_SUPABASE_URL=<your API URL>
    PUBLIC_SUPABASE_ANON_KEY=<your anon key>
    POSTGRES_URL=<your DB URL>
    ```

1.  Start SvelteKit in development mode

    ```bash
    npm run dev
    ```

1.  Don't forget to shut down Supabase local development when you are done.

    ```bash
    npx supabase stop
    ```
