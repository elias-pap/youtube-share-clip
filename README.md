# youtube-share-clip [![CI](https://github.com/elias-pap/youtube-share-clip/actions/workflows/ci.yml/badge.svg)](https://github.com/elias-pap/youtube-share-clip/actions/workflows/ci.yml) [![](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) [![](https://img.shields.io/badge/linting-eslint-yellowgreen)](https://eslint.org/) [![](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)

Share sections of Youtube videos.

Advantages over YouTube Clip feature:

- There is no need to have a YouTube creator (google) account and to be logged in to create a clip.
- There is no 5-60 seconds restriction on clip duration. The clip can be however short or long you like.

Disadvantages:

- Does not work if the creator has deactivated embedding for the video.

Limitations:

- Does not work on Premiere and Live videos.

## 📦 Installation

Get it on [Chrome Web Store.](https://chrome.google.com/webstore/detail/youtube-share-clip/jknkoohnhhnlnojgddpjgibniodllhae)

## 🚀 Usage

This extension adds an "End at" checkbox and input under the "Start at" one in Share dialog.

This way you can get a link to a section of a YouTube video, by selecting "Start at" and "End at" times.

### Steps

Click the Share button which can be found under the video.

![](https://lh3.googleusercontent.com/An_8ihxFI8PBljWgLx0TZJ93Q8UIsjgNbMOm3DLrn63gMtbJaDz9gaYzGPIfqcjLWO5BEBYOoBACZhBs3tMBzoSS6g=w640-h400-e365-rj-sc0x00ffffff)

Set Start and End times.

![](https://lh3.googleusercontent.com/1_lH0DpH4XvUarTuQMySt_uQ4J28huBi11mdHJ03WgMvWDG_khM06THeGTM7SETO02MoY4O1SPTS3N6tTzNjYxrebFU=w640-h400-e365-rj-sc0x00ffffff)

Copy the generated URL. This is a link to the same video which will start and stop at the times you have selected.

![](https://lh3.googleusercontent.com/8BQwzyYzOrnhvDFjWd-uICLhI3Sg7440xlf9qOUvwgwzJdHKHyCrRs2r8azzfQdeQFyUrZ3SIdV0ai09KPpE-LUvug=w640-h400-e365-rj-sc0x00ffffff)

Enjoy sharing YouTube clips ! 🎉

## 🛠️ Development

### Dependencies

There are no production dependencies. Just vanilla JS.

### Contributing

Contributions are very welcome and I'm looking forward to your PRs.
By contributing, you agree that the author, Elias Papavasileiou,
obtains and continues to retain all the rights of this project, as described in
[LICENSE](https://github.com/elias-pap/youtube-share-clip/blob/main/LICENSE) file.

### Setup

Get the source code and switch to the project directory:

```
git clone https://github.com/elias-pap/youtube-share-clip.git
cd youtube-share-clip
```

Install the development dependencies:

```
npm run deps:install
```

### Workflow

Start the bundler in watch mode:

```
npm run bundle:dev
```

Open Google Chrome and load the generated `build` folder by following [these instructions](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked).

Visit or refresh any YouTube page. You will see Youtube Share Clip running as an extension.

Code changes are automatically reflected in the bundle thanks to watch mode. For the code changes to take effect, you need to [reload the extension](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#reload) and refresh the page.
