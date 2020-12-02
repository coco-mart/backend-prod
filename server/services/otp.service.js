import Axios from "axios";
import config from "../../config/config";
import APIError from "../helpers/APIError";

const BASE_URL = "https://d7networks.com/api/verifier/";
const SMS = "{code} is the OTP for Cocomart login";
const axiosConfig = {
    headers: {
        Authorization: `Token ${config.d7Api}`,
    },
};

const sendotp = (mobile) => {
    return Axios.post(
        `${BASE_URL + "send"}`,
        {
            mobile: "91" + mobile,
            message: SMS,
            expiry: config.OTP_EXPIRY,
        },
        axiosConfig
    );
};

const verify = (mobile, otp_id, otp_code) => {
    return Axios.post(
        `${BASE_URL + "verify"}`,
        {
            mobile: "91" + mobile,
            otp_id,
            otp_code,
        },
        axiosConfig
    );
};

export default { sendotp, verify };
