# ByteBuddy - Vercel & Supabase Setup

This application is configured to be deployed on Vercel and uses Supabase for its backend (authentication and database).

## 1. Vercel Deployment

1.  Push this code to a GitHub/GitLab/Bitbucket repository.
2.  Import the project into Vercel. Vercel should automatically detect that it's a Vite project.
3.  Configure the Environment Variables as described below.
4.  Deploy!

## 2. Supabase Project Setup

1.  Go to [supabase.com](https://supabase.com) and create a new project.
2.  Navigate to the **SQL Editor** in your Supabase project dashboard.
3.  If you haven't already, copy the entire content of the `supabase.sql` file from this repository and run it in the SQL Editor. This will create the necessary tables (`profiles`, `conversations`, `messages`), enable Row Level Security (RLS), and set up a trigger to create a user profile on signup.
4.  Navigate to **Project Settings** > **API**. Find your Project URL and your `anon` public key. You will need these for the Vercel environment variables.
5.  Navigate to **Authentication** > **URL Configuration**. Set your **Site URL** to the URL of your Vercel deployment (e.g., `https://your-app-name.vercel.app`). This is crucial for password reset emails to work correctly.

## 3. Environment Variables

In your Vercel project settings, go to **Settings** > **Environment Variables** and add the following:

| Name | Value | Description |
| :--- | :--- | :--- |
| `API_KEY` | `your_gemini_api_key` | Your Google Gemini API key. This is a **secret** key. |
| `VITE_SUPABASE_URL` | `your_supabase_project_url` | The URL of your Supabase project. |
| `VITE_SUPABASE_ANON_KEY` | `your_supabase_anon_public_key` | The `anon` public key for your Supabase project. |

**Note:** For local development, you can create a `.env` file in the root of the project and add these variables there.

## 4. Security Model

-   **Supabase Keys**: The `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are designed to be public. Security is enforced by Supabase's Row Level Security (RLS) policies, which should be configured in your database. These policies ensure that users can only access their own data.
-   **Gemini API Key**: The `API_KEY` for the Google Gemini service is kept **secret** on the server. The frontend application does **not** have direct access to this key. Instead, it makes requests to a secure backend API route (`/api/genai`) hosted on Vercel. This API route is the only part of the system that uses the secret `API_KEY` to communicate with the Gemini API. This prevents your secret key from being exposed in the browser.
