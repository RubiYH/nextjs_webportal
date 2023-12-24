import { AxiosResponse } from "./../../../node_modules/axios/index.d";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { engine, query } = req.query;

  switch (engine) {
    default:
    case "google":
      await fetch(
        `https://customsearch.googleapis.com/customsearch/v1?key=${process.env.NEXT_PUBLIC_GOOGLE_CUSTOM_SEARCH_API_KEY}&cx=${process.env.NEXT_PUBLIC_ENGINE_ID}&q=${query}`
      ).then((response: Response) => {
        response.json().then((data) => {
          res.status(200).json({ data: data });
        });
      });
      break;

    case "naver":
      await axios
        .get(
          `
      https://openapi.naver.com/v1/search/blog.json?query=${encodeURI(
        String(query)
      )}&display=10&start=1`,
          {
            headers: {
              "X-Naver-Client-Id": process.env.NEXT_PUBLIC_NAVER_ID,
              "X-Naver-Client-Secret": process.env.NEXT_PUBLIC_NAVER_SECRET,
            },
          }
        )
        .then((response: AxiosResponse<any>) => {
          res.status(200).json({ data: response.data });
        });
      break;
  }
}
