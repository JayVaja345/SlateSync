import { commonrequest } from "./ApiCall";
import { BASE_URL } from "./helper";

// 🔐 User Authentication
export const registerfunc = async (data) => {
  return await commonrequest("POST", `${BASE_URL}/user/register`, data);
};

export const loginfunc = async (data) => {
  return await commonrequest("POST", `${BASE_URL}/user/login`, data);
};

export const userprofile = async () => {
  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  return await commonrequest("GET", `${BASE_URL}/user/profile`, null, headers);
};

// 📄 Document Operations
export const createDoc = async (data, header) => {
  return await commonrequest(
    "POST",
    `${BASE_URL}/document/create`,
    data,
    header
  );
};

export const getDoc = async (header) => {
  return await commonrequest("POST", `${BASE_URL}/document/get`, {}, header);
};

export const singleDoc = async (id, header) => {
  return await commonrequest("GET", `${BASE_URL}/document/${id}`, {}, header);
};

export const updateDoc = async (header, data, id) => {
  return await commonrequest(
    "PUT",
    `${BASE_URL}/document/update/${id}`,
    data,
    header
  );
};

// 🤝 Sharing / Collaboration
export const shareDocument = async (id, data, header) => {
  return await commonrequest(
    "POST",
    `${BASE_URL}/document/${id}/share`,
    data,
    header
  );
};

// 📄 Fetch all documents user has access to
export const fetchDocument = async (header) => {
  return await commonrequest("GET", `${BASE_URL}/document/shared`, {}, header);
};
