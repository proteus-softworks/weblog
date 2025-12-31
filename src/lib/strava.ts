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
 * Gateway
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
  async getYtdMiles() {
    const stats = await StravaGateway.getStats();
    return Math.round(stats.ytd_ride_totals.distance / 1609.34);
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
    },
  );

  return response.data.access_token;
}
