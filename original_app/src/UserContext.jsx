// src/UserContext.jsx
import React, { createContext, useState } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // ログイン機能（サーバーAPIと通信してトークンを取得など）
  const login = async (username, password) => {
    // ここでAPIを叩いて認証OKなら user state をセット
    if (username && password) {
      setUser({ username });
    } else {
      throw new Error("ログインエラー");
    }
  };

  const signUp = async (username, password) => {
    // サーバーにユーザー作成リクエスト → 成功したら user をセット
    setUser({ username });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, signUp, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};