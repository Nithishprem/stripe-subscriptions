import React, { useState } from "react";
import axios from "axios";
import { API_DOMAIN } from "../constants";
import { useUserDispatch } from "../Userprovider";
import { useNavigate } from "react-router-dom";
function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const dispatch = useUserDispatch();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email || !name) return;
    try {
      const res = await axios.post(API_DOMAIN + "/create-customer", { name, email });
      const user = res.data;

      dispatch({
        type: "added",
        user: {
          name: user?.name,
          email: user?.email,
          id: user?.id,
        },
      });
      navigate("plans");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full flex justify-center items-center mt-10">
      <div className="w-[500px] flex flex-col gap-4 bg-[#f2f2f2] p-6 rounded-4">
        <h2>Register form</h2>
        <div className="flex flex-col">
          <label htmlFor="name">Name</label>
          <input type="text" id="name" className="p-2" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="flex flex-col">
          <label htmlFor="name">Email</label>
          <input type="text" id="email" className="p-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full flex items-center p-2 rounded justify-center bg-[#256efd] bg-opacity-10 hover:bg-opacity-20"
        >
          submit
        </button>
      </div>
    </div>
  );
}

export default Register;
