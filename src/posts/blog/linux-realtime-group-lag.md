---
title: "Heavy CPU usage after adding user to realtime group"
category: "Linux"
date: "2024-01-07 19:26"
desc: "Timing and scheduler work in mysterious ways"
thumbnail: "./images/default.jpg"
alt: "markdown logo"
---

# Context

I've been using Linxu for audio production for the past 7 years right now. Despite the lack of plugins, things work great.

Well, except for one thing.

My user is not in the audio group. And it's been this way for a long, long time. I had some performance problems to which I didn't bother diagnosing. Leaving my user account without realtime privileges was the 

To get started, let's just run 

```
# usermod -a -G <usename> audio
```

and log out and back in. Now everything I run on my machine can access the highest of process priorities. This means that audio should now have a.

Let's boot up Reaper, next. I start playback and immediately notice immense glitching. The playback does not even go through real time. To add insult to injury, the UI has now become unbearably slow.

This is the same issue as last time. So what exactly happened?

# Digging into scheduling

I'm fortunate enough to have a reasonably powerful laptop with a similar setup. I check there and my user *does* belong to the audio group. CPU priorities also look good, so does overall performance. So where to start now?

Ah yes, `/proc/interrupts`. Let's keep an eye on that:

```sh
watch -n 0.1 cat /proc/interrupts
```

Here we can see the amount of interrupts done per core and per source.

My CPU has 16 logical cores, each column here (CPU0 to CPU15) corresponds to one of them. In the right hand side of each row, the cause of the interrupt is listed. 


