# Mask:
**Generates a binary representation of an image based on the alpha property**

![VanillaJS](https://img.shields.io/badge/Vanilla%20-JS-yellowgreen) ![version](https://img.shields.io/badge/dynamic/json?color=blue&label=release%20&prefix=%20v%20&query=version&suffix=%20&url=https%3A%2F%2Fraw.githubusercontent.com%2FWizard-Js%2Fmask%2Fmain%2Fpackage.json)
![License](https://img.shields.io/badge/dynamic/json?color=yellowgreen&label=License&prefix=%20&query=license&suffix=%20&url=https%3A%2F%2Fraw.githubusercontent.com%2FWizard-Js%2Fmask%2Fmain%2Fpackage.json)

## Update

**Release Date:** 07/12/2022

***Features***
 * Enabled Selection of multiple images

## About

**Autor : [Ogbuagu Francis](http://ogbuaguwizard.github.io)**

This program uses canvas imageData to Generate a binary representation of an image, based on the alpha property.
It was originally developed to test for pixel perfect collision between objects in html5 canvas game against the use of canvas' imageData method in the game programe. But there are probably other problems out there this program might inspire a solution to.


## How to use

Click on the **Choose Img** button and select the image to be converted,
Choose image resolution by checking the radio button or use the original resolution(which will be visible after an image has been selected),
Click **Generate** button and the result will be downloaded as a .txt file.
You can copy the content of this file and use in your project, or any other way you've discovered to use this file.

> **Note:** Incase of collision detection in Html5 canvas, the chosen resolution has to match the width and height of object drawn on the canvas, not neccesarily the original resolution.

## Example

**Image vs Result**


![Image vs Result](https://drive.google.com/uc?export=view&id=12rY3h0JKhiKkHStH-Uf4XCAsFXvUa8Z9)
![Image vs Result](https://drive.google.com/uc?export=view&id=12qXQvUCD7fl5c_nvsylaEqwJiSyr3EaU)
![Image vs Result](https://github.com/ogbuaguwizard/mask/blob/main/imgs/result.png)

**Practical Example**

Convert an image with some transparent area yourself, click *[here](https://mask-jade-beta.vercel.app)*. Zoom out on the generated text to clearly see the 1s form the chosen image.

Check out *[this project](https://ogbuaguwizard.github.io/projects/NELCA%20Html5%20Game%20Courses/008%20Collision%20Detection/004%20Pixel%20Perfect%20Collision/)* where a generated mask was used to test for collision between two object.

## Appreciation

Thanks for checking out the project, if you like the project please give it a star.
