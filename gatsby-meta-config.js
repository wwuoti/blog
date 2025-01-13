/**
 * @typedef {Object} Links
 * @prop {string} github Your github repository
 */

/**
 * @typedef {Object} MetaConfig
 * @prop {string} title Your website title
 * @prop {string} description Your website description
 * @prop {string} author Maybe your name
 * @prop {string} siteUrl Your website URL
 * @prop {string} lang Your website Language
 * @prop {string} utterances Github repository to store comments
 * @prop {Links} links
 * @prop {string} favicon Favicon Path
 */

/** @type {MetaConfig} */
const metaConfig = {
  title: "Elias Wuoti",
  description: "Hi there. I'm Elias Wuoti. I Blog on DevOps, technology and music.",
  author: "Elias Wuoti",
  siteUrl: "https://wuoti.com",
  lang: "en",
  utterances: "wwuoti/wwuoti.github.io",
  links: {
    github: "https://github.com/wwuoti/",
    gitlab: "https://gitlab.com/wwuoti/",
  },
  favicon: "src/images/logo.svg",
}

// eslint-disable-next-line no-undef
module.exports = metaConfig;
