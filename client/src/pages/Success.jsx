import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { API_DOMAIN } from "../constants";
import axios from "axios";
import { useUserDispatch } from "../Userprovider";

function Success() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const navigate = useNavigate();
  const [sessionRes, setSessionRes] = useState(null);

  const dispatch = useUserDispatch();

  const getSessionDetails = async () => {
    try {
      const res = await axios.get(API_DOMAIN + "/checkout-session", {
        params: {
          sessionId,
        },
      });
      console.log("customer", res?.data);
      dispatch({
        type: "added",
        user: res?.data?.customer,
      });
      setSessionRes(res?.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (sessionId) {
      getSessionDetails();
    }
  }, []);
  return (
    <div className="max-w-[100vw] mt-6 flex flex-col items-center">
      <p>Session response</p>
      <div className="max-w-full mt-6 px-4">{JSON.stringify(sessionRes)}</div>

      <div className="mt-6">
        <Link to={"/plans"} className="bg-[#f2f2f2] p-1 rounded ">
          Navigate to plans page
        </Link>
      </div>
    </div>
  );
}

export default Success;
