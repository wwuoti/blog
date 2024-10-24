---
title: "Reaper on Wayland"
category: "Linux"
date: "2024-01-07 19:26"
desc: "Open sourcing your work has surprising consequences"
thumbnail: "./images/default.jpg"
alt: "markdown logo"
---

# Reaper on Wayland

## Context

Wayland has been getting ever so popular lately, but there's still quite a lot of software lacking native support for it. One of these is Reaper. It's what I use for music production.


Turns out that the API Reaper uses for rendering its UI on Linux is open-source. It's available [here](https://github.com/justinfrankel/WDL/tree/main/WDL/swell) inside the WDL repository.

WDL contains much more, but we're mostly interested in SWELL. It acts as a bridge between win32 API, allowing Reaper to run on Linux and Mac.

What happens under the hood in SWELL is that it uses GDK for displaying all the various UI windows, along wit Cairo for rendering.

## Getting started

First, let's replace the libSwell library used by our existing Reaper installation.

Next, build SWELL with `make`. 

```
cd WDL/WDL/swell
make DEBUG=1
```

After this, you have a `libSwell.so` library file in the current directory. Let's symlink it to Reaper so that is uses the newly built one instead of the default library it ships with:

```
cd <path_to_reaperl>
mv libSwell.so libsSwell.so.bak
ln -s <path_to_WDL_repo>/WDL/swell/libSwell.so libSwell.so
```

Next, ensure you have a desktop environment running on Wayland. For reference, I'm running Sway from a terminal on i3, my current window manager for X11. This makes prototyping Wayland work relatively easy without having to log on/off all the time. You know, commitment issues and all that.

### First launch

Launch Reaper with:

```bash
cd <path_to_reaperl>
GDK_BACKEND=wayland ./reaper
```

> `Segmentation fault: 11 (core dumped)`

Aaaaand we crashed. But that's expected.

There's a lot of behavior on SWELL which uses native X11 functions, such as getting the name of the current window manager. As the whole concept of a window manager is not valid on Wayland, we'll need to start branching things out.

Like when the focus is deactivated, the name of the desktop is queried here:

```cpp
static void on_deactivate()
{
  swell_app_is_inactive=true;
  HWND lf = swell_oswindow_to_hwnd(SWELL_focused_oswindow);
#ifdef GDK_WINDOWING_X11
    if (GDK_IS_X11_WINDOW (lf->m_oswindow))
      s_last_desktop = lf && lf->m_oswindow ? _gdk_x11_window_get_desktop(lf->m_oswindow)+1 : 0;
#endif
#ifdef GDK_WINDOWING_WAYLAND
    if (GDK_IS_WAYLAND_WINDOW (lf->m_oswindow))
      s_last_desktop = lf && lf->m_oswindow ? 0+1 : 0;
        
#endif
```

`_gdk_x11_window_get_desktop` is X11-specific, so that won't work. 

This feature isn't critical for now, so let's move on.

Or this one, here we're looking at the window manager name. The whole concept of a window manager doesn't exist on Wayland, but the closest thing is the compositor. In my case Sway. Sure, the might be a programmatic way of querying it but for now I'll just hard-code it:

```
if (GDK_IS_X11_DISPLAY (gdkdisp))
    wmname = gdk_x11_screen_get_window_manager_name(gdk_screen_get_default());
else
    wmname = "sway";
```


After quite a few of these changes, we finally get Reaper to start up:

A quick sanity check the list of current windows on sway and ensure Reaper is there:

```
swaymsg -t get_tree
```




This gives us 

```
#1: root "root"
  #3: output "X11-1"
    #9: workspace "1:web"
      #18: con "(null)"
        #28: con "(null)"
          #39: con "(null)"
            #42: con "(null)"
          #37: con "REAPER v6.82 <==BINGO
```

Alternatively, run `xprop` and hover the cursor on top of the Reaper's main window.
In either case, we can see that we're running on Wayland.

### Screen updates are broken?

Now we start to get to the interesting bits.

There's two main points of calling Cairo's rendering functions, `swell_oswindow_updatetoscreen` and `OnExposeEvent`. `OnExposeEvent` is just an event handler for GDKs own ExposeEvent event, which occurs when an GDK thinks an area needs to be redrawn on the UI.

In practice this means various hover events, like hovering over a button or some resize handle. Resizing any element also triggers this.

The `updatetoscreen` function on the other hand renders the screen when no expose events have occurred.

In practice this means the volume meters of your tracks and the main playhead, which goes from left to right when you press play.

