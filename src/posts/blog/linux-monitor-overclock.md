---
title: "Overclocking monitor on Linux"
category: "Music"
date: "2023-11-04 12:22"
desc: "When EDID gives you troubles"
thumbnail: "./images/default.jpg"
alt: "markdown logo"
---

## Ignore manufacturer EDID

Display manufacturers specify various information on their displays to the EDID. When checking for available resolutions, X11 tries to verify that the current mode corresponds to the available ones reported by the monitor. But what if we **know** that the monitor can do better?

In X config, specify this

```toml
Option "UseEDIDFreqs" "FALSE"
```


## Adding custom resolution

First, check info on your current display:

```
$ xrandr -q


```

```bash
xrandr --newmode "1600x1200_60.00"  162.00  1600 1664 1856 2160  1200 1201 1204 1250 +hsync +vsync
xrandr --addmode VGA-1 1600x1200_60.00
xrandr --output VGA-1 --mode 1600x1200_60.00
```

## Not all connectors are created equal

In the case of relatively antiquated VG23AH, the HDMI port used does not have enough bandwidth to get 76Hz working on the monitor. Based on my experimentations, 72 Hz is the best it can do. So let's use that instead:


