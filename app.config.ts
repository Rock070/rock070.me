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
    layout: {
      fluid: true,
    },
    aside: {
      level: 1,
      filter: [],
    },
    header: {
      showLinkIcon: false,
      logo: 'Logo',
      // fluid: true,
      // showLinkIcon: false,
      exclude: ['/posts'],
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
          icon: '123',
          label: 'NuxtJS',
          href: 'https://nuxtjs.org',
          component: 'IconNuxtLabs',
        },
        {
          icon: '123',
          label: 'Vue Telescope',
          href: 'https://vuetelescope.com',
          component: 'IconVueTelescope',
        },
      ],
    },
  },
})
