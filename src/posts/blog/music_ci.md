---
title: "Hammering Music production with DevOps"
category: "Music"
date: "2023-10-19 20:25"
desc: "When everything starts looking like a nail looking for a DevOps hammer, you've got a problem."
thumbnail: "./images/default.jpg"
#alt: "code block graphic"
---

## Background

You've worked on CI for the past few years. Some YAML here and there, you've spent more time than you'd optimally like fighting pipelines.
You're eager to use your newly acquired skills for something flashy.

Music production on Digital Audio Workstations (DAWs) is a tedious, iterative process, where you often need to listen to your creations as you work on your tracks. Like in all creative professions, you do some drafts and keep polishing your work until sufficient quality is achieved.

There's many listening environments, and to listen to a fresh draft of your next hit, you need to:

- **Open the project in your DAW**
- **Render it to a file**
- **Copy it to some storage medium**

Now the gears start turning in your head, you've got a great new vision.

## The Nail

Fortunately, Reaper stores its project files in plain text:

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

Reaper also has extensive APIs, but realistically we only need some command line options to render the project.

This of course becomes increasingly useful when you're working on 

Something about distributed nature of vsts

Licensing, another major problem

## The Hammer

All CI services provide some ready-made runners, but in this case you need to roll your own. There are several options, but the most ***DevOps*** way is to run it in containers, right?

Luckily again, Reaper is both
- Portable ([12MB for a program this size is rare to see](https://www.reaper.fm/download.php))
- Runs headless (the custom GUI framework has a headless mode)
- Some nice command line options

Just one problem, you're likely going to need more than just your daw.

## The road to dependency hell is paved with good intentions

## Just do it locally
*How often do you need new revisions anyway?*


Static site generator



Show VLC playlist generator JS
