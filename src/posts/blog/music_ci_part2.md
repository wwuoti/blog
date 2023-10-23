---
title: "Hammering Music production with DevOps, part 2"
category: "Music"
date: "2023-11-19 20:25"
desc: "Lightweight hosting of your song drafts"
thumbnail: "./images/default.jpg"
alt: "code block graphic"
---
<!-- markdownlint-disable line-length -->
# The site

With the pipelines ready, you've now got content to host. So what now?

You have:

- Content which changes periodically
- A website where you consume such content
- The website should be integrated to git and pipelines

## When your host gives you troubles

Turns out that Gitlab's static site content host drops files when they are more than a few MB.

## VLC playlist generator JS

But there's still hope. Just to verify that this is not a bug of the browser,let's try using something else to listen to the tracks. Opening the links in VLC gives a pleasant surprise: the tracks play mostly.

TODO: why does VLC play them so well compared to Firefox? Maybe wireshark logs would show something

Also, it would be really nice to just listen to a collection of your latest drafts. It would also remind you to finish all those songs you once started but never got around finishing.

### Playlist generation

Problem is, even though your songs have the same filename, the location they are stored within Gitlab always changes. This means that the next time you try to open your great playlist and expect all the latest drafts, you get this:

TODO: VLC broke screenshot

But hold on for a moment. Why not just programmatically create the playlist, and put a button on the site to download it?

One common format for playlists is `m3u` format, which is relatively simple.
The file starts with `#EXTM3U`

To create the download button, we use this (rather ugly) Javascript snippet:

```javascript
const DownloadFile = (data) => {
    var filename = "download.m3u";
    var values = ["#EXTM3U"];
    var mainUrl = window.location.origin; 
    data.allFile.edges.forEach((edge, index, array) => {
        values.push("#EXTINF:0," + edge.node.name);
        values.push( mainUrl + edge.node.publicURL);
    });
    var blob = new Blob([values.join("\n")], {type: 'text/plain'});
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob, filename);
    } else{
        var e = document.createEvent('MouseEvents'),
        a = document.createElement('a');
        a.download = filename;
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':');
        e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a.dispatchEvent(e);
    }
}
```

Next, we just map this to a button:

```javascript
<p>Playlist in m3u format (for VLC etc.)
<br></br>
<input type="button" onClick={ function () {DownloadFile(data)} } value="Download">
```

Here we have a simple `Download playlist in VLC format` button. Once clicked, you are greeted with a `download.m3u`

Here's an example of what the file looks like:

```m3u
#EXTM3U
#EXTINF:0,Outrun_113
https://wwuoti.gitlab.io/reaper/static/46dc2076a89cab4d9fe555b5abdf3975/Outrun_113.mp3
#EXTINF:0,edm_16
https://wwuoti.gitlab.io/reaper/static/e8c5f77fadaf2a8181180bde8278796b/edm_16.mp3
#EXTINF:0,edm_10
https://wwuoti.gitlab.io/reaper/static/fe429635f60e5954cf3e8789e32a4c8d/edm_10.mp3
#EXTINF:0,Outrun_110
https://wwuoti.gitlab.io/reaper/static/7966b324e9654d5f03a8930b847e0a80/Outrun_110.mp3
```
