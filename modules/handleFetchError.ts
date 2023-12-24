import { AlertColor } from "@mui/material";

export interface ErrorStatus {
  status: AlertColor | null;
  message: string | null;
}

export const handleFetchError = (response: Response) => {
  const formatStatusMsg = (code: number) => {
    switch (code) {
      default:
        return `(${response?.status}) ${response?.statusText}.`;
      case 401:
      case 403:
        return `허가되지 않은 접근입니다.`;
      case 500:
        return "서버에 오류가 발생하였습니다.";
      case 502:
        return "Bad Gateway";
      case 400:
        return "잘못된 요청입니다.";
      case 404:
        return "존재하지 않는 요청입니다.";
      case 408:
        return "응답 시간 초과";
    }
  };

  return new Promise<ErrorStatus>((resolve, reject) => {
    if (response?.ok) resolve({ status: null, message: null });
    else
      resolve({
        status: "error",
        message: formatStatusMsg(response?.status),
      });
  });
};
