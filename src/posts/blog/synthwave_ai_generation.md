---
title:"On generative AI for music"
category:"Music"
date:"2023-11-06 12:22"
desc:"How Audiocraft handles Synthwave"
thumbnail:"./images/synthwave_ai_generation.png"
alt:"markdown logo"
---

<!-- markdownlint-disable line-length -->

![Cover art: oscilloscope signal in synthwave style, controlled by artificial intelligence ](./images/synthwave_ai_generation.png)

Progression in generative AI has made quite some leaps during the past year. You've seen the image generation, conversing chat AIs and vastly improved speech modification AIs. But what about generative AIs for music?

Well, progress has been varying. There's [Riffusion](https://github.com/riffusion/riffusion), Stable diffusion trained on song spectrograms. was an interesting approach when it came out. Being based on generative AI for images limits it too much though: the songs have a distinctive sound reminiscent of low bitrate MP3s.

On the other hand, [MusicLM](https://google-research.github.io/seanet/musiclm/examples/) is also available, but really only in Google's research papers:  Neither the models **or** the training code are public, so open-source communities have made some impressive efforts to try and replicate the results. Like Google's code though, training [OpenMusicLM](https://github.com/zhvng/open-musiclm) would take days on any conventional system, and the complex checkpoints setup doesn't really result in any practical results.

And then there's Meta's [AudioCraft](https://github.com/facebookresearch/audiocraft), or more precisely the [MusicGen](https://github.com/facebookresearch/audiocraft/blob/main/docs/MUSICGEN.md) part of it. Just like people thought that GPT-4 showed"sparks of AGI", MusicGen shows some sparks of AI-created music becoming a serious reality.

Well, if it only was true stereo. Right now it's mono-only, and although there are [forks which contain](https://github.com/GrandaddyShmax/audiocraft_plus) "stereo" audio generation, it's more akin to applying regular DSP effects to widen a mono signal to stereo than true stereo.

**The best thing is that you can run AudioCraft locally.**

None of the models (Riffusion, MusicLM, MusicGen) really support vocals, so let's focus on creating instrumental music. All we need now is a genre to evaluate? I'll pick [Synthwave/Retrowave](https://en.wikipedia.org/wiki/Synthwave), since it has relatively static compositions.

----

## Prompting

Since I'm running this locally on my own PC, I'm only constrained by GPU memory, patience and my electricity bill. As long as I have a long enough list of prompts, I can leave my PC running and return to multiple albums (although with very short songs) worth of music.

But first, we need some prompts. And a lot of them. So let's generate them with ChatGpt:

>I have a music-creating AI which creates songs based on prompts. I want to hear 80s inspired retrowave, but need a series of prompts to create the music from. Create me 100 prompts in .csv form for 80s retrowave music.

Funnily enough, GPT-3.5 only gave me 70 prompts. But at least we can paste them to a CSV file:

```csv
Prompt
1, "Create an 80s retrowave track with an upbeat tempo and a catchy synth melody."
2, "Imagine an 80s neon-lit cityscape at night and translate it into a full retrowave track."
3, "Design a complete retro-futuristic 80s retrowave track with nostalgic vibes."
4, "Compose a full retrowave track with a driving rhythm, pulsating bass, and punchy drums."
5, "Incorporate classic analog synth sounds reminiscent of the 80s into a complete track."
6, "Give the full track a dreamy, cinematic quality with ethereal pads and arpeggios."
7, "Channel the spirit of iconic retrowave artists like Kavinsky and Mitch Murder in a complete track."
8, "Create a complete track that captures a futuristic atmosphere with cosmic sound effects."
9, "Inspired by VHS aesthetics, make a complete lo-fi retrowave track with a vintage vibe."
10, "Design a dynamic chord progression for an entire retrowave track that captures the essence of the 80s."
11, "Experiment with vocoder vocals for the entire track, giving it a robotic, retro touch."
12, "Imagine a high-speed chase scene and compose the complete soundtrack for it in retrowave style."
13, "Infuse the complete track with a sense of nostalgia for the 80s era."
14, "Conjure a complete sense of optimism and adventure in the entire retrowave track."
15, "Incorporate elements of cyberpunk aesthetics into the full retrowave sound."
16, "Emulate the iconic FM synthesis of the 80s in melodies throughout the track."
17, "Create a complete blend of electronic and acoustic instruments for a unique retrowave twist."
18, "Take inspiration from retro video game music and create a complete track with a nostalgic twist."
19, "Design a breakdown in the middle of the track that transports the listener to a virtual reality."
20, "Make the listener feel like they're cruising in a DeLorean through time with a full retrowave track."
21, "Utilize vintage drum machines throughout the entire track for an authentic retro beat."
22, "Think of a retro-futuristic love story and compose its complete retrowave soundtrack."
23, "Introduce a saxophone solo in the full track for that smooth, jazzy retrowave touch."
24, "Blend elements of Italo disco with retrowave for a danceable and complete track."
25, "Emulate the warm, analog tape sound of the 80s throughout the entire track."
26, "Create a complete intro that sets the stage for a cosmic retrowave adventure."
27, "Capture the essence of Blade Runner in a full retrowave track."
...
```

Full CSV here (TODO: link to csv)

To be honest, a lot of these prompts aren't that good, but luckily it doesn't matter that much: In my experience song quality is not really correlated to prompt quality. You might get some hot garbage with a reasonable prompt. The worse part is that you can get two completely different results with the same prompt.

Next, we need to parse them:

```python
descriptions = []
csv_file = args.csv_file
duration = args.duration

with open(csv_file, 'r', newline='') as file:
    csv_reader = csv.reader(file, delimiter=",", quotechar='"')
    for row in csv_reader:
        prompt = row[1]
        descriptions.append(prompt)
```
In fact, for some reason ChatGpt refused to remove the space between the comma and the prompt, giving me some `TypeError: "delimiter" must be a 1-character string`-headaches. A quick ` %s/ "/"/g` in Vim fixed the issue with in a scope-relevant manner.

### Using MusicGen

For this, I'm using [MusicGen's medium-size model](https://huggingface.co/facebook/musicgen-medium). This is the sweet spot for local generation, where with a 16 Gb GPU you can still generate ~30 seconds songs.

## Results

Let's look at individual prompt results.

### The good

***Channel the spirit of iconic retrowave artists like Kavinsky and Mitch Murder.***

<audio controls>
  <source src="audio/Incorporate retro synthwave aesthetics into the album artwork..wav" type="audio/wav" />
</audio>

So yeah, with this in mind you could likely do with a lot less prompts too, but just rerun the audio generation over and over again.

### The bad

**Incorporate retro computer game sounds and bleeps into the composition..wav**

<audio controls>
  <source src="audio/Incorporate retro computer game sounds and bleeps into the composition..wav" type="audio/wav" />
</audio>

### The "What on earth?"-category

**Emulate the sound of a vintage computer booting up**
<audio controls>
  <source src="audio/Emulate the sound of a vintage computer booting up.wav" type="audio/wav" />
</audio>

**Take inspiration from retro video game music for a nostalgic twist**

## So how does this benchmark?

I can't believe I'm even considering this question. I've made a my fair share of Synthwave, so let's take a small comparison. I had been producing music on a computer for ~4 years and just moved to producing Synthwave. The production is fairly amateurish, but not from a complete novice either.

Also, I'll use a mono version of my song to balance the comparison against MusicGen. Have a guess, which 30 second clip is from my song and which comes from MusicGen?

### Song 1

### Song 2

----

## Local installation

You want to try this out as well? To get started, first clone the AudioCraft repository somewhere:

```bash
git clone https://github.com/facebookresearch/audiocraft.git
```

Next, ensure you have a new, clean virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate
```

**NOTE: If you have an AMD GPU, install ROCm-versions of pytorch:**

```bash
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm5.4.2
```

Install the repository as a symlinked module:

```bash
pip install -e .
```

Get the full Python script shown earlier from here (TODO: github gist).

Now running the script should start the process:

```bash
python test.py --csv_file prompts.csv --song_length 30
```

To my surprise, MusiGgen works just fine even though [xFormers does not support ROCm](https://github.com/AUTOMATIC1111/stable-diffusion-webui/discussions/3949). This is also the reason you'll get the error message when running the script on an AMD GPU:

> WARNING[XFORMERS]: xFormers can't load C++/CUDA extensions. xFormers was built for:
>   PyTorch 2.0.1+cu118 with CUDA 1108 (you have 2.0.1+rocm5.4.2)
>   Python  3.10.13 (you have 3.10.12)
> Please reinstall xformers (see https://github.com/facebookresearch/xformers#installing-xformers)
> Memory-efficient attention, SwiGLU, sparse and more won't be available.
> Set XFORMERS_MORE_DETAILS=1 for more details

But like any true end user, we can't read error messages and instead focus on the output whether or not we get something out of the program.

## Issues

### Reproducability

The biggest issue is the non-deterministic nature of generative AI models for music. Right now the same prompt leads to two **completely** different outputs.

Consider the earlier example:

<audio controls>
  <source src="audio/Channel the spirit of iconic retrowave artists like Kavinsky and Mitch Murder.wav" type="audio/wav" />
</audio>

But with a second pass, you get this result

<audio controls>
  <source src="audio/Channel the spirit of iconic retrowave artists like Kavinsky and Mitch Murder_2.wav" type="audio/wav" />
</audio>

### Control

Music needs a lot of fine control, and text prompts just aren't good enough interfaces.

## Future

This is the part where the boring evaluation ends and wild speculation starts.

One thing which these models focus (perhaps) too much on is generating music just from a text prompt. Or simple melodies.

The interesting bit is that in terms of production quality, MusicGen's output is actually pretty nice. I would argue that it would takes several years for a complete beginner to get this far in terms of production.

At least when you start factoring in the variety of genres it can produce.

But the problem is still the details in the composition. It sort of suffers from the same issue as most: the composition itself is not interesting enough.

So how would you measure the composition quality? Well, current AI can't act as a music critique, so the closest thing is our own intuition. Or maybe a real music critic.

Imagine the song played live by an orchestra. Or a small band at your local venue. Would you consider it good?

But the opposite is where things start getting more interested: what happens when you can feed a draft of your song to the AI?

