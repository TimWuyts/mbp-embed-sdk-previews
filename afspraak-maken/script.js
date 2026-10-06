import { createMbpEmbedClient } from 'https://esm.sh/@govflanders/mbp-embed-sdk';

const doc = document.documentElement;
const cancelEl = document.querySelector('#cancel');

const formEl = document.querySelector('form');
const reasonEl = document.querySelector('#reason');
const locationEl = document.querySelector('#location');
const addressEl = document.querySelector('#address');
const dateEl = document.querySelector('#date');
const timeEl = document.querySelector('#time');
const firstNameEl = document.querySelector('#firstName');
const lastNameEl = document.querySelector('#lastName');

const client = createMbpEmbedClient('03a082cd-0249-43fd-8197-37ba56770f4d', {
  allowedHosts: [
    'http://localhost:*',
    'http://127.0.0.1:*',
    'https://admin.test-vlaanderen.be',
    'https://admin.beta-vlaanderen.be',
    'https://admin.tni-vlaanderen.be',
    'https://admin.vlaanderen.be',
  ],
});

(async function run() {
  try {
    await client.connect();
    await client.ui.setTitle('Afspraak maken');
    await client.ui.setDescription(
      'Deze embed demonstreert het gebruik van mbp-embed-sdk om een afspraak te maken',
    );

    const [tenant, ipdc] = await Promise.all([
      client.context.getTenant(),
      client.context.getIpdcProduct(),
    ]);
    if (tenant?.branding?.actionColor) {
      doc.style.setProperty('--c-action', tenant.branding.actionColor);
    }
    if (tenant?.branding?.primaryColor) {
      doc.style.setProperty('--c-primary', tenant.branding.primaryColor);
    }
    if (ipdc?.title) {
      reasonEl.value = ipdc.title;
    }
    // Wait 1 second to demonstrate loading state
    // await new Promise(resolve => setTimeout(resolve, 1000));
    client.ui.setStatusLoading(false);
    await client.appointment.start();
  } catch (e) {
    await client.ui.setStatusError({
      title: 'Fout in demo webview',
      message: e.message,
    });
  }
})();

formEl.addEventListener('submit', async (e) => {
  e.preventDefault();
  const startTimestamp = Date.parse(
    `${dateEl.value} ${timeEl.value || '10:00'}`,
  );
  await client.appointment.create({
    id: 'demo',
    products: [{ title: reasonEl.value }],
    location: {
      name: locationEl.value,
      address: addressEl.value,
    },
    startDate: new Date(startTimestamp),
    endDate: new Date(startTimestamp + 1000 * 60 * 30),
    additionalData: {
      'Persoonlijke gegevens': [firstNameEl.value, lastNameEl.value],
    },
  });
});
cancelEl.addEventListener('click', async (e) => {
  e.preventDefault();
  await client.appointment.cancel();
});
