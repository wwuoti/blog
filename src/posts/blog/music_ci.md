---
title: "Hammering Music production with DevOps"
category: "Music"
date: "2023-10-19 20:25"
desc: "When everything looks like a nail searching for a DevOps hammer"
thumbnail: "./images/default.jpg"
#alt: "code block graphic"
---

<!-- markdownlint-disable line-length -->

<i>When releasing new music, I've had the habit of notifying a friend of mine just after a my new single hit Spotify. This continued for a while, and my friend joked about having exclusive access to my music pipelines, which I always found funny.

*But hold on for a second. Pipelines for music? As in CI ([Continuous Integration](https://www.atlassian.com/continuous-delivery/principles/continuous-integration-vs-delivery-vs-deployment))? Could that work?*
</i>

## Background

Nowadays most of music production happens 'in-the-box', using software referred to as Digital Audio Workstations (DAWs). DAWs to music are what Photoshop or Illustrator is to image editing. Or Premiere and Final Cut for video editing.
<!-- 
However, you occasionally want to preview your latest creations somewhere else than in front of your computer.
In fact, the main goal of audio engineering is to make your track sound as good as possible in every listening environment.
For instance, *The Car Test* is (TODO: link here) a well-known benchmark of how well your music is produced.

In short, speaker quality and position is compromised. Engine and road noise leak into the cabin and mask frequencies, taking the life out of your track.

But how do you listen to your track in the car?

Speaking of bouncing or rendering, what's the process behind this?

- **Open the project in your DAW**
- **Render it to a file**
- **Copy it to some storage medium (phone, usb drive,)**

The problem here is the amount of time it takes for the project to render. With larger projects, ~5 minutes per project is really common.


--> 
If you want to render multiple projects at once, you're talking of ~30mins being wasted not actually producing anything.

Also, what about if you want to share the track with someone else? What if you make multiple revisions?

So yeah, *pipelines for music* does make sense. At least a little bit.

## The Nail

So how do you get started? Well, it depends **a lot** on your DAW of choice. For the purposes of this blog we are only focusing on [REAPER](https://www.reaper.fm/).

In the context of CI pipelines (and git), you'll either need:

- Small project files
- Lots of Git LFS storage

Luckily REAPER keeps its project files in plain text format:

```reaper
<REAPER_PROJECT 0.1 "6.66/linux-x86_64" 1662197272
  RIPPLE 0
  GROUPOVERRIDE 0 0 0
  AUTOXFADE 129
  ENVATTACH 0
  POOLEDENVATTACH 0
  MIXERUIFLAGS 11 49
  PEAKGAIN 1
  FEEDBACK 0
  PANLAW 1
  PROJOFFS 0 0 0
  MAXPROJLEN 0 600
  GRID 3199 8 1 8 1 0 0 0
  TIMEMODE 1 5 -1 30 0 0 -1
  VIDEO_CONFIG 0 0 256
  PANMODE 3
  CURSOR 68.4
  ZOOM 8.9576804251499 0 0
  VZOOMEX 3 850
  USE_REC_CFG 0
  RECMODE 1
  SMPTESYNC 0 30 100 40 1000 300 0 0 1 0 0
  LOOP 1
  LOOPGRAN 0 4
  RECORD_PATH "" ""
  <RECORD_CFG
    ZXZhdxgAAA==
  >
```

This has the sided effect of compressing really well, in addition to suiting a git-oriented workflow. I'm not (link) the only one by the way. See more [here](https://vi-control.net/community/threads/using-git-for-daw-project-files.70709/) and [here](https://forum.cockos.com/showthread.php?t=102268).

So now you have a repository full of project files, the next step is to set up some pipelines.

## The Hammer

All CI services provide some ready-made runners, but in this case you need to roll your own.

Luckily again, REAPER is both
- Portable ([12MB for a full DAW is rare to see](https://www.reaper.fm/download.php))
- Runs headless
- Provides command line options for rendering (`-renderproject`)

Just one problem, you're likely going to need more than just your DAW.

## The road to dependency hell is paved with good intentions

Somehow, somewhere music production software evolved to use common standards instead of relying on out-of-the-box functionality.
Think of a common standard of using image processing filters accross Gimp, Photoshop and others.

Most people refer to these simply as plugins. They come in various formats (VST, AU, CLAP) but they all introduce the same problem to our CI. Dependencies. And a lot of them.

This is where the problem appears for our builds. In addition to the base program (DAW) you're using, you'd also need to bundle all plugins with the main program.

Even though just a fraction of all plugins are available on Linux, I still have managed to download quite a few:

![REAPER screenshot asking user if they want to add 1765 plugin instances](/.attachments/reaper_all_fx.png "No, I don't think I wan to add all these to a single track")


### A dedicated machine for buidls?

Just as you'd use a container, you could just rent a server somewhere, install your DAW, plugins, and a CI agent there?

I went though this. You can migrate your plugins reasonably easily, most of them are user-installed in `~/.vst` and `~/.vst3`. Copy these to the server and you'll have your plugins.

Just one thing: licensing. Most VSTs require licenses of some sort. Luckily, you could copy 

TODO: gitlab agent being run as a differnet user

Most of the time Gitlab agent runs as a different user for security reasons. With this, 

All in all, what happens if some plugin just happens to go to a degraded state? How will you debug this?

Here's an MP3 file from a pipeline run where some of the plugins were not initialized yet.

TODO: mp3 embed here

You hear a very audible cracking sound caused by the plugins being in demo mode. Even though the licenses are present in 

All in all, it's not just the demo mode being active. Compare it to a render done on my own machine:

TODO: MP3 embed here

## Just do it locally

If you need to keep your plugin collection up-to-date, the best way is to render your 

Okay, so how to accomplish this on your local machine then? The rendering process still takes ~30 min and all of your CPU.

You're still facing a rather similar issue: for security reasons, you'd need to separate the build account from your personal account.
And here the chain of verification breaks again: you cannot test that all the plugins work with the new build account.

But how often you need the new revisions anyway? What if:
- crate new renders every once in a while
- run a CI job which collects new samples
- Build static site out of that

With this, you'd get:
- Reasonably up-to-date builds
- No extra plugin maintenance

The only thing you'll lose is the quick feedback, but at least you have proper-sounding builds.

### The scripts

Let's start off with rendering the projects. Consider the following file structure of REAPER projects:

```
Projects
|--subfolder
   |--project1
   |--project2
   |--project3
   |--project4
```

A rendering script (`render_script.sh`) would look like this:

```bash
#!/bin/bash

# Define files you want to render
files=(\
    "./Projects/subfolder/project1/*.RPP" \
    "./Projects/subfolder/project2/*.RPP" \
    "./Projects/subfolder/project3/*.RPP" \
    "./Projects/subfolder/project4/*.RPP" \
)

# Project names can be different from the final rendered files
names=(\
    "project1" \
    "project2" \
    "project3" \
    "project4" \
)

# Make new WAV renders
for file in ${files[*]}; do reaper -ignoreerrors -renderproject "$file"; done

cd <RENDER_TARGET_DIRECTORY>

# Package the rendered files into MP3s
for file in ${names[*]} ; do ffmpeg -i "$file".wav -vn -ar 44100 -ac 2 -b:a 320k "$file".mp3 -y; done

# Clean runner files first:
rm <SHARED_RUNNER_DIRECTORY>/*.mp3

#copy all to folder shared with gitlab-runner
for file in ${names[*]} ; do cp "$file".mp3 <SHARED_RUNNER_DIRECTORY>; done
```

(Replace `<RENDER_TARGET_DIRECTORY>` with the folder your renders are located at, and   `<SHARED_RUNNER_DIRECTORY>` with the folder you can give the runner an access)

Lastly, I need something to populate my git commits. To be realistic, I'm never going to look at any commit messages, all I'm interested in that which files were changed.

For this, you can use another script, `push_updates.sh

```bash
#!/bin/bash
changed_files=$(git status --porcelain)
git add Projects
git add Lyrics
git commit -m"$changed_files"
git push
```

Now, you can run

```shell
$ ./render_script.sh && ./push_updates.sh`
```
which renders all projects, push your latest changes and triggers the CI job.

There's still more content to be explored here (how do you set up that static site anyway), but that's a story for another time.
