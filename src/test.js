const puppeteer = require("puppeteer");

(async () => {
  let data = {};
  // headless 브라우저 실행
  const browser = await puppeteer.launch({ headless: false, slowMo: 30 });
  // 새로운 페이지 열기
  const page = await browser.newPage();
  await page.goto("https://place.map.kakao.com/");

  // 대기 후에 검색 입력 필드와 버튼을 찾음
  await page.waitForSelector(".box_searchbar");
  await page.waitForSelector(".btn_search");

  // 찾은 요소에 값을 입력하고 Enter 키를 누름
  await page.type(".box_searchbar", "자양동 산책로");
  await page.keyboard.press("Enter");

  // 대기 후에 검색 결과가 나타날 때까지 대기
  await page.waitForSelector(".placelist");

  // 장소 더보기 클릭 이벤트
  const click = await page.$("div.section.places a.more.HIDDEN");
  if (click == null) {
    await page.click("div.section.places a.more");
    await page.click("div.section.places a.more");
  }

  // 장소 총 갯수
  let totalEh = await page.$("div.section.places");
  let total = await totalEh.$eval(".sectiontitle .cnt", (el) => {
    return el.textContent;
  });

  // 페이지 변경 양 체크
  let listData = [];
  if (Number(total) > 15) {
    while (true) {
      for (let i = 2; i < 7; i++) {
        const pageSelector = `.keywordSearch .pages .pageWrap a:nth-child(${i})`;
        const pageSelectorHidden = await page.$(
          `.keywordSearch .pages .pageWrap a.HIDDEN:nth-child(${i})`
        );
        if (pageSelectorHidden != null) continue;
        await page.click(pageSelector);
        // await page.waitForNavigation(); // 클릭 후 충분한 시간을 기다림
        // 여기에 리스트 담는거 추가
        const resultList = await page.$$eval(
          ".placelist .PlaceItem",
          (elements) => {
            return elements.map((element) => {
              const titleElement = element.querySelector(
                ".tit_name .link_name"
              );
              const subTitleElement = element.querySelector(".subcategory");
              const addressElement = element.querySelector(
                ".info_item .addr .address"
              );
              const otherAddressElement = element.querySelector(
                ".info_item .addr .otherAddr"
              );
              const linkElement = element.querySelector(".info_item .moreview");
              const scoreNumElement = element.querySelector(".rating .num");
              const scoreTxtElement = element.querySelector(
                ".rating .numberofscore"
              );
              const scoreReviewElement =
                element.querySelector(".rating .review em");

              // titleElement 또는 addressElement가 null이면 해당 값을 빈 문자열로 설정
              const title = titleElement ? titleElement.textContent.trim() : "";
              const subTitle = subTitleElement
                ? subTitleElement.textContent.trim()
                : "";
              const address = addressElement
                ? addressElement.textContent.trim()
                : "";
              const otherAddress = otherAddressElement
                ? otherAddressElement.textContent.trim()
                : "";
              const link = linkElement ? linkElement.href : "";
              const scoreNum = scoreNumElement
                ? scoreNumElement.textContent.trim()
                : "";
              const scoreTxt = scoreTxtElement
                ? scoreTxtElement.textContent.trim()
                : "";
              const scoreReview = scoreReviewElement
                ? scoreReviewElement.textContent.trim()
                : "";

              return {
                title,
                subTitle,
                address,
                otherAddress,
                link,
                scoreNum,
                scoreTxt,
                scoreReview,
              };
            });
          }
        );
        listData.push(...resultList);
        // await page.waitForTimeout(1000); // 클릭 후 충분한 시간을 기다림
      }

      const next = await page.$(
        ".keywordSearch .pages .pageWrap .next.disabled"
      );
      if (next !== null) break;

      await page.click(".keywordSearch .pages .pageWrap .next");
      // await page.waitForTimeout(1000); // 클릭 후 충분한 시간을 기다림
    }
  } else {
    const resultList = await page.$$eval(
      ".placelist .PlaceItem",
      (elements) => {
        return elements.map((element) => {
          const titleElement = element.querySelector(".tit_name .link_name");
          const subTitleElement = element.querySelector(".subcategory");
          const addressElement = element.querySelector(
            ".info_item .addr .address"
          );
          const otherAddressElement = element.querySelector(
            ".info_item .addr .otherAddr"
          );
          const linkElement = element.querySelector(".info_item .moreview");
          const scoreNumElement = element.querySelector(".rating .num");
          const scoreTxtElement = element.querySelector(
            ".rating .numberofscore"
          );
          const scoreReviewElement =
            element.querySelector(".rating .review em");

          // titleElement 또는 addressElement가 null이면 해당 값을 빈 문자열로 설정
          const title = titleElement ? titleElement.textContent.trim() : "";
          const subTitle = subTitleElement
            ? subTitleElement.textContent.trim()
            : "";
          const address = addressElement
            ? addressElement.textContent.trim()
            : "";
          const otherAddress = otherAddressElement
            ? otherAddressElement.textContent.trim()
            : "";
          const link = linkElement ? linkElement.href : "";
          const scoreNum = scoreNumElement
            ? scoreNumElement.textContent.trim()
            : "";
          const scoreTxt = scoreTxtElement
            ? scoreTxtElement.textContent.trim()
            : "";
          const scoreReview = scoreReviewElement
            ? scoreReviewElement.textContent.trim()
            : "";

          return {
            title,
            subTitle,
            address,
            otherAddress,
            link,
            scoreNum,
            scoreTxt,
            scoreReview,
          };
        });
      }
    );
    listData.push(...resultList);
  }

  data.title = "부산 산책로";
  data.total = await total;
  data.list = await listData;

  console.log("resultList: ", data);

  // await browser.close();
})();
