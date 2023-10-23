---
title: "Hammering Music production with DevOps"
category: "Music"
date: "2023-10-19 20:25"
desc: "When everything looks like a nail searching for a DevOps hammer"
thumbnail: "./images/default.jpg"
#alt: "code block graphic"
---

## Background

Music production on Digital Audio Workstations (DAWs) is a tedious, iterative process, where you occasionally want to preview your latest creations. Like in all creative professions, you do some drafts and keep polishing your work until sufficient quality is achieved.

There's many listening environments, and to listen to a fresh draft of your next hit, you need to:

- **Open the project in your DAW**
- **Render it to a file**
- **Copy it to some storage medium**

The problem here is the amount of time it takes for the project to render. With larger projects, ~5 minutes per project is really common.

If you want to render multiple projects at once, you're talking of ~30mins being wasted not actually producing anything.

Also, after this you need to transfer the file to your phone or usb drive. Combine this with the half hour wait, and 

But what about if you don't want to listen to the track on your phone? Maybe some other device? Or someone else?

Now you also need to send the rendered files manually

What if you make multiple revisions?

In the end, you'll likely just forget about doing this after a couple times. The end.

## The Nail

So why not build automatic pipelines for your music projects? How do you get started?

You've worked on CI for the past few years. Some YAML here and there, you've spent more time than you'd optimally like fighting pipelines at work.

A lot of details depend on your DAW of choice, but on Reaper the start is easy: its project files are in plain text format:

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

This has the sided effect of compressing really well, in addition to suiting a git-oriented workflow. I'm not the only one (TODO: reaper users doing git here)

So now you have a repository full of project files, the next step is to set up some pipelines.

This of course becomes increasingly useful when you're working on 

## The Hammer

All CI services provide some ready-made runners, but in this case you need to roll your own. There are several options, but the most ***DevOps*** way is to run it in containers, right?

Luckily again, Reaper is both
- Portable ([12MB for a program this importance is rare to see](https://www.reaper.fm/download.php))
- Runs headless
- Provides command line options for rendering (`-renderproject`)

Just one problem, you're likely going to need more than just your daw.

## The road to dependency hell is paved with good intentions

Somehow, somewhere music production evolved to use common standards instead of relying on out-of-the-box functionality.

Think of a common standard of using image processing filters accross Gimp, Photoshop and others.

Nowadays, musicians workflows rely as much on 3rd-party plugins as stock plugins.


This is where the problem appears for our builds. In addition to the base program (DAW) you're using, you'd also need to bundle all plugins with the main program.

Sure, you can copy all the 

### A dedicated VPS for buidls?

Just as you'd use a container, you could just rent a server somewhere, install your DAW, plugins, and a CI agent there?

There's just one problem. How do you  this?

The main benefit of doing offline builds is that you don't need the processing power, you can deal just fine with a slower server.

It's really difficult to cope with all the possible licensing features of the different plugins.

## Just do it locally

If you need to keep your plugin collection up-to-date, the best way to

Okay, so how to accomplish this on your local machine then? The rendering process still takes.

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

## The scripts

Let's start off with rendering the projects.

With the following file structure:

```
Projects
|--subfolder
   |--project1
   |--project2
   |--project3
   |--project4

```
The rendering script (`render_script.sh`) would look like this:

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

cd ./<RENDER_TARGET_DIRECTORY>

# Package the rendered files into MP3s
for file in ${names[*]} ; do ffmpeg -i "$file".wav -vn -ar 44100 -ac 2 -b:a 320k "$file".mp3 -y; done

# Clean runner files first:
rm <SHARED_RUNNER_DIRECTORY>/*.mp3

#copy all to folder shared with gitlab-runner
for file in ${names[*]} ; do cp "$file".mp3 <SHARED_RUNNER_DIRECTORY>; done

```
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

Now, you can run `./render_script.sh && ./push_updates.sh` to:

- Render new drafts
- Push the new commits to your repository


*How often do you need new revisions anyway?*

There's still more content to be explored here (how do you set up that static site anyway), but that's a story for another time.
