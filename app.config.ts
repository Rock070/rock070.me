export default defineAppConfig({
  docus: {
    socials: {
      // twitter: '@docus_',
      // github: 'nuxtlabs/docus',
      twitter: 'https://twitter.com/Rock070000',
      github: 'https://github.com/Rock070',
      facebook: '',
      instagram: 'https://www.instagram.com/___maochi',
      youtube: '',
      medium: '',
    },
    layout: 'default',
    aside: {
      level: 1,
      filter: [],
    },
    header: {
      // title: false,
      // logo: true,
      // showLinkIcon: false,
      title: '',
      logo: 'Logo',
      // showLinkIcon: false,
      // exclude: ['/posts'],
    },
    footer: {
      credits: {
        icon: 'IconDocus',
        text: 'Powered by Docus',
        href: 'https://docus.dev',
      },
      textLinks: [],
      iconLinks: [
        {
          label: 'NuxtJS',
          href: 'https://nuxtjs.org',
          component: 'IconNuxtLabs',
        },
        {
          label: 'Vue Telescope',
          href: 'https://vuetelescope.com',
          component: 'IconVueTelescope',
        },
      ],
    },
  },
})
