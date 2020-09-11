export default async function (ctx, inject) {
  const icons = {"64x64":"/_nuxt/icons/icon_64.710f3a.png","120x120":"/_nuxt/icons/icon_120.710f3a.png","144x144":"/_nuxt/icons/icon_144.710f3a.png","152x152":"/_nuxt/icons/icon_152.710f3a.png","192x192":"/_nuxt/icons/icon_192.710f3a.png","384x384":"/_nuxt/icons/icon_384.710f3a.png","512x512":"/_nuxt/icons/icon_512.710f3a.png"}
  const getIcon = size => icons[size + 'x' + size] || ''
  inject('icon', getIcon)
}
