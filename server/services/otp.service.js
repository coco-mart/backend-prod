import Axios from "axios";
import config from "../../config/config";
import APIError from "../helpers/APIError";

const sendotp = (mobile) => {
    return Axios.get(
        `https://2factor.in/API/V1/${config.smsApi}/SMS/${mobile}/AUTOGEN`
    );
};

const verify = (otp_id, otp_code) => {
    return Axios.post(
        `https://2factor.in/API/V1/${config.smsApi}/SMS/VERIFY/${otp_id}/${otp_code}`
    );
};

export default { sendotp, verify };
