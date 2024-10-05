Some tampermonkey scripts to automatically redirect you away from newfangled faff.

# Longify YouTube
Install [here](https://raw.githubusercontent.com/Meep3692/oldify-reddit/trunk/longify.user.js)

Redirects you from a shorts page to the equivalent watch page.

# Oldify Reddit
Install [here](https://raw.githubusercontent.com/Meep3692/oldify-reddit/trunk/oldify.user.js)

Redirects you to old.reddit.com, with some additional features.

## Nice hat mitigation
Naïve redirects to old.reddit.com end up with you getting "Nice hat"ed when viewing media. When we detect a media page, we kill it and replace it with a page that just has the image embedded in it. We can't redirect you to the image because Reddit redirects you from the image back to the media page.

## \<image\> mitigation
Reddit now allows you to put images in your comments. In the old Reddit ui, these show up as links to the image with the text "\<image\>". We have back-ported the image comments to old Reddit.

## Markdown fix
Reddit's markdown is more advanced now but old Reddit still uses the old markdown (on the server no less) so we grab the original text from the json and render it with Marked.js, cleaning it up with DOMPurify to avoid xss.