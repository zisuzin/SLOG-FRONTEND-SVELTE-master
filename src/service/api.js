import axios from "axios";

// 실제 api 호출할 부분
const send = async ({ method = "", path = "", data = {}, access_token = "" } = {}) => {
    // 공통 주소
    const commonUrl = "http://127.0.0.1:3000";
    // api 전달 주소
    const url = commonUrl + path;

    // 백엔드 서버와 통신하는데 필요한 기본 정보들
    const headers = {
        "Access-Control-Allow-Origin": commonUrl,
        "Access-Control-Allow-Credentials": true,
        "content-type": "application/json;charset=UTF-8",
        accept: "application/json,",
        SameSite: "None",
        Authorization: access_token,
    };

    const options = {
        method,
        url,
        headers,
        data,
        withCredentials: true,
    };

    try {
        const response = await axios(options);
        return response.data;
    }
    catch (error) {
        throw error;
    }
};

const getApi = ({ path = "", access_token = "" } = {}) => {
    return send({ method: "GET", path, access_token });
};

const putApi = ({ path = "", data = {}, access_token = "" } = {}) => {
    return send({ method: "PUT", path, data, access_token });
};

const postApi = ({ path = "", data = {}, access_token = "" } = {}) => {
    return send({ method: "POST", path, data, access_token });
};

const delApi = ({ path = "", data = {}, access_token = "" } = {}) => {
    return send({ method: "DELETE", path, data, access_token });
};

export { getApi, putApi, postApi, delApi };
