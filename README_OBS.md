# PubCast Clone - OBS Setup Guide

This guide explains how to integrate your PubCast Clone web application with OBS Studio for live streaming or display on venue screens.

## Prerequisites

1.  **OBS Studio**: Installed on your computer ([Download OBS](https://obsproject.com/)).
2.  **Deployed App**: Your application must be running.
    *   **Local**: `http://localhost:3000`
    *   **Vercel (Recommended)**: `https://your-project-name.vercel.app` (After you deploy).

## Step 1: Deploy to Vercel (If not already done)

Since you plan to host on Vercel:

1.  Push your code to a Git repository (GitHub, GitLab, or Bitbucket).
2.  Go to [Vercel.com](https://vercel.com) and import your project.
3.  Deploy it.
4.  Copy your production URL (e.g., `https://pubcast-clone.vercel.app`).

## Step 2: Add Browser Source in OBS

1.  Open **OBS Studio**.
2.  In the **Sources** dock (usually at the bottom), click the **`+`** icon.
3.  Select **Browser**.
4.  Name the source (e.g., "PubCast Screen") and click **OK**.

## Step 3: Configure the Browser Source

In the properties window that appears:

1.  **URL**: Enter your Vercel URL followed by `/screen`.
    *   Example: `https://your-project-name.vercel.app/screen`
2.  **Width**: `1920` (or match your stream/screen resolution).
3.  **Height**: `1080` (or match your stream/screen resolution).
4.  **Custom CSS**: You can leave this empty or clear it (the app handles its own styling).
5.  **Shutdown source when not visible**: Uncheck this if you want it to keep updating in the background, or check it to save resources when hidden.
6.  **Refresh browser when scene becomes active**: Check this if you want the queue to reset every time you switch to this scene.
7.  Click **OK**.

## Step 4: Using the System

1.  **The Screen**: The OBS source will now display the `/screen` page. It will cycle through waiting messages or display incoming ones.
2.  **Sending Messages**:
    *   Open the app on your phone or another browser window (`https://your-project-name.vercel.app`).
    *   Click the **Post** button (Plus icon) in the bottom navigation.
    *   Type a message and hit Send.
    *   **Note:** Since we are using `BroadcastChannel` for the demo, **Localhost Only**: The sender and the screen must be open in the *same browser instance* for messages to appear instantly.
    *   **For Production (Vercel)**: The current demo uses `BroadcastChannel` which *only works within the same browser*. To make this work across different devices (e.g., Phone -> OBS on PC), you will need to implement a real backend (WebSocket/Pusher/Firebase) to sync the data.

    *   **For now (Demo Mode)**: Open the `/post` page in a browser dock inside OBS or on the same computer's browser to see it appear on the OBS layer.

## Troubleshooting

*   **Black Screen?**: Right-click the source in OBS -> **Interact**. This opens a window where you can interact with the page. Sometimes clicking inside wakes it up.
*   **Wrong Size?**: Right-click the source -> **Transform** -> **Fit to screen**.

