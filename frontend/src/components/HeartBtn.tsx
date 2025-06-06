import React, { useContext, useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useAuthCheck from "../hooks/useAuthCheck";
import { useMutation } from "@tanstack/react-query";
import UserDetailContext from "../context/UserDetailContext";
import { toFav } from "../utils/api";
import { checkFavourites, updateFavourites } from "../utils/common";

const HeartBtn = ({ id }) => {
  const [heartColor, setHeartColor] = useState("white");
  const { validateLogin } = useAuthCheck();

  const {
    userDetails: { favourites, token },
    setUserDetails,
  } = useContext(UserDetailContext);

  useEffect(() => {
    setHeartColor(() => checkFavourites(id, favourites));
  }, [favourites]);

  const { mutate } = useMutation({
    mutationFn: () => toFav(id, user?.email, token),
    onSuccess: () => {
      setUserDetails((prev) => ({
        ...prev,
        favourites: updateFavourites(id, prev.favourites),
      }));
    },
  });

  const handleLike = () => {
    if (validateLogin()) {
      mutate();
      setHeartColor((prev) => (prev === "#8ac243" ? "white" : "#8ac243"));
    }
  };

  return (
    <TouchableOpacity onPress={handleLike}>
      <MaterialCommunityIcons name="heart" color={heartColor} size={23} />
    </TouchableOpacity>
  );
};

export default HeartBtn;
