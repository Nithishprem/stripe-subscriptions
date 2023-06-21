import { Link, useNavigate } from "react-router-dom";
import { useUser, useUserDispatch } from "../Userprovider";

function Navbar() {
  const user = useUser();
  const dispatch = useUserDispatch();
  const navigate = useNavigate();

  const handleClearUser = () => {
    dispatch({
      type: "removed",
      payload: null,
    });
    navigate("/");
  };

  return (
    <div className="w-full flex justify-between items-center gap-4 p-4 bg-[#f2f2f2]">
      <div className="">Stripe Subcriptions</div>
      {user ? (
        <div>
          <p>{user?.name}</p>
          <p>{user?.id}</p>
          <p>{user?.emailId}</p>
          <button onClick={handleClearUser} className="bg-[#757575] bg-opacity-25 p-1 rounded-sm">
            {" "}
            Logout
          </button>
        </div>
      ) : (
        <Link to={"/"} className="bg-[#757575] bg-opacity-25 p-1 rounded-sm">
          Login
        </Link>
      )}
    </div>
  );
}

export default Navbar;