```bash
Every 0.1s: cat /proc/interrupts                                                                                                                                                                                                                                                                                                                                   evo: Fri Sep  6 07:17:34 2024

            CPU0       CPU1       CPU2       CPU3       CPU4       CPU5       CPU6       CPU7       CPU8       CPU9       CPU10      CPU11      CPU12      CPU13      CPU14      CPU15
   0:         48          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-IO-APIC    2-edge      timer
   5:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-IO-APIC    5-edge      parport0
   7:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-IO-APIC    7-fasteoi   pinctrl_amd
   8:          0          0          1          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-IO-APIC    8-edge      rtc0
   9:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-IO-APIC    9-fasteoi   acpi
  28:         22          0          1          0          0          0          0          0          0          0          0          0          0          0          0          0  PCI-MSI-0000:00:00.2    0-edge      AMD-Vi
  29:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-0000:00:01.1    0-edge      PCIe PME, aerdrv
  30:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-0000:00:01.3    0-edge      PCIe PME, aerdrv
  31:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-0000:00:03.1    0-edge      PCIe PME, aerdrv
  32:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-0000:00:07.1    0-edge      PCIe PME
  34:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-0000:00:08.1    0-edge      PCIe PME
  44:    3644510          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-0000:03:00.1    0-edge      ahci[0000:03:00.1]
  46:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-0000:27:00.2    0-edge      ahci[0000:27:00.2]
  48:          0          0          0          6          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-0000:25:00.3    0-edge      0-0008
  50:          0          0          0          0          0        487          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-0000:27:00.3    0-edge      snd_hda_intel:card1
  51:          0          0          0          0          0         40          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSIX-0000:01:00.0    0-edge      nvme0q0
  52:        373          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSIX-0000:01:00.0    1-edge      nvme0q1
  53:          0        359          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSIX-0000:01:00.0    2-edge      nvme0q2
  54:          0          0        413          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSIX-0000:01:00.0    3-edge      nvme0q3
  55:          0          0          0        271          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSIX-0000:01:00.0    4-edge      nvme0q4
  56:          0          0          0          0        564          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSIX-0000:01:00.0    5-edge      nvme0q5
  57:          0          0          0          0          0        330          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSIX-0000:01:00.0    6-edge      nvme0q6
  58:          0          0          0          0          0          0        744          0          0          0          0          0          0          0          0          0  IR-PCI-MSIX-0000:01:00.0    7-edge      nvme0q7
  59:          0          0          0          0          0          0          0        438          0          0          0          0          0          0          0          0  IR-PCI-MSIX-0000:01:00.0    8-edge      nvme0q8
  60:          0          0          0          0          0          0          0          0       2201          0          0          0          0          0          0          0  IR-PCI-MSIX-0000:01:00.0    9-edge      nvme0q9
  61:          0          0          0          0          0          0          0          0          0        437          0          0          0          0          0          0  IR-PCI-MSIX-0000:01:00.0   10-edge      nvme0q10
  62:          0          0          0          0          0          0          0          0          0          0        400          0          0          0          0          0  IR-PCI-MSIX-0000:01:00.0   11-edge      nvme0q11
  63:          0          0          0          0          0          0          0          0          0          0          0        519          0          0          0          0  IR-PCI-MSIX-0000:01:00.0   12-edge      nvme0q12
  64:          0          0          0          0          0          0          0          0          0          0          0          0        671          0          0          0  IR-PCI-MSIX-0000:01:00.0   13-edge      nvme0q13
  65:          0          0          0          0          0          0          0          0          0          0          0          0          0       1001          0          0  IR-PCI-MSIX-0000:01:00.0   14-edge      nvme0q14
  66:          0          0          0          0          0          0          0          0          0          0          0          0          0          0        875          0  IR-PCI-MSIX-0000:01:00.0   15-edge      nvme0q15
  67:  248836593          0          0          0          0   11855265          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-0000:03:00.0    0-edge      xhci_hcd
  75:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-0000:22:00.0    0-edge      xhci_hcd
  84:       1843          0          0          0          0         74          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-0000:25:00.2    0-edge      xhci_hcd
  93:      98317          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-0000:26:00.3    0-edge      xhci_hcd
 101:   78365364          0          0          0          0    6339503          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-0000:25:00.0    0-edge      amdgpu
 103:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSIX-0000:26:00.2    0-edge      psp-1
 104:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSIX-0000:26:00.2    1-edge      ccp-1
 105:        965   21803564          0          0          0          0          0          0          0          0          0      36720          0          0          0          0  IR-PCI-MSIX-0000:1e:00.0    0-edge      enp30s0
 107:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0       3021  IR-PCI-MSIX-0000:01:00.0   16-edge      nvme0q16
 109:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-0000:25:00.1    0-edge      snd_hda_intel:card0
 NMI:         80      11597      11992      11641      12004      11706      12020      11705      11969      11660      11964      11683      11951      11645      11974      11687   Non-maskable interrupts
 LOC: 1512622651  264903049  302009566  280517545  292627610  235121865  405351050  237000289  295252539  239082321  304910590  252729889  319355274  296553762  290293745  233191224   Local timer interrupts
 SPU:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0   Spurious interrupts
 PMI:         80      11597      11992      11641      12004      11706      12020      11705      11969      11660      11964      11683      11951      11645      11974      11687   Performance monitoring interrupts
 IWI:        275        385          9          5        249         12         22        230         19          5          9         88         12         11         13        272   IRQ work interrupts
 RTR:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0   APIC ICR read retries
 RES:    3758737    5312168    3792978    3273848    3851267    3382458    3971552    3438542    3144835    2680993    3172715    2759162    3262214    2862473    3398232    2956462   Rescheduling interrupts
 CAL:  297846172  315893124  334316813  333297576  335472530  331803379  338329861  339236161  336837902  342289427  337166079  337278432  346701463  347494507  341664458  354906342   Function call interrupts
 TLB:   17316479   16700260   17279616   16731805   17692213   17111019   17990114   17370089   18479647   18028922   17735578   17514137   17826721   17314256   18052571   17747879   TLB shootdowns
 TRM:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0   Thermal event interrupts
 THR:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0   Threshold APIC interrupts
 DFR:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0   Deferred Error APIC interrupts
 MCE:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0   Machine check exceptions
 MCP:        879        853        853        852        852        852        853        853        853        853        854        855        855        855        855        855   Machine check polls
 ERR:          1
 MIS:          0
 PIN:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0   Posted-interrupt notification event
 NPI:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0   Nested posted-interrupt event
 PIW:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0   Posted-interrupt wakeup event
 PMN:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0   Posted MSI notification event
```


One of the highest sources is `amdgpu`. Well, that's my GPU, so that's expected as well.

My soundcard is connected via USB, so the source of interrupts for it is `xhci_hcd`. The interrupts caused by it are located in CPU0 and CPU5. So it's not spread really evenly. Even worse, interrupts by `amdgpu` are also mostly located in CPU0, so any audio handling done there is contested by handling graphcis calls.


Testing with irqbalance  --debug gives us the following statistics:

