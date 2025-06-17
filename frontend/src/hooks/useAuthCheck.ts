import { toast } from "react-toastify";

const useAuthCheck = () => {
  const validateLogin = (): boolean => {
    // Replace this with your actual auth check
    // For now, always return true
    return true;
  };
  return { validateLogin };
};

export default useAuthCheck;
