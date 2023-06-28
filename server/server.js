const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");

const productIds = ["prod_O7HDjTNPJAo6wS", "prod_O7HBxBCfAR5JKu", "prod_O7GzutdCVMNWlE"];
const priceIds = [
  "price_1NLkf5SEFaIziORTHIaUK3I0",
  "price_1NLkbHSEFaIziORTzS4ZHb8C",
  "price_1NLkkVSEFaIziORTqGDSvOKA",
  "price_1NLkkVSEFaIziORT1AcvSphQ",
  "price_1NLko2SEFaIziORTNRfJ0EMO",
  "price_1NLko2SEFaIziORTgVjse6Tj",
];

// Copy the .env.example in the root into a .env file in this folder
const envFilePath = path.resolve(__dirname, "./.env");
const env = require("dotenv").config({ path: envFilePath });
if (env.error) {
  throw new Error(`Unable to load the .env file from ${envFilePath}. Please copy .env.example to ${envFilePath}`);
}
if (env.error) {
  throw new Error(`Unable to load the .env file from ${envFilePath}. Please copy .env.example to ${envFilePath}`);
}

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
  appInfo: {
    // For sample support and debugging, not required for production:
    name: "stripe-samples/checkout-single-subscription",
    version: "0.0.1",
    url: "https://github.com/stripe-samples/checkout-single-subscription",
  },
});

const whitelist = ["http://127.0.0.1:5173"];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

console.log("called");
app.use(cors(corsOptions));

app.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith("/webhook")) {
        req.rawBody = buf.toString();
      }
    },
  })
);

app.get("/", (req, res) => {
  res.json({ message: "hello" });
});

app.post("/create-customer", async (req, res) => {
  const { name, email } = req.body;

  const frozen_time = Math.floor(new Date().getTime() / 1000);

  console.log("frozen time", frozen_time);

  const testClock = await stripe.testHelpers.testClocks.create({
    frozen_time,
    name: "Annual renewal",
  });

  const customer = await stripe.customers.create({
    test_clock: testClock.id,
    name,
    email,
  });

  res.send(customer);
});

app.get("/plans", async (req, res) => {
  try {
    const prices = [];

    const price1 = await stripe.prices.retrieve(priceIds[0]);
    const price2 = await stripe.prices.retrieve(priceIds[1]);
    const price3 = await stripe.prices.retrieve(priceIds[2]);
    const price4 = await stripe.prices.retrieve(priceIds[3]);
    console.log(prices.push(price1, price2, price3, price4));

    // const prices = await stripe.prices.list({
    //   query: "metadata['planFor']:'upstar-test'",
    // });

    res.send(prices);
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});

app.get("/customer-subscription", async (req, res) => {
  try {
    const id = req.query?.id;
    console.log("customer", id);

    const subscription = await stripe.subscriptions.list({
      customer: id,
      // expand: ["data.customer"],
    });
    res.send(subscription);
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});

app.post("/create-checkout-session", async (req, res) => {
  const domainURL = process.env.DOMAIN;
  const { priceId, customerId } = req.body;
  console.log(req.body);

  // Create new Checkout Session for the order
  // Other optional params include:
  // [billing_address_collection] - to display billing address details on the page
  // [customer] - if you have an existing Stripe Customer ID
  // [customer_email] - lets you prefill the email input in the form
  // [automatic_tax] - to automatically calculate sales tax, VAT and GST in the checkout page
  // For full details see https://stripe.com/docs/api/checkout/sessions/create
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer: customerId,
      // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
      success_url: `${domainURL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domainURL}/canceled`,
      // automatic_tax: { enabled: true }
    });

    // return res.redirect(303, session.url);
    return res.send({ checkoutUrl: session.url });
  } catch (e) {
    res.status(400);
    return res.send({
      error: {
        message: e.message,
      },
    });
  }
});

// Fetch the Checkout Session to display the JSON result on the success page
app.get("/checkout-session", async (req, res) => {
  const { sessionId } = req.query;
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["customer"],
  });
  res.send(session);
});

app.post("/update-subscription", async (req, res) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(req.body.subscriptionId);
    const updatedSubscription = await stripe.subscriptions.update(req.body.subscriptionId, {
      payment_behavior: "pending_if_incomplete",
      // proration_behavior: "always_invoice",
      // proration_behavior: "none",
      // billing_cycle_anchor: "unchanged",
      items: [
        {
          id: subscription.items.data[0].id,
          price: req.body.priceId,
        },
      ],
      expand: ["latest_invoice"],
    });

    res.send({ subscription: updatedSubscription });
  } catch (error) {
    return res.status(400).send({ error: { message: error.message } });
  }
});

app.post("/schedule-subscription-update", async (req, res) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(req.body.subscriptionId);

    const priceId = req.body.priceId;

    console.log("####priceId######", priceId);

    const schedule = await stripe.subscriptionSchedules.create({
      // customer: subscription.customer.id,
      // start_date: subscription.current_period_end,
      from_subscription: subscription.id,
      // phases: [
      //   {
      //     items: [
      //       {
      //         price: priceId,
      //         quantity: 1,
      //       },
      //     ],
      //   },
      // ],
    });

    console.log("schedule", schedule);
    // console.log("priceId", subscription.plan.id);

    const updatedSchedule = await stripe.subscriptionSchedules.update(schedule.id, {
      phases: [
        {
          items: [
            {
              price: subscription.plan.id,
              quantity: 1,
            },
          ],
          start_date: subscription.current_period_start,
          end_date: subscription.current_period_end,
        },

        {
          items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          start_date: subscription.current_period_end,
          // end_date: subscription.current_period_end,
        },
      ],
    });

    console.log("updated schedule", updatedSchedule);

    return res.send({ updatedSchedule });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: { message: error.message } });
  }
});

app.listen(4242, () => console.log(`Node server listening at http://localhost:${4242}/`));

const Invokefunction = async () => {
  const subscriptionSchedules = await stripe.subscriptionSchedules.list({
    limit: 20,
  });

  console.log("all schedules", JSON.stringify(subscriptionSchedules));
};

// Invokefunction();