```bash
Every 0.1s: cat /proc/interrupts                                                                                                                                                                                                                                                                                                                                evo: Fri Sep  6 07:43:06 2024

            CPU0       CPU1       CPU2       CPU3       CPU4       CPU5       CPU6       CPU7       CPU8       CPU9       CPU10      CPU11      CPU12      CPU13      CPU14      CPU15
   0:         48          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-IO-APIC    2-edge      timer
   5:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-IO-APIC    5-edge      parport0
   7:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-IO-APIC    7-fasteoi   pinctrl_amd
   8:          0          0          1          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-IO-APIC    8-edge      rtc0
   9:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-IO-APIC    9-fasteoi   acpi
  28:         22          0          1          0          0          0          0          0          0          0          0          0          0          0          0          0  PCI-MSI-0000:00:00.2    0-edge      AMD-Vi
  29:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-0000:00:01.1    0-edge      PCIe PME, aerdrv
  30:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-0000:00:01.3    0-edge      PCIe PME, aerdrv
  31:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-0000:00:03.1    0-edge      PCIe PME, aerdrv
  32:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-0000:00:07.1    0-edge      PCIe PME
  34:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-0000:00:08.1    0-edge      PCIe PME
  44:    3646883          0          0          0          0          0          0         98          0          0          0          0          0          0          0          0  IR-PCI-MSI-0000:03:00.1    0-edge      ahci[0000:03:00.1]
  46:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-0000:27:00.2    0-edge      ahci[0000:27:00.2]
  48:          0          0          0          6          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-0000:25:00.3    0-edge      0-0008
  50:          0          0          0          0          0        487          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-0000:27:00.3    0-edge      snd_hda_intel:card1
  51:          0          0          0          0          0         46          0          0          0          0          0          0          0          3          0          0  IR-PCI-MSIX-0000:01:00.0    0-edge      nvme0q0
  52:       1202          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSIX-0000:01:00.0    1-edge      nvme0q1
  53:          0       1109          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSIX-0000:01:00.0    2-edge      nvme0q2
  54:          0          0       1460          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSIX-0000:01:00.0    3-edge      nvme0q3
  55:          0          0          0       1248          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSIX-0000:01:00.0    4-edge      nvme0q4
  56:          0          0          0          0       1614          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSIX-0000:01:00.0    5-edge      nvme0q5
  57:          0          0          0          0          0       1103          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSIX-0000:01:00.0    6-edge      nvme0q6
  58:          0          0          0          0          0          0       1925          0          0          0          0          0          0          0          0          0  IR-PCI-MSIX-0000:01:00.0    7-edge      nvme0q7
  59:          0          0          0          0          0          0          0       1443          0          0          0          0          0          0          0          0  IR-PCI-MSIX-0000:01:00.0    8-edge      nvme0q8
  60:          0          0          0          0          0          0          0          0       3322          0          0          0          0          0          0          0  IR-PCI-MSIX-0000:01:00.0    9-edge      nvme0q9
  61:          0          0          0          0          0          0          0          0          0       1545          0          0          0          0          0          0  IR-PCI-MSIX-0000:01:00.0   10-edge      nvme0q10
  62:          0          0          0          0          0          0          0          0          0          0       1662          0          0          0          0          0  IR-PCI-MSIX-0000:01:00.0   11-edge      nvme0q11
  63:          0          0          0          0          0          0          0          0          0          0          0       1748          0          0          0          0  IR-PCI-MSIX-0000:01:00.0   12-edge      nvme0q12
  64:          0          0          0          0          0          0          0          0          0          0          0          0       1884          0          0          0  IR-PCI-MSIX-0000:01:00.0   13-edge      nvme0q13
  65:          0          0          0          0          0          0          0          0          0          0          0          0          0       1769          0          0  IR-PCI-MSIX-0000:01:00.0   14-edge      nvme0q14
  66:          0          0          0          0          0          0          0          0          0          0          0          0          0          0       1951          0  IR-PCI-MSIX-0000:01:00.0   15-edge      nvme0q15
  67:  249945864          0          0          0          0   11855265     445927          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-0000:03:00.0    0-edge      xhci_hcd
  75:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-0000:22:00.0    0-edge      xhci_hcd
  84:       1843          0          0          0          0         74          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-0000:25:00.2    0-edge      xhci_hcd
  93:      98317          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-0000:26:00.3    0-edge      xhci_hcd
 101:   78779206          0          0          0          0    6339503          0          0          0     124678          0          0          0          0          0          0  IR-PCI-MSI-0000:25:00.0    0-edge      amdgpu
 103:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSIX-0000:26:00.2    0-edge      psp-1
 104:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSIX-0000:26:00.2    1-edge      ccp-1
 105:        965   21832732          0          0          0          0          0          0          0          0          0      38233          0          0          0          0  IR-PCI-MSIX-0000:1e:00.0    0-edge      enp30s0
 107:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0       3809  IR-PCI-MSIX-0000:01:00.0   16-edge      nvme0q16
 109:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-0000:25:00.1    0-edge      snd_hda_intel:card0
 NMI:         80      11710      12107      11753      12119      11820      12135      11819      12084      11774      12078      11796      12065      11758      12089      11801   Non-maskable interrupts
 LOC: 1523436646  266333753  303759324  281958156  294399628  236534259  407098297  238387095  296571707  240250179  306241263  253919155  320697239  297746898  291626477  234377989   Local timer interrupts
 SPU:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0   Spurious interrupts
 PMI:         80      11710      12107      11753      12119      11820      12135      11819      12084      11774      12078      11796      12065      11758      12089      11801   Performance monitoring interrupts
 IWI:        275        386          9          5        249         12         23        230         19          5          9         88         12         11         13        272   IRQ work interrupts
 RTR:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0   APIC ICR read retries
 RES:    3796590    5379566    3837739    3312638    3897533    3422601    4018063    3479823    3183580    2714077    3212495    2795388    3304022    2900512    3440744    2992330   Rescheduling interrupts
 CAL:  298922165  316927265  335481455  334354152  336621694  332821868  339466606  340234565  338128749  343757213  338486814  338765905  348015017  348957519  342947851  356437295   Function call interrupts
 TLB:   17327878   16711968   17294573   16755631   17707670   17129665   18003681   17384230   18493251   18041659   17750223   17529094   17842667   17327283   18067114   17763520   TLB shootdowns
 TRM:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0   Thermal event interrupts
 THR:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0   Threshold APIC interrupts
 DFR:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0   Deferred Error APIC interrupts
 MCE:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0   Machine check exceptions
 MCP:        884        858        858        857        857        857        858        858        858        858        859        860        860        860        860        860   Machine check polls
 ERR:          1
 MIS:          0
 PIN:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0   Posted-interrupt notification event
 NPI:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0   Nested posted-interrupt event
 PIW:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0   Posted-interrupt wakeup event
 PMN:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0   Posted MSI notification event
 ```

 Now the interrupts caused by the soundcard are handled on CPU6, while the GPU interrupts are handled in CPU9. So success?


