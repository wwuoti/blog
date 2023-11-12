---
title: "Overclocking monitor on Linux"
category: "Music"
date: "2023-11-04 12:22"
desc: "When EDID gives you troubles"
thumbnail: "./images/default.jpg"
alt: "markdown logo"
---

<!-- markdownlint-disable line-length -->

For the longest time of LCDs, most computer monitors have had their refresh rates capped at 60 Hz, even though they could do some more. How much more, well it depends on your display. ~10 years before, it was really rare to see IPS screens with high refresh rates. But there were options: either buy shady Korean IPS panels (TODO: forum), pray that your customs agent lets them through. OR get a monitor where the manufacturer left a little headroom, either intentionally or not.

One such monitor was Asus' VG23AH, a 23-inch 1080p. As was the hype with early 2010s, it also "supported" passive 3d. Because of course it did. While the display only supported 60 Hz out of the box, the display **could** be overclocked up to 76 Hz, a **whopping** 27% increase!

There were instructions on how to setup custom resolutions with Nvidia control panel. But that's on Windows. What about Linux? With Linux, you'll need to start tweaking your `Xorg.conf` file. Let's take a look.

## Ignore manufacturer EDID

**DISCLAIMER: This may break your monitor. These instructions are provided as is, use them at your own risk!** (Your retailer or manufacturer likely won't have a lot of sympathy for broken monitors caused by pushing the pixel clocks and refresh rates too far by bypassing their limitations.)

Display manufacturers specify various information on their displays to the EDID. When checking for available resolutions, X11 tries to verify that the current mode corresponds to the available ones reported by the monitor. But what if we **know** that the monitor can do better?

## Adding custom resolution

First, check info on your current display:

```
$ xrandr -q
```

Next, use the [video timings calculator](https://tomverbeure.github.io/video_timings_calculator) to calculate a modeline for your display.

In this case, we're going with a 1920 by 1080 72 Hz resolution. For that we get the following resolution: 

```unix
Modeline        "1920x1080_71.91" 210.25 1920 2056 2256 2592 1080 1083 1088 1128 -HSync +VSync 
```

Note that in addition to the regular modeline, you also 3 other optionns, such as `CVT-RB` and `CVT-RBv2`. The `RB` stands for Reduced Blanking, which effectively allows you to transfer more data with a lower bandwidth. However, even the regular RB was made part of HDMI 2.0, so you'll need a fairly recent display to take advantage of that.

[Read more on video modes and modelines here](https://www.improwis.com/tables/video.webt#Videomodesandmodelines)

[This is where I got the info on Nvidia driver settings for Linux monitor overclocking](https://www.monitortests.com/forum/Thread-Guide-to-Nvidia-monitor-overclocking-on-Linux)

Alternatively, you could also use the `cvt` tool, but the website gives you more information for troubleshooting.

```bash
xrandr --newmode "1600x1200_60.00"  162.00  1600 1664 1856 2160  1200 1201 1204 1250 +hsync +vsync
xrandr --addmode VGA-1 1600x1200_60.00
xrandr --output VGA-1 --mode 1600x1200_60.00
```

## Not all connectors are created equal

The usefulness of [video timings calculator](https://tomverbeure.github.io/video_timings_calculator) detailed descriptions come into play now: the VG23AH has a peculiar problem where 76Hz is supported only on DVI. You can use the chart on the site to look at different input types, and then check whether or not the bandwidth requires is supported by the ocnnector.

In the case of the relatively antiquated VG23AH, the monitor should support 76 Hz via HDMI as well, as it does support HDMI 1.4. So bear in mind that it might not be a complete list. This is a problem I remember facing a long time back when creating custom resolutions on Windows too, so it might be that there's something more related to the HDMI port on this monitor that's left unspecified. In any case, 72 Hz is what we'll have to do.


In the `device` section, ensure you have this:

```unix
Section "Monitor"
    # HorizSync source: edid, VertRefresh source: edid
    Identifier     "Monitor0"
    VendorName     "Unknown"
    ModelName      "Ancor Communications Inc ASUS VG23A"
    HorizSync       28.0 - 83.0
    VertRefresh     50.0 - 85.0
    Option         "DPMS"
    Modeline       "1920x1080_71.91" 210.25 1920 2056 2256 2592 1080 1083 1088 1128 -HSync +VSync 
EndSection
```

Find the section for your device and disable using EDID-based frequencies with  `Option      "UseEDIDFreqs"  "false"`

```unix
Section "Device"
    Option      "UseEDIDFreqs"  "false"
```

It is highly likely that your monitor does not have the higher refresh rate modes set in its EDID. With these changes the built-in EDIDs are ignored, allowing you to use the new custom resolution.

Once you have done your settings in the Xorg config file, reboot your PC.

Finally, run `xrandr -q` again and you should see your new custom mode active:

```
TODO: xrand output here
```

## VG23AH X conf

```
# nvidia-settings: X configuration file generated by nvidia-settings
# nvidia-settings:  version 455.45.01

Section "ServerLayout"
    Identifier     "Layout0"
    Screen      0  "Screen0" 0 0
    InputDevice    "Keyboard0" "CoreKeyboard"
    InputDevice    "Mouse0" "CorePointer"
    Option         "Xinerama" "0"
EndSection

Section "Files"
EndSection

Section "Module"
    Load           "dbe"
    Load           "extmod"
    Load           "type1"
    Load           "freetype"
    Load           "glx"
EndSection

Section "InputDevice"
    # generated from default
    Identifier     "Mouse0"
    Driver         "mouse"
    Option         "Protocol" "auto"
    Option         "Device" "/dev/psaux"
    Option         "Emulate3Buttons" "no"
    Option         "ZAxisMapping" "4 5"
EndSection

Section "InputDevice"
    # generated from default
    Identifier     "Keyboard0"
    Driver         "kbd"
EndSection

Section "Monitor"
    # HorizSync source: edid, VertRefresh source: edid
    Identifier     "Monitor0"
    VendorName     "Unknown"
    ModelName      "Ancor Communications Inc ASUS VG23A"
    HorizSync       28.0 - 83.0
    VertRefresh     50.0 - 85.0
    #HorizSync       30.0 - 94.0
    #VertRefresh     48.0 - 120.0 
    Option          "DPMS"
    Modeline        "1920x1080_71.91" 210.25 1920 2056 2256 2592 1080 1083 1088 1128 -HSync +VSync 
EndSection

Section "Device"
    Identifier     "Device0"
    Driver         "nvidia"
    VendorName     "NVIDIA Corporation"
    BoardName      "GeForce GTX 970"
    Option         "UseEDIDFreqs" "false"
EndSection

Section "Screen"
    Identifier     "Screen0"
    Device         "Device0"
    Monitor        "Monitor0"
    DefaultDepth    24
    Option         "Stereo" "0"
    Option         "metamodes" "1920x1080_71.91 +0+0"
    Option         "SLI" "Off"
    Option         "MultiGPU" "Off"
    Option         "BaseMosaic" "off"
    Option         "Coolbits" "12"
    Option         "ModeValidation"   "AllowNonEdidModes,NoEdidMaxPClkCheck,NoMaxPClkCheck" 
    SubSection     "Display"
        Depth       24
    EndSubSection
EndSection

```
