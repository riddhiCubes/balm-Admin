import axios from "axios";
import { ADD_ABOUT_US, ADD_CATEGORY, ADD_MUSIC, ADD_PREMIUM_FEATURES, ADD_SUB_CATEGORY, ADD_THEMES, CHANGE_PASSWORD, DEFAUILT_THEME, DELETE_CATEGORY, DELETE_MUSIC, DELETE_PREMIUM_FEATURES, DELETE_SUB_CATEGORY, DELETE_THEMES, EDIT_CATEGORY, EDIT_MUSIC, EDIT_PREMIUM_FEATURES, EDIT_SUB_CATEGORY, EDIT_THEMES, GET_ABOUT_US, GET_CATEGORY, GET_DASHBAORD, GET_MAIN_CATEGORY, GET_MUSIC, GET_PREMIUM_FEATURES, GET_SUB_CATEGORY, GET_SUBCATEGORY_LIST, GET_THEMES, GET_USER, GET_USER_BLOCK, GET_USER_DETAILS, GET_USER_LIST, LOGIN_API, LOGOUT_API, PREMIUM_USERS, SEND_ANNOUNCEMENT, SEND_SCHEDULE_NOTIFICATION, SUBSCRIBERS_DATA, USER_BLOCK_UNBLOCK, USER_DELETE } from "./Api";
import type { AxiosProgressEvent } from "axios";

axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("Balm_token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.clear();

            // Redirect to login page
            window.location.href = "/admin/sign-in";
        }
        return Promise.reject(error);
    }
);

const header = {
    "Content-Type": "application/json",
};

const mutipartHeader = {
    "content-type": "multipart/form-data",
};

export const loginApi = (data: any) => {
    return axios.post(LOGIN_API, data, {
        headers: header
    });
};

export const changepasswordApi = (data: any) => {
    return axios.put(CHANGE_PASSWORD, data, {
        headers: header
    });
};

export const logoutApi = (data: any) => {
    return axios.put(LOGOUT_API, data, {
        headers: header
    });
};

export const getdashbaord = () => {
    return axios.get(GET_DASHBAORD);
};

export const getuserlist = (data: any) => {
    return axios.get(GET_USER, {
        params: data
    });
};

export const getuserdetails = (data: any) => {
    return axios.get(GET_USER_DETAILS, {
        params: data
    });
};

export const userblockunblock = (data: any) => {
    return axios.put(USER_BLOCK_UNBLOCK, data, {
        headers: header
    });
};

export const userdelete = (data: any) => {
    return axios.delete(USER_DELETE, {
        params: data
    });
};

export const getcategory = (data: any) => {
    return axios.get(GET_CATEGORY, {
        params: data
    });
};

export const addcategory = (data: any) => {
    return axios.post(ADD_CATEGORY, data, {
        headers: mutipartHeader
    });
};

export const editcategory = (data: any) => {
    return axios.put(EDIT_CATEGORY, data, {
        headers: mutipartHeader
    });
};

export const deletecategory = (data: any) => {
    return axios.delete(DELETE_CATEGORY, {
        params: data
    });
};

export const getmaincategory = () => {
    return axios.get(GET_MAIN_CATEGORY);
};

export const getsubcategory = (data: any) => {
    return axios.get(GET_SUB_CATEGORY, {
        params: data
    });
};

export const addsubcategory = (data: any) => {
    return axios.post(ADD_SUB_CATEGORY, data, {
        headers: header
    });
};

export const editsubcategory = (data: any) => {
    return axios.put(EDIT_SUB_CATEGORY, data, {
        headers: header
    });
};

export const deletesubcategory = (data: any) => {
    return axios.delete(DELETE_SUB_CATEGORY, {
        params: data
    });
};

export const getthemeData = (data: any) => {
    return axios.get(GET_THEMES, {
        params: data
    });
};

export const defaultsettheme = (data: any) => {
    return axios.put(DEFAUILT_THEME, data, {
        headers: header
    });
};

export const addthemes = (data: any) => {
    return axios.post(ADD_THEMES, data, {
        headers: mutipartHeader
    });
};

export const edittheme = (data: any) => {
    return axios.put(EDIT_THEMES, data, {
        headers: mutipartHeader
    });
};

export const deletetheme = (data: any) => {
    return axios.delete(DELETE_THEMES, {
        params: data
    });
};

export const getmusiclist = (data: any) => {
    return axios.get(GET_MUSIC, {
        params: data
    });
};

export const getsubcategorylist = () => {
    return axios.get(GET_SUBCATEGORY_LIST);
};

// export const addmusic = (data: any) => {
//     return axios.post(ADD_MUSIC, data, {
//         headers: mutipartHeader
//     });
// };



export const addmusic = (body: any, onUploadProgress?: (progressEvent: AxiosProgressEvent) => void) => {
    return axios.post(ADD_MUSIC, body, {
        onUploadProgress,
        headers: mutipartHeader
    });
};

export const editmusic = (body: any, onUploadProgress?: (progressEvent: AxiosProgressEvent) => void) => {
    return axios.put(EDIT_MUSIC, body, {
        onUploadProgress,
        headers: mutipartHeader
    });
};


// export const editmusic = (data: any) => {
//     return axios.put(EDIT_MUSIC, data, {
//         headers: mutipartHeader
//     });
// };

export const deletemusic = (data: any) => {
    return axios.delete(DELETE_MUSIC, {
        params: data
    });
};

export const getuserblocklist = (data: any) => {
    return axios.get(GET_USER_BLOCK, {
        params: data
    });
};

export const getpremiumuserlist = (data: any) => {
    return axios.get(PREMIUM_USERS, {
        params: data
    });
};

export const getpremiumfeatures = () => {
    return axios.get(GET_PREMIUM_FEATURES);
};

export const addpremiumfeatures = (data: any) => {
    return axios.post(ADD_PREMIUM_FEATURES, data, {
        headers: header
    });
};

export const editpremiumfeatures = (data: any) => {
    return axios.put(EDIT_PREMIUM_FEATURES, data, {
        headers: header
    });
};

export const deletepremiumfeatures = (data: any) => {
    return axios.delete(DELETE_PREMIUM_FEATURES, {
        params: data,
    });
};

export const getuserdata = () => {
    return axios.get(GET_USER_LIST);
};

export const sendannouncement = (data: any) => {
    return axios.post(SEND_ANNOUNCEMENT, data, {
        headers: header
    });
};

export const sendschedulenotification = (data: any) => {
    return axios.post(SEND_SCHEDULE_NOTIFICATION, data, {
        headers: header
    });
};

export const getaboutus = () => {
    return axios.get(GET_ABOUT_US, {
        headers: header
    });
};

export const addaboutus = (data: any) => {
    return axios.post(ADD_ABOUT_US, data, {
        headers: header
    });
};

export const getsubscriberslist = (data: any) => {
    return axios.get(SUBSCRIBERS_DATA, {
        params: data
    });
};