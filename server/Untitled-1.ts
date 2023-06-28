const PLAN_STRIPE_INFO: Record<string, { productId: string; priceIds: { annual: string; monthly: string } }> = {
  "premium-ind": {
    productId: "prod_O80cGpmF3Kpwpg",
    priceIds: {
      annual: "price_1NLkf5SEFaIziORTHIaUK3I0",
      monthly: "price_1NLkbHSEFaIziORTzS4ZHb8C",
    },
  },
  "premium-plus-ind": {
    productId: "prod_O80mSObHyTQI5G",
    priceIds: {
      annual: "price_1NLkkVSEFaIziORTqGDSvOKA",
      monthly: "price_1NLkkVSEFaIziORT1AcvSphQ",
    },
  },
  "elite-ind": {
    productId: "prod_O80pRfBmu1Y6wz",
    priceIds: {
      annual: "price_1NLko2SEFaIziORTNRfJ0EMO",
      monthly: "price_1NLko2SEFaIziORTgVjse6Tj",
    },
  },
};
