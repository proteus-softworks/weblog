/******************************************************************************
 * Import
 ******************************************************************************/
import Axios from "axios";
import { setupCache } from "axios-cache-interceptor";

/******************************************************************************
 * Axios Config
 ******************************************************************************/

const instance = Axios.create({
  baseURL: "https://www.strava.com/api/v3",
});

const axios = setupCache(instance, {
  enabled: true,
  methods: ["get", "post", "head"],
  // Ignore all headers :)
  headerInterpreter: () => "not enough headers",
});

/******************************************************************************
 * Public Functions
 ******************************************************************************/

export const StravaGateway = {
  async getStats() {
    const accessToken = await getAccessToken();

    const response = await axios.get("/athletes/6765104/stats", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  },
};

/******************************************************************************
 * Private Functions
 ******************************************************************************/

async function getAccessToken() {
  const response = await axios.post(
    "oauth/token",
    {},
    {
      headers: { "Content-Type": "application/json" },
      params: {
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        refresh_token: process.env.STRAVA_REFRESH_TOKEN,
        grant_type: "refresh_token",
      },
      cache: {
        ttl: 1000 * 60, // 1 minute.
      },
    },
  );

  return response.data.access_token;
}
