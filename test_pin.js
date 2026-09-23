const url = 'https://pin.it/6Q0x7xQZk';
fetch(url, { redirect: 'follow' }).then(r => r.text()).then(html => {
  const title = html.match(/<title>([^<]+)<\/title>/i);
  console.log('title:', title ? title[1] : null);
  
  const matches = html.match(/.{0,50}a58fbce4aa3dbf753484e4b982b4abe0\.jpg.{0,50}/g);
  console.log('Real image context:', matches);
}).catch(console.error);
