---
title: "On generative AI for music"
category: "Music"
date: "2023-11-06 12:22"
desc: "How Audiocraft handles Synthwave"
thumbnail: "./images/default.jpg"
alt: "markdown logo"
---

<!-- markdownlint-disable line-length -->

Progression in generative AI has made quite some leaps during the past year. Audio generation has been progressing as well

Riffusion (Stable diffusion trained on song spectrograms) was an interesting approach when it came out.

Being based on generative AI for images limits it too much though: There's not a lot of room

TODO: describe synthwave genre here

TODO. intro on Meta's audiocraft 

The best thing is that you can run this locally.

## Prompting

We need some prompts. So let's generate them with ChatGP.

***Channel the spirit of iconic retrowave artists like Kavinsky and Mitch Murder."***

<audio controls>
  <source src="audio/Channel the spirit of iconic retrowave artists like Kavinsky and Mitch Murder.wav" type="audio/mp3" />
</audio>

## Issues

### Reproducability

The biggest issue is the non-deterministic nature of generative AI models for music. Right now the same prompt leads to two **completely** different outputs: 

See this first attempt, quite a song

And then, a second pass with the exact same prompt:


### Control

Music needs a lot of fine control, and text prompts just aren't good enough interfaces.

### Future

One thing which these models focus (perhaps) too much on is generating music just from a text prompt. Or simple melodies.

The interesting bit is that in terms of production quality, MusicGen's output is actually pretty nice. I would argue that it would takes several years for a complete beginner to get this far in terms of production.
At least when you start factoring in the variety of genres it can produce. 

But the problem is still the details in the composition. It sort of suffers from the same issue as most: the composition itself is not interesting enough.

So how would you measure the composition quality? Well, current AI can't act as a music critique, so the closes thing is our intuition.

Imagine the song played live by an orchestra. Or a small band at your local venue. Would you consider it good?

But the opposite is where things start getting more interested: what happens when you can feed a draft of your song to the AI?



