# My Singing World

A colorful, responsive home for your singing videos. It publishes directly from a GitHub repository with GitHub Pages.

## Add a song

1. Put your singing video in the `videos/` folder. MP4 (H.264 video and AAC audio) has the broadest browser support. Keep files reasonably small for GitHub Pages.
2. Give the file a clear name such as `A Thousand Years.mp4`. The gallery discovers supported video files in `videos/` and uses the filename as the song title. A matching image such as `A Thousand Years.jpg` will be used as its poster when present.

No song entry needs to be added to `videos.json` for the published GitHub Pages site.



Use a matching image filename for the poster, such as `A Thousand Years.jpg`. Rename video files to change the displayed song title.

On GitHub Pages, the gallery reads the public repository `videos/` folder through the GitHub contents API. The repository must be public for automatic discovery. For local HTTP previews, `videos.json` is still used; opening `index.html` directly uses the small `local-songbook` fallback embedded in the page.

## Publish with GitHub Pages

1. Commit and push the site files to your GitHub repository.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select your branch and the `/ (root)` folder, then save.

The site uses relative paths and works when hosted from either a user site or a project subpath. No build step or server is required. To preview locally, serve the folder over HTTP (for example, `python -m http.server`) because browsers block `fetch()` from `file://` pages.

## Video size note

GitHub Pages is intended for static websites, not large media hosting. For a small collection, repository videos work well. For longer recordings or a growing songbook, host videos on a media/CDN service and use their direct MP4 URLs in `src`.
