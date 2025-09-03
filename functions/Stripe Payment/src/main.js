import { Client, Databases, ID } from 'node-appwrite';
import Stripe from 'stripe';

// Minimal service catalog to compute totals and booking link on the server
// Keep in sync with src/data/services.ts (only essentials used here)
const SERVICES = [
  {
    slug: 'power-of-attorney',
    name: 'Power of Attorney',
    priceCents: 3500,
    currency: 'eur',
    calComBookingLink: 'https://cal.com/marcus-whereby-xu25ac/remote-notarization-meeting-test'
  },
  {
    slug: 'certified-copy-document',
    name: 'Certified Copy of Document',
    priceCents: 2000,
    currency: 'eur',
    calComBookingLink: 'https://cal.com/marcus-whereby-xu25ac/certified-copy-of-document-meeting-test'
  },
  {
    slug: 'certified-copy-passport-id',
    name: 'Certified Copy of Passport/ID',
    priceCents: 2500,
    currency: 'eur',
    calComBookingLink: 'https://cal.com/marcus-whereby-xu25ac/remote-notarization-meeting-test'
  },
  {
    slug: 'company-formation-documents',
    name: 'Company Formation Documents',
    priceCents: 5000,
    currency: 'eur',
    calComBookingLink: 'https://cal.com/marcus-whereby-xu25ac/remote-notarization-meeting-test'
  },
  {
    slug: 'apostille-services',
    name: 'Apostille Services',
    priceCents: 8000,
    currency: 'eur',
    calComBookingLink: 'https://cal.com/marcus-whereby-xu25ac/remote-notarization-meeting-test'
  },
  {
    slug: 'document-translation-notarization',
    name: 'Document Translation & Notarization',
    priceCents: 6000,
    currency: 'eur',
    calComBookingLink: 'https://cal.com/marcus-whereby-xu25ac/remote-notarization-meeting-test'
  },
  {
    slug: 'real-estate-document-notarization',
    name: 'Real Estate Document Notarization',
    priceCents: 4500,
    currency: 'eur',
    calComBookingLink: 'https://cal.com/marcus-whereby-xu25ac/remote-notarization-meeting-test'
  },
  {
    slug: 'estate-planning-document-notarization',
    name: 'Estate Planning Document Notarization',
    priceCents: 5500,
    currency: 'eur',
    calComBookingLink: 'https://cal.com/marcus-whereby-xu25ac/remote-notarization-meeting-test'
  }
];

const findServiceBySlug = (slug) => SERVICES.find(s => s.slug === slug);

