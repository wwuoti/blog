---
title: "How to handle scheduled pipeline logic in Azure pipelines?"
category: "DevOps"
date: "2024-01-07 19:26"
desc: "A little push never hurt anybody"
thumbnail: "./images/og-default.png"
alt: "markdown logo"
---

To use this as a job condition (so whether or not to run a job), use this:

```yaml
job:
- condition: eq(variables['Build.Reason'], 'Schedule')
```

The big problem comes with allowing the pipeline user some degree of control

What if you have a (boolean) parameter which:

- needs to be disabled when running a manual build
- needs to be enabled when running a nightly scheduled build

The answer is to use some rather ugly looking template logic.


