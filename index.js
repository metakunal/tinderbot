const puppeteer = require("puppeteer");
const cities = require("toppop-cities");

const { username, password } = require("./credentials");

const app = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    ignoreDefaultArgs: ["--enable-automation"]
  });
  const page = await browser.newPage();
  await page._client.send("Emulation.clearDeviceMetricsOverride");

  //For overriding popups, location/permissions
  const context = browser.defaultBrowserContext();
  await context.overridePermissions("https://tinder.com", [
    "geolocation",
    "notifications"
  ]);

  await page.goto("https://tinder.com");

  //Setting our geolocation
  //Change the location by changing the city nunber
  const currentCity = cities[6];
  await page.setGeolocation({
    latitude: currentCity.latitude,
    longitude: currentCity.longitude
  });

  await page.waitForXPath(
    `//*[@id="q-1095164872"]/div/div/div[1]/div/div[3]/span/div[2]/button`
  );
  const [fbButton] = await page.$x(
    `//*[@id="q-1095164872"]/div/div/div[1]/div/div[3]/span/div[2]/button`
  );

  const newPopup = new Promise(x => page.once("popup", x));

  fbButton.click();
  const popup = await newPopup;

  await popup.waitForSelector(`#email`);
  await popup.click(`#email`);
  await popup.keyboard.type(username);
  await popup.click(`#pass`);
  await popup.keyboard.type(password);

  //For pressing Login Button
  await popup.waitForSelector(`#loginbutton`);
  popup.click(`#loginbutton`);

  //Allowing all the popups, for location etc
  await page.waitForSelector(`[aria-Label="Allow"]`);
  await page.click(`[aria-Label="Allow"]`);
  await page.reload();

  //For swiping the profiles.
  await page.waitForXPath(
    `//*[@id="content"]/div/div[1]/div/main/div[1]/div/div/div[1]/div/div[1]/div[3]/div[1]/div/div/div/div`
  );
  console.log("You are logged in and swipe card is there");

  const returnRandomLikeDislike = () => {
    //Randomly Liking and Disliking the Profile
    const randomVal = Math.random() * 5;
    if (randomVal > 2) {
      return `[aria-label="Like"]`;
    } else {
      return `[aria-label="Nope"]`;
    }
  };

  const swipeTheCard = async () => {
    try {
      await page.waitForXPath(
        `//*[@id="content"]/div/div[1]/div/main/div[1]/div/div/div[1]/div/div[1]/div[3]/div[1]/div/div/div/div`
      );
      const randomTime = Math.floor(Math.random() * 2000) + 500;

      //Taking Screenshots
      await page.screenshot({ path: `${Math.random()}.png` });
      await page.click(returnRandomLikeDislike());
      setTimeout(swipeTheCard, randomTime);
    } catch (error) {
      console.log(error);
      browser.close();
    }
  };
  swipeTheCard();
};
app();