These have to update much more frequently than any event would arrive. Even when the user just sitting still, you still need to update the screen on the status of the playback and the volume level of the various tracks. So separate drawing for that is completely understandable.

But that separate drawing now keeps messing up everything on Wayland.

#### Debugging the screen updates

After commenting out everything in the `updatetoscreen` function, now the UI starts rendering somewhat properly.  Hover effects work and elements resized correctly.

But now none of the db meters, neither the playhead update when playback is started. Well that's due to removing the rendering of those parts obviously.

But why did this happen? Think about a single expose event. You hover over one element once, the UI renders that element and that's it. 

Now think about the volume meters and the playhead. Those are updating *all the time*.

Since the `updatetoscreen` is called more frequently, chances are that immediately after an expose event it's time to render the db meters and the playhead.

```cpp
void swell_oswindow_updatetoscreen(HWND hwnd, RECT *rect)
```

The area updated is supposed to be restricted on just a small subset of the whole screen. That's the purpose of the GDK rectangle specified there.

Well what happens if we just override this? Let's take the measurements of the window like this:

```cpp
RECT cr;
cr.left=cr.top=0;
cr.right = hwnd->m_position.right - hwnd->m_position.left;
cr.bottom = hwnd->m_position.bottom - hwnd->m_position.top;
```

And use them to force GDK to render the whole area. 

```cpp
rect = &cr;

cairo_rectangle_int_t cairo_rect={rect->left,rect->top,rect->right-rect->left,rect->bottom-rect->top};

const cairo_region_t* rrr = cairo_region_create_rectangle(&cairo_rect);
GdkDrawingContext* context = gdk_window_begin_draw_frame(hwnd->m_oswindow, rrr);
```

Now the oswindow updates are not disturbing the hover events anymore. 

But there's still more to this screen update issue.

#### Lackluster playback


When pressing play, the playhead updates maybe once, and then nothing.

Maybe color the areas differently on both the oswindow update and the expose event updates?

### Mouse events not being sent correctly?

Suddenly after making a clean build I'm greeted by the UI not rendering my mouse hover events at all. When hovering the mouse over Reaper's track control panel I get this:

![](images/reaper_wayland/track_resize.png)


The mouse is supposed to change it's indicator to resize at the bottom. So we've got some very odd mouse offset going on.

Oh well, let's add some more prints. Here `m` is the mouse event as delivered by GDK. 

```cpp
POINT p2={(int)m->x_root, (int)m->y_root+Y_COORD_OFFSET};
printf("p2 x: %u y:p2.%u \n", p2.x, p2.y );
```
This results in the following:

```bash
p2 x: 6406 y:p2.1715 
p2 x: 6406 y:p2.1778 
p2 x: 6406 y:p2.1846 
p2 x: 6406 y:p2.1907 
p2 x: 6406 y:p2.1967 
p2 x: 6406 y:p2.2027 
p2 x: 6406 y:p2.2073 
```

Hold on, what? My desktop resolution is 3840x2160, the x coordinate is going off the charts.

Okay, that `p2` is coming from the GDK event `x_root` and `y_root`.
It's assigned from GdkEvent

Wait. Just to make sure, maybe I have something wrong in my environment?
That 6000px x coordinate would indicate that.
Well, my X screen does have that size due to two monitors, but I run Sway in a single window.
I think I have some scaling on, 1.25x for GDK and QT apps.
Maybe that could be it? 6400/3840 is ~ 1.67, so that can't be.

Luckily I have a second monitor. So move sway there and start reaper, let's try again.

Oh. Now it works.

![](images/reaper_wayland/track_resize_working.png)

And what if I the whole `sway` window back to my main display?

Still working.

And what if I restart reaper while sway is running on the main display?

Broken again.

I think I heard some harsh things on implementing scaling on win32. Maybe Reaper's forums or something. But I get it now.

Unfortunately this isn't even the biggest problem, there's still more to come.

### X won't give it to you

Let's add a plugin to a new track. Specifically a 3rd party VST. Aaaaaand that's a segfault.



So your application also kind of acts like a window manager, or a separate desktop environment.

Hear that? That's the scope of my little side project blowing up.

There's some interesting work related to this made by presonos (TODO: link here)

#### Swell and CreateBridgeWindow

The bridging function is quite long, but here's a short summary on it:

- Create an empty X11 window
- Create a GDK window from that
- Assign a callback function (for resizing and other operations)
- Send the newly created bridge window forward

So what do do on Wayland? 

This will still require creating a
