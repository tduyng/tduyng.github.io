+++
title = "Revit API Template"
description = "Revit-WPF template 2018-2020+ for Revit API (C#)"
weight = 30

[extra]
local_image = "projects/revit-api/img/revit-api.webp"
+++

# Revit WPF Template
Template in visual studio for creating Revit C# .net addin with WPF

WPF in Revit API maybe make some difficulties for the first times to work with it.
As a beginner and a selt-touch developper, I waste many times to understand how does it works.
So, I create this template to using in my future other projects.

### About this template

In this template, I show how I use:
  - Organize project with MVVM pattern
  - Create and raise external event of Revit API with modeless form WPF
  - Binding command totally, not using event in code behind
  - Fix some problem with modeless forme: topmost, Window owner, minimize Window
  - Integrate type Window, Usercontrol in this template
  - Utils for image of icon of ribbon constrol Revit
  - Work with Json settings file