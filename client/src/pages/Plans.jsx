import axios from "axios";
import React, { useEffect, useState } from "react";
import { API_DOMAIN } from "../constants";
import { useUser } from "../Userprovider";

function Plans() {
  const [plans, setPlans] = useState([]);
  const [existingSubscription, setExistingSubscription] = useState(null);
  const user = useUser();

  const getPlans = async () => {
    try {
      const res = await axios.get(API_DOMAIN + "/plans");
      console.log("data", res?.data);
      setPlans(res?.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getexistingSubscription = async () => {
    try {
      const res = await axios.get(API_DOMAIN + "/customer-subscription", {
        params: {
          id: user?.id,
        },
      });

      console.log("subscription ", res?.data?.data);

      setExistingSubscription(res?.data?.data[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubscribe = async (id) => {
    try {
      const res = await axios.post(API_DOMAIN + "/create-checkout-session", { priceId: id, customerId: user?.id });
      console.log(res);
      window.open(res?.data?.checkoutUrl, "_blank");
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdate = async (id) => {
    try {
      const res = await axios.post(API_DOMAIN + "/update-subscription", {
        priceId: id,
        subscriptionId: existingSubscription?.id,
      });
      console.log("update res", res?.data?.subscription);
      setExistingSubscription(res?.data?.subscription);

      window.open(res?.data?.subscription?.latest_invoice?.hosted_invoice_url, "_blank");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getPlans();
    getexistingSubscription();
  }, []);

  return (
    <div className="mt-12">
      <div className="">
        <p>Existing subscription</p>
        <p>{existingSubscription?.plan?.metadata?.name}</p>
        <p>{existingSubscription?.plan?.amount / 100}</p>
      </div>
      <div className="w-full mt-6 px-10 flex justify-center items-center gap-5 flex-wrap">
        {plans?.map((price, i) => {
          return (
            <div key={i} className="flex flex-col gap-4 items-center p-4 rounded bg-[#f2f2f2]">
              <p className="text-lg font-medium">{price?.metadata?.name}</p>
              <p>{price?.unit_amount / 100}</p>
              <button
                onClick={() => {
                  if (existingSubscription?.id) {
                    handleUpdate(price?.id);
                  } else {
                    handleSubscribe(price?.id);
                  }
                }}
                className="p-1 rounded-sm bg-[#757575] bg-opacity-40"
              >
                Subscribe
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Plans;
