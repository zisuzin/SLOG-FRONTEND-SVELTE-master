import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/ko";

// 시간 처리 함수
function dateView(date) {
    dayjs.extend(utc);
    dayjs.locale('ko');
    dayjs.extend(relativeTime);

    return dayjs().to(dayjs(date).utc().format('YYYY-MM-DD HH:mm:ss'));
}

export default dateView;