export default async ({ req, res, log, error }) => {
  log('Stripe Payment function: version 2025-09-03-1');
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    error('Missing STRIPE_SECRET_KEY env');
    return res.json({ error: 'Server misconfigured' }, 500);
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' });

  const appwriteClient = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');
  const databases = new Databases(appwriteClient);

  let body = {};
  try {
    const raw = typeof req.payload === 'string' && req.payload.length > 0
      ? req.payload
      : (typeof req.body === 'string' ? req.body : '');
    body = raw ? JSON.parse(raw) : {};
    log(`Parsed payload keys: ${Object.keys(body).join(', ') || 'none'}`);
  } catch (e) {
    log(`Payload parse error: ${e?.message || e}`);
    return res.json({ error: 'Invalid JSON body' }, 400);
  }

  // Health/test
  if (body.test) {
    log('Health check requested, responding ok:true');
    return res.json({ ok: true });
  }

  // Verify a session and persist order
  if (body.sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(body.sessionId, {
        expand: ['line_items']
      });

      const paid = session.payment_status === 'paid';
      const amount = session.amount_total ?? null;
      const currency = session.currency ?? 'eur';
      const customerEmail = session.customer_details?.email ?? null;
      const serviceSlug = session.metadata?.serviceSlug ?? null;
      const calLink = session.metadata?.calLink ?? null;

      if (paid) {
        // Persist in Appwrite DB (best done via webhooks in production)
        const databaseId = process.env.APPWRITE_DATABASE_ID;
        const collectionId = process.env.APPWRITE_COLLECTION_ID;
        if (databaseId && collectionId) {
          try {
            await databases.createDocument(
              databaseId,
              collectionId,
              ID.unique(),
              {
                sessionId: body.sessionId,
                amount,
                currency,
                customerEmail,
                serviceSlug,
                calLink,
                status: 'paid',
                createdAt: new Date().toISOString()
              }
            );
          } catch (dbErr) {
            error(`DB write failed: ${dbErr?.message || dbErr}`);
          }
        }
      }

      const verifyResponse = {
        paid,
        amount,
        currency,
        customer: { email: customerEmail, name: session.customer_details?.name ?? null },
        items: (session.line_items?.data || []).map(li => ({
          name: li.description,
          qty: li.quantity || 1,
          priceId: li.price?.id || ''
        })),
        calLink
      };
      log(`Verify response: paid=${paid}, amount=${amount}, currency=${currency}, calLink=${calLink || 'none'}`);
      return res.json(verifyResponse);
    } catch (e) {
      error(`Session verify error: ${e?.message || e}`);
      return res.json({ error: 'Failed to verify session' }, 500);
    }
  }

  // Create checkout session
  try {
    const { successUrl, failureUrl, items, idempotencyKey: clientIdempotencyKey } = body;
    if (!Array.isArray(items) || items.length === 0) {
      log('No items provided in payload');
      return res.json({ error: 'No items provided' }, 400);
    }

    // For now we support single main service item from the client payload
    const first = items[0];
    const serviceSlug = first?.serviceId;
    const optionKeys = Array.isArray(first?.optionKeys) ? first.optionKeys : [];
    const extraCopies = Number(first?.extraCopies || 0);
    const addOnIds = Array.isArray(first?.addOnIds) ? first.addOnIds : [];
    const service = findServiceBySlug(serviceSlug);
    if (!service) {
      log(`Unknown service slug received: ${serviceSlug}`);
      return res.json({ error: 'Unknown service' }, 400);
    }

    const calLink = service.calComBookingLink;

    // Build a stable idempotency key to prevent duplicate sessions on retries
    const idempotencyKey = clientIdempotencyKey || `ck_${serviceSlug}_${Math.floor(Date.now() / 30000)}`; // 30s window fallback

    // Build dynamic line items based on UI pricing to keep parity
    const lineItems = [];
    let subtotalCents = 0;

    // Selected service types from Service Selection
    // base → service.priceCents, signature → 4900, true-content → 3900
    const selectedServiceTypes = new Set(optionKeys);
    if (selectedServiceTypes.has('base')) {
      lineItems.push({
        price_data: {
          currency: service.currency,
          product_data: { name: service.name },
          unit_amount: service.priceCents
        },
        quantity: 1
      });
      subtotalCents += service.priceCents;
    }
    if (selectedServiceTypes.has('signature')) {
      lineItems.push({
        price_data: {
          currency: service.currency,
          product_data: { name: 'Signature Notarization' },
          unit_amount: 4900
        },
        quantity: 1
      });
      subtotalCents += 4900;
    }
    if (selectedServiceTypes.has('true-content')) {
      lineItems.push({
        price_data: {
          currency: service.currency,
          product_data: { name: 'True Content Verification' },
          unit_amount: 3900
        },
        quantity: 1
      });
      subtotalCents += 3900;
    }

    // Extra certified copies: €15.00 per copy
    if (extraCopies > 0) {
      const amount = 1500 * extraCopies;
      lineItems.push({
        price_data: {
          currency: service.currency,
          product_data: { name: `Extra Copies × ${extraCopies}` },
          unit_amount: amount
        },
        quantity: 1
      });
      subtotalCents += amount;
    }

    // Add-ons from AddOns page: courier 1500, apostille 8900, express 2500
    const addonPriceByKey = { courier: 1500, apostille: 8900, express: 2500 };
    for (const addKey of addOnIds) {
      const amount = addonPriceByKey[addKey] || 0;
      if (amount > 0) {
        lineItems.push({
          price_data: {
            currency: service.currency,
            product_data: { name: addKey === 'courier' ? 'Courier Delivery' : addKey === 'apostille' ? 'Apostille Service' : 'Express 24h Processing' },
            unit_amount: amount
          },
          quantity: 1
        });
        subtotalCents += amount;
      }
    }

    const vatCents = Math.round(subtotalCents * 0.21);
    lineItems.push({
      price_data: {
        currency: service.currency,
        product_data: { name: 'VAT (21%)' },
        unit_amount: vatCents
      },
      quantity: 1
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: successUrl || `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/post-checkout?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: failureUrl || `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/checkout`,
      metadata: {
        serviceSlug,
        calLink,
        subtotalCents: String(subtotalCents),
        vatCents: String(vatCents),
        totalCents: String(subtotalCents + vatCents),
        optionKeys: optionKeys.join(','),
        extraCopies: String(extraCopies)
      }
    }, { idempotencyKey });

    log(`Created Stripe session: ${session.id}, url: ${session.url}`);
    return res.json({ url: session.url });
  } catch (e) {
    error(`Checkout create error: ${e?.message || e}`);
    return res.json({ error: 'Failed to create checkout session' }, 500);
  }
};