### Reaper settings

 Interestingly, one thing which I did not take into account is how the audio applications allocate real-time system resources.

 Let's take a look at what options Reaper provides:

We have `thread priority` set to `highest` and `behavior` set to `15 - very aggressive`. Now that we have realtime enabled, if we let Reaper handle the audio buffering as aggressively as it can, the "other side", or the user interface will be left in the dust.

Same goes for overall CPU usage: when using `15 - very aggressive`, CPU gets to 80% usage while playback is on. However, when dialing it back to automatic, or `0 - relaxed`,  average CPU usage across all

When we have pre-emptive scheduling 

So why does this happen? TODO: find out,

Simply put, it's the audio and UI threads competing for CPU time. The issue here is that when the audio threads get aggressive enough, with pre-emptive scheduling they will kick out any UI thread currently rendering. With this you 

As a dumb user my solution here was to remove my user account from the audio group altogether, which caused Reaper to no longer have access to real-time scheduling. With this change the audio processing threads would no longer kick out the UI threads, letting the UI respond to mouse actions quickly enough.

Also, the whole CPU usage was lower here as well.

But then I had problems with effects on MIDI input. I would play some notes on a MIDI keyboard, and the audio would start glitching, sounding horrible and unusable. The only option was to play less CPU-intensive plugins.

Let's think about this live instrument playing a little bit more. In this use case, you listen to the audio and all of your inputs happen on the external MIDI device. You might take a look at the UI a little bit, but I'm at least not using my mouse or keyboard at all. So any time spent refreshing the UI as fast as possible is wasted. But now that the audio threads can't kick out any UI threads from using the CPU, they are forced to wait. And they wait a little too long, finally causing glitches in playback when their requests are not handled in time.


### Debugging

To prove my hunch right, let's open some Linux profiling tools.

First, record 30 seconds of profile data, after which build a flamegraph out of it:

```bash
sudo perf record -F 99 -a -g -- sleep 30
sudo perf script -f | stackcollapse-perf.pl | flamegraph.pl > perf.svg
```

This gives an SVG file which I'll embed below:
TODO: embed flamegraph here

