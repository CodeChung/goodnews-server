require('dotenv').config();
const express = require("express");
const fetch = require("node-fetch");
const { xss } = require('express-xss-sanitizer');
const promMid = require('express-prometheus-middleware');


const sentimentAnalysisService = require('./services/sentimentAnalysisService');
const newsService = require('./services/newsService');

const app = express();
const port = process.env.PORT || 3001;

app.use(promMid({
  metricsPath: '/metrics',
  collectDefaultMetrics: true,
  requestDurationBuckets: [0.1, 0.5, 1, 1.5],
  requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
  responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
}))
app.use(xss());

app.get('/', (req, res) => {
  res.send('Howdy')
})

app.get('/api/test', async (req, res) => {
  const dummy = {
    "command": "SELECT",
    "rowCount": 99,
    "oid": null,
    "rows": [
      {
        "title": "Michelle Troconis sentenced to more than 14 years for helping boyfriend murder his wife - NBC News",
        "url": "https://www.nbcnews.com/news/crime-courts/michelle-troconis-sentenced-jennifer-dulos-murder-rcna154868",
        "imageurl": "https://media-cldnry.s-nbcnews.com/image/upload/t_nbcnews-fp-1200-630,f_auto,q_auto:best/rockcms/2024-05/240531-michelle-troconis-mn-0940-ceb911.jpg",
        "score": -0.117647058823529
      },
      {
        "title": "Mike Tyson vs. Jake Paul Boxing Fight Postponed After Icon\"s Medical Emergency - Bleacher Report",
        "url": "https://bleacherreport.com/articles/10123206-mike-tyson-vs-jake-paul-boxing-fight-postponed-after-icons-medical-emergency",
        "imageurl": "https://media.bleacherreport.com/image/upload/c_fill,g_faces,w_3800,h_2000,q_95/v1717191902/hri7g23vkpgt1c72szkk.jpg",
        "score": -0.333333333333333
      },
      {
        "title": "UFC 302: Ceremonial Weigh-In - UFC",
        "url": "https://www.youtube.com/watch?v=99R0wnF0RK8",
        "imageurl": "",
        "score": 0
      },
      {
        "title": "Biden presents new Israel ceasefire plan, calls on Hamas to accept - Reuters",
        "url": "https://www.reuters.com/world/biden-speak-middle-east-friday-white-house-says-2024-05-31/",
        "imageurl": "",
        "score": 0.0769230769230769
      },
      {
        "title": "Florida deputy who fatally shot Airman Roger Fortson fired - The Associated Press",
        "url": "https://apnews.com/article/airman-shot-florida-deputy-roger-fortson-c616444086b39d20a80f35ba86ec531b",
        "imageurl": "https://dims.apnews.com/dims4/default/8de0545/2147483647/strip/true/crop/4000x2250+0+208/resize/1440x810!/quality/90/?url=https%3A%2F%2Fassets.apnews.com%2F54%2Fb2%2Ffee758aeb4a54ae6e67f789cc821%2Fa0aebab5a60f4a76a0a94b4d8ce223e0",
        "score": -0.384615384615385
      },
      {
        "title": "Idaho jury begins deliberations in sentencing of Chad Daybell, who faces possible death penalty for 3 murders - CNN",
        "url": "https://www.cnn.com/2024/05/31/us/chad-daybell-sentencing-death-penalty-decision/index.html",
        "imageurl": "https://media.cnn.com/api/v1/images/stellar/prod/ap24151751257867.jpg?c=16x9&q=w_800,c_fill",
        "score": -0.421052631578947
      },
      {
        "title": "Chobani Yogurt Founder Buys Anchor Brewing Company - The New York Times",
        "url": "https://families.google.com/service-restricted",
        "imageurl": "",
        "score": 0
      },
      {
        "title": "Women on Mediterranean diet live significantly longer: Study - The Hill",
        "url": "https://thehill.com/policy/healthcare/4697185-women-mediterranean-diet-live-longer/",
        "imageurl": "https://thehill.com/wp-content/uploads/sites/2/2022/12/CA_Mediterranean_diet-e1678805813173.jpg?w=1280",
        "score": 0.181818181818182
      },
      {
        "title": "Canadian serial killer Robert Pickton, who brought victims to pig farm, is dead after prison assault - The Associated Press",
        "url": "https://news.google.com/rss/articles/CBMiZmh0dHBzOi8vYXBuZXdzLmNvbS9hcnRpY2xlL3BpY2t0b24tZGVhZC1jYW5hZGEtc2VyaWFsLWtpbGxlci1waWctZmFybS1mMmYyYzM1NDVhYzBiZWEyM2EzOGNjNjkwY2YxYzc5NtIBAA?oc=5",
        "imageurl": "",
        "score": -0.5
      },
      {
        "title": "Borussia Dortmund \"don\"t care\" Real Madrid are UCL favourites - ESPN",
        "url": "https://www.espn.com/soccer/story/_/id/40251698/borussia-dortmund-real-madrid-champions-league-favourites",
        "imageurl": "https://a1.espncdn.com/combiner/i?img=%2Fphoto%2F2024%2F0531%2Fr1340042_1296x729_16%2D9.jpg",
        "score": 0.181818181818182
      },
      {
        "title": "Trump responds to guilty verdict by falsely blasting \"rigged trial\" - The Associated Press",
        "url": "https://apnews.com/article/trump-2024-campaign-trial-4629840240cb308c5eae335532ad17ed",
        "imageurl": "https://dims.apnews.com/dims4/default/77f3507/2147483647/strip/true/crop/3822x2150+0+199/resize/1440x810!/quality/90/?url=https%3A%2F%2Fassets.apnews.com%2Fcd%2Fcc%2F88c34c91b4ad29867721084cf285%2Fd0de36ef8bd046608f2526d24f2ebd65",
        "score": -0.428571428571429
      },
      {
        "title": "US leaders invite Israel\"s Netanyahu to deliver an address to Congress - The Associated Press",
        "url": "https://apnews.com/article/israel-netanyahu-war-gaza-congress-596b0adf6ed8f71ccaaecccec8b9d341",
        "imageurl": "https://dims.apnews.com/dims4/default/6fe3131/2147483647/strip/true/crop/3600x2025+0+188/resize/1440x810!/quality/90/?url=https%3A%2F%2Fassets.apnews.com%2Faa%2F7b%2F0864817be313387dee983d887f4d%2F8971f06369ca4701b06b3cd4bf3f6c18",
        "score": 0.2
      },
      {
        "title": "Boeing\"s Starliner ready for Saturday launch to space station, first flight with crew on board - CBS News",
        "url": "https://www.cbsnews.com/news/boeings-starliner-ready-launch-space-station-first-flight-crew-on-board/",
        "imageurl": "https://assets3.cbsnewsstatic.com/hub/i/r/2024/05/31/2fde4fdb-8a13-4204-891b-c8245bf94fc0/thumbnail/1200x630/301d2075a6aeb78a1f597d290ad3e252/rollout2-access-arm.jpg?v=d7bbca61a2ddd34e0cfc8fb46aec1df3",
        "score": 0.0555555555555556
      },
      {
        "title": "Jennifer Lopez Cancels Summer Tour - Variety",
        "url": "https://variety.com/2024/music/news/jennifer-lopez-cancels-tour-1236021391/",
        "imageurl": "https://variety.com/wp-content/uploads/2024/02/Jennifer-Lopez-Variety-Cover-Story-5-16x9-1.jpg?w=1000&h=563&crop=1",
        "score": -0.142857142857143
      },
      {
        "title": "U.S. to make millions of bird flu vaccine doses this summer, as cases grow - CBS News",
        "url": "https://www.cbsnews.com/news/bird-flu-vaccine-doses-this-summer-cases/",
        "imageurl": "https://assets3.cbsnewsstatic.com/hub/i/r/2024/05/31/6a94aafb-537c-4f91-885e-d7690c8b8a1b/thumbnail/1200x630/7fc359155fe24a44260d6c967f68bb68/gettyimages-472088760.jpg?v=d7bbca61a2ddd34e0cfc8fb46aec1df3",
        "score": -0.0588235294117647
      },
      {
        "title": "Chance to see northern lights returns - WGN TV Chicago",
        "url": "https://wgntv.com/news/friday-night-solar-storm-northern-lights-chicago-wisconsin-michigan-iowa/",
        "imageurl": "https://wgntv.com/wp-content/uploads/sites/5/2024/05/AP24132585667237.jpg?w=1280",
        "score": 0.2
      },
      {
        "title": "Shiloh Jolie-Pitt Wants a Name Change - The Cut",
        "url": "http://www.thecut.com/article/shiloh-jolie-pitt-wants-a-name-change.html",
        "imageurl": "https://pyxis.nymag.com/v1/imgs/19f/144/4c5cafe938bdbe27d3e15411a995c71c0d-shiloh-jolie-pitt-name-change-2.1x.rsocial.w1200.jpg",
        "score": 0
      },
      {
        "title": "It was a strong week for retail earnings. That doesn’t spell a consumer comeback - CNBC",
        "url": "https://www.cnbc.com/2024/05/31/first-quarter-retail-earnings-dont-spell-consumer-comeback.html",
        "imageurl": "https://image.cnbcfm.com/api/v1/image/107231013-1682460626637-gettyimages-1485201295-mt_23201_kgllqfog.jpeg?v=1709644936&w=1920&h=1080",
        "score": 0.125
      },
      {
        "title": "Yemen\"s Houthis threaten escalation after American strike using 5,000-pound bunker-buster bomb - CBS News",
        "url": "https://www.cbsnews.com/news/yemen-houthi-threat-red-sea-us-uk-strike-5000-pound-bunker-buster-bomb/",
        "imageurl": "https://assets1.cbsnewsstatic.com/hub/i/r/2024/05/31/ea582918-ffbc-4af5-a608-fcf26044259e/thumbnail/1200x630/d0569fc507ed83bb5396bb110567a7b6/yemen-protest-houthis.jpg?v=d7bbca61a2ddd34e0cfc8fb46aec1df3",
        "score": -0.142857142857143
      },
      {
        "title": "‘Planetary parade’ will see six planets line up in the morning sky - CNN",
        "url": "https://www.cnn.com/2024/05/31/science/planet-parade-six-planetary-alignment-scn/index.html",
        "imageurl": "https://media.cnn.com/api/v1/images/stellar/prod/ap24145610079099.jpg?c=16x9&q=w_800,c_fill",
        "score": 0
      },
      {
        "title": "Michelle Troconis sentenced to more than 14 years for helping boyfriend murder his wife - NBC News",
        "url": "https://www.nbcnews.com/news/crime-courts/michelle-troconis-sentenced-jennifer-dulos-murder-rcna154868",
        "imageurl": "https://media-cldnry.s-nbcnews.com/image/upload/t_nbcnews-fp-1200-630,f_auto,q_auto:best/rockcms/2024-05/240531-michelle-troconis-mn-0940-ceb911.jpg",
        "score": -0.117647058823529
      },
      {
        "title": "Mike Tyson vs. Jake Paul Boxing Fight Postponed After Icon\"s Medical Emergency - Bleacher Report",
        "url": "https://bleacherreport.com/articles/10123206-mike-tyson-vs-jake-paul-boxing-fight-postponed-after-icons-medical-emergency",
        "imageurl": "https://media.bleacherreport.com/image/upload/c_fill,g_faces,w_3800,h_2000,q_95/v1717191902/hri7g23vkpgt1c72szkk.jpg",
        "score": -0.333333333333333
      },
      {
        "title": "UFC 302: Ceremonial Weigh-In - UFC",
        "url": "https://www.youtube.com/watch?v=99R0wnF0RK8",
        "imageurl": "",
        "score": 0
      },
      {
        "title": "Biden presents new Israel ceasefire plan, calls on Hamas to accept - Reuters",
        "url": "https://www.reuters.com/world/biden-speak-middle-east-friday-white-house-says-2024-05-31/",
        "imageurl": "",
        "score": 0.0769230769230769
      },
      {
        "title": "Florida deputy who fatally shot Airman Roger Fortson fired - The Associated Press",
        "url": "https://apnews.com/article/airman-shot-florida-deputy-roger-fortson-c616444086b39d20a80f35ba86ec531b",
        "imageurl": "https://dims.apnews.com/dims4/default/8de0545/2147483647/strip/true/crop/4000x2250+0+208/resize/1440x810!/quality/90/?url=https%3A%2F%2Fassets.apnews.com%2F54%2Fb2%2Ffee758aeb4a54ae6e67f789cc821%2Fa0aebab5a60f4a76a0a94b4d8ce223e0",
        "score": -0.384615384615385
      },
      {
        "title": "Idaho jury begins deliberations in sentencing of Chad Daybell, who faces possible death penalty for 3 murders - CNN",
        "url": "https://www.cnn.com/2024/05/31/us/chad-daybell-sentencing-death-penalty-decision/index.html",
        "imageurl": "https://media.cnn.com/api/v1/images/stellar/prod/ap24151751257867.jpg?c=16x9&q=w_800,c_fill",
        "score": -0.421052631578947
      },
      {
        "title": "Chobani Yogurt Founder Buys Anchor Brewing Company - The New York Times",
        "url": "https://families.google.com/service-restricted",
        "imageurl": "",
        "score": 0
      },
      {
        "title": "Women on Mediterranean diet live significantly longer: Study - The Hill",
        "url": "https://thehill.com/policy/healthcare/4697185-women-mediterranean-diet-live-longer/",
        "imageurl": "https://thehill.com/wp-content/uploads/sites/2/2022/12/CA_Mediterranean_diet-e1678805813173.jpg?w=1280",
        "score": 0.181818181818182
      },
      {
        "title": "Canadian serial killer Robert Pickton, who brought victims to pig farm, is dead after prison assault - The Associated Press",
        "url": "https://news.google.com/rss/articles/CBMiZmh0dHBzOi8vYXBuZXdzLmNvbS9hcnRpY2xlL3BpY2t0b24tZGVhZC1jYW5hZGEtc2VyaWFsLWtpbGxlci1waWctZmFybS1mMmYyYzM1NDVhYzBiZWEyM2EzOGNjNjkwY2YxYzc5NtIBAA?oc=5",
        "imageurl": "",
        "score": -0.5
      },
      {
        "title": "Borussia Dortmund \"don\"t care\" Real Madrid are UCL favourites - ESPN",
        "url": "https://www.espn.com/soccer/story/_/id/40251698/borussia-dortmund-real-madrid-champions-league-favourites",
        "imageurl": "https://a1.espncdn.com/combiner/i?img=%2Fphoto%2F2024%2F0531%2Fr1340042_1296x729_16%2D9.jpg",
        "score": 0.181818181818182
      },
      {
        "title": "Trump responds to guilty verdict by falsely blasting \"rigged trial\" - The Associated Press",
        "url": "https://apnews.com/article/trump-2024-campaign-trial-4629840240cb308c5eae335532ad17ed",
        "imageurl": "https://dims.apnews.com/dims4/default/77f3507/2147483647/strip/true/crop/3822x2150+0+199/resize/1440x810!/quality/90/?url=https%3A%2F%2Fassets.apnews.com%2Fcd%2Fcc%2F88c34c91b4ad29867721084cf285%2Fd0de36ef8bd046608f2526d24f2ebd65",
        "score": -0.428571428571429
      },
      {
        "title": "US leaders invite Israel\"s Netanyahu to deliver an address to Congress - The Associated Press",
        "url": "https://apnews.com/article/israel-netanyahu-war-gaza-congress-596b0adf6ed8f71ccaaecccec8b9d341",
        "imageurl": "https://dims.apnews.com/dims4/default/6fe3131/2147483647/strip/true/crop/3600x2025+0+188/resize/1440x810!/quality/90/?url=https%3A%2F%2Fassets.apnews.com%2Faa%2F7b%2F0864817be313387dee983d887f4d%2F8971f06369ca4701b06b3cd4bf3f6c18",
        "score": 0.2
      },
      {
        "title": "Boeing\"s Starliner ready for Saturday launch to space station, first flight with crew on board - CBS News",
        "url": "https://www.cbsnews.com/news/boeings-starliner-ready-launch-space-station-first-flight-crew-on-board/",
        "imageurl": "https://assets3.cbsnewsstatic.com/hub/i/r/2024/05/31/2fde4fdb-8a13-4204-891b-c8245bf94fc0/thumbnail/1200x630/301d2075a6aeb78a1f597d290ad3e252/rollout2-access-arm.jpg?v=d7bbca61a2ddd34e0cfc8fb46aec1df3",
        "score": 0.0555555555555556
      },
      {
        "title": "Jennifer Lopez Cancels Summer Tour - Variety",
        "url": "https://variety.com/2024/music/news/jennifer-lopez-cancels-tour-1236021391/",
        "imageurl": "https://variety.com/wp-content/uploads/2024/02/Jennifer-Lopez-Variety-Cover-Story-5-16x9-1.jpg?w=1000&h=563&crop=1",
        "score": -0.142857142857143
      },
      {
        "title": "U.S. to make millions of bird flu vaccine doses this summer, as cases grow - CBS News",
        "url": "https://www.cbsnews.com/news/bird-flu-vaccine-doses-this-summer-cases/",
        "imageurl": "https://assets3.cbsnewsstatic.com/hub/i/r/2024/05/31/6a94aafb-537c-4f91-885e-d7690c8b8a1b/thumbnail/1200x630/7fc359155fe24a44260d6c967f68bb68/gettyimages-472088760.jpg?v=d7bbca61a2ddd34e0cfc8fb46aec1df3",
        "score": -0.0588235294117647
      },
      {
        "title": "Chance to see northern lights returns - WGN TV Chicago",
        "url": "https://wgntv.com/news/friday-night-solar-storm-northern-lights-chicago-wisconsin-michigan-iowa/",
        "imageurl": "https://wgntv.com/wp-content/uploads/sites/5/2024/05/AP24132585667237.jpg?w=1280",
        "score": 0.2
      },
      {
        "title": "Shiloh Jolie-Pitt Wants a Name Change - The Cut",
        "url": "http://www.thecut.com/article/shiloh-jolie-pitt-wants-a-name-change.html",
        "imageurl": "https://pyxis.nymag.com/v1/imgs/19f/144/4c5cafe938bdbe27d3e15411a995c71c0d-shiloh-jolie-pitt-name-change-2.1x.rsocial.w1200.jpg",
        "score": 0
      },
      {
        "title": "It was a strong week for retail earnings. That doesn’t spell a consumer comeback - CNBC",
        "url": "https://www.cnbc.com/2024/05/31/first-quarter-retail-earnings-dont-spell-consumer-comeback.html",
        "imageurl": "https://image.cnbcfm.com/api/v1/image/107231013-1682460626637-gettyimages-1485201295-mt_23201_kgllqfog.jpeg?v=1709644936&w=1920&h=1080",
        "score": 0.125
      },
      {
        "title": "Yemen\"s Houthis threaten escalation after American strike using 5,000-pound bunker-buster bomb - CBS News",
        "url": "https://www.cbsnews.com/news/yemen-houthi-threat-red-sea-us-uk-strike-5000-pound-bunker-buster-bomb/",
        "imageurl": "https://assets1.cbsnewsstatic.com/hub/i/r/2024/05/31/ea582918-ffbc-4af5-a608-fcf26044259e/thumbnail/1200x630/d0569fc507ed83bb5396bb110567a7b6/yemen-protest-houthis.jpg?v=d7bbca61a2ddd34e0cfc8fb46aec1df3",
        "score": -0.142857142857143
      },
      {
        "title": "‘Planetary parade’ will see six planets line up in the morning sky - CNN",
        "url": "https://www.cnn.com/2024/05/31/science/planet-parade-six-planetary-alignment-scn/index.html",
        "imageurl": "https://media.cnn.com/api/v1/images/stellar/prod/ap24145610079099.jpg?c=16x9&q=w_800,c_fill",
        "score": 0
      },
      {
        "title": "Michelle Troconis sentenced to more than 14 years for helping boyfriend murder his wife - NBC News",
        "url": "https://www.nbcnews.com/news/crime-courts/michelle-troconis-sentenced-jennifer-dulos-murder-rcna154868",
        "imageurl": "https://media-cldnry.s-nbcnews.com/image/upload/t_nbcnews-fp-1200-630,f_auto,q_auto:best/rockcms/2024-05/240531-michelle-troconis-mn-0940-ceb911.jpg",
        "score": -0.117647058823529
      },
      {
        "title": "Mike Tyson vs. Jake Paul Boxing Fight Postponed After Icon\"s Medical Emergency - Bleacher Report",
        "url": "https://bleacherreport.com/articles/10123206-mike-tyson-vs-jake-paul-boxing-fight-postponed-after-icons-medical-emergency",
        "imageurl": "https://media.bleacherreport.com/image/upload/c_fill,g_faces,w_3800,h_2000,q_95/v1717191902/hri7g23vkpgt1c72szkk.jpg",
        "score": -0.333333333333333
      },
      {
        "title": "UFC 302: Ceremonial Weigh-In - UFC",
        "url": "https://www.youtube.com/watch?v=99R0wnF0RK8",
        "imageurl": "",
        "score": 0
      },
      {
        "title": "Biden presents new Israel ceasefire plan, calls on Hamas to accept - Reuters",
        "url": "https://www.reuters.com/world/biden-speak-middle-east-friday-white-house-says-2024-05-31/",
        "imageurl": "",
        "score": 0.0769230769230769
      },
      {
        "title": "Florida deputy who fatally shot Airman Roger Fortson fired - The Associated Press",
        "url": "https://apnews.com/article/airman-shot-florida-deputy-roger-fortson-c616444086b39d20a80f35ba86ec531b",
        "imageurl": "https://dims.apnews.com/dims4/default/8de0545/2147483647/strip/true/crop/4000x2250+0+208/resize/1440x810!/quality/90/?url=https%3A%2F%2Fassets.apnews.com%2F54%2Fb2%2Ffee758aeb4a54ae6e67f789cc821%2Fa0aebab5a60f4a76a0a94b4d8ce223e0",
        "score": -0.384615384615385
      },
      {
        "title": "Idaho jury begins deliberations in sentencing of Chad Daybell, who faces possible death penalty for 3 murders - CNN",
        "url": "https://www.cnn.com/2024/05/31/us/chad-daybell-sentencing-death-penalty-decision/index.html",
        "imageurl": "https://media.cnn.com/api/v1/images/stellar/prod/ap24151751257867.jpg?c=16x9&q=w_800,c_fill",
        "score": -0.421052631578947
      },
      {
        "title": "Chobani Yogurt Founder Buys Anchor Brewing Company - The New York Times",
        "url": "https://families.google.com/service-restricted",
        "imageurl": "",
        "score": 0
      },
      {
        "title": "Women on Mediterranean diet live significantly longer: Study - The Hill",
        "url": "https://thehill.com/policy/healthcare/4697185-women-mediterranean-diet-live-longer/",
        "imageurl": "https://thehill.com/wp-content/uploads/sites/2/2022/12/CA_Mediterranean_diet-e1678805813173.jpg?w=1280",
        "score": 0.181818181818182
      },
      {
        "title": "Canadian serial killer Robert Pickton, who brought victims to pig farm, is dead after prison assault - The Associated Press",
        "url": "https://news.google.com/rss/articles/CBMiZmh0dHBzOi8vYXBuZXdzLmNvbS9hcnRpY2xlL3BpY2t0b24tZGVhZC1jYW5hZGEtc2VyaWFsLWtpbGxlci1waWctZmFybS1mMmYyYzM1NDVhYzBiZWEyM2EzOGNjNjkwY2YxYzc5NtIBAA?oc=5",
        "imageurl": "",
        "score": -0.5
      },
      {
        "title": "Borussia Dortmund \"don\"t care\" Real Madrid are UCL favourites - ESPN",
        "url": "https://www.espn.com/soccer/story/_/id/40251698/borussia-dortmund-real-madrid-champions-league-favourites",
        "imageurl": "https://a1.espncdn.com/combiner/i?img=%2Fphoto%2F2024%2F0531%2Fr1340042_1296x729_16%2D9.jpg",
        "score": 0.181818181818182
      },
      {
        "title": "Trump responds to guilty verdict by falsely blasting \"rigged trial\" - The Associated Press",
        "url": "https://apnews.com/article/trump-2024-campaign-trial-4629840240cb308c5eae335532ad17ed",
        "imageurl": "https://dims.apnews.com/dims4/default/77f3507/2147483647/strip/true/crop/3822x2150+0+199/resize/1440x810!/quality/90/?url=https%3A%2F%2Fassets.apnews.com%2Fcd%2Fcc%2F88c34c91b4ad29867721084cf285%2Fd0de36ef8bd046608f2526d24f2ebd65",
        "score": -0.428571428571429
      },
      {
        "title": "US leaders invite Israel\"s Netanyahu to deliver an address to Congress - The Associated Press",
        "url": "https://apnews.com/article/israel-netanyahu-war-gaza-congress-596b0adf6ed8f71ccaaecccec8b9d341",
        "imageurl": "https://dims.apnews.com/dims4/default/6fe3131/2147483647/strip/true/crop/3600x2025+0+188/resize/1440x810!/quality/90/?url=https%3A%2F%2Fassets.apnews.com%2Faa%2F7b%2F0864817be313387dee983d887f4d%2F8971f06369ca4701b06b3cd4bf3f6c18",
        "score": 0.2
      },
      {
        "title": "Boeing\"s Starliner ready for Saturday launch to space station, first flight with crew on board - CBS News",
        "url": "https://www.cbsnews.com/news/boeings-starliner-ready-launch-space-station-first-flight-crew-on-board/",
        "imageurl": "https://assets3.cbsnewsstatic.com/hub/i/r/2024/05/31/2fde4fdb-8a13-4204-891b-c8245bf94fc0/thumbnail/1200x630/301d2075a6aeb78a1f597d290ad3e252/rollout2-access-arm.jpg?v=d7bbca61a2ddd34e0cfc8fb46aec1df3",
        "score": 0.0555555555555556
      },
      {
        "title": "Jennifer Lopez Cancels Summer Tour - Variety",
        "url": "https://variety.com/2024/music/news/jennifer-lopez-cancels-tour-1236021391/",
        "imageurl": "https://variety.com/wp-content/uploads/2024/02/Jennifer-Lopez-Variety-Cover-Story-5-16x9-1.jpg?w=1000&h=563&crop=1",
        "score": -0.142857142857143
      },
      {
        "title": "U.S. to make millions of bird flu vaccine doses this summer, as cases grow - CBS News",
        "url": "https://www.cbsnews.com/news/bird-flu-vaccine-doses-this-summer-cases/",
        "imageurl": "https://assets3.cbsnewsstatic.com/hub/i/r/2024/05/31/6a94aafb-537c-4f91-885e-d7690c8b8a1b/thumbnail/1200x630/7fc359155fe24a44260d6c967f68bb68/gettyimages-472088760.jpg?v=d7bbca61a2ddd34e0cfc8fb46aec1df3",
        "score": -0.0588235294117647
      },
      {
        "title": "Chance to see northern lights returns - WGN TV Chicago",
        "url": "https://wgntv.com/news/friday-night-solar-storm-northern-lights-chicago-wisconsin-michigan-iowa/",
        "imageurl": "https://wgntv.com/wp-content/uploads/sites/5/2024/05/AP24132585667237.jpg?w=1280",
        "score": 0.2
      },
      {
        "title": "Shiloh Jolie-Pitt Wants a Name Change - The Cut",
        "url": "http://www.thecut.com/article/shiloh-jolie-pitt-wants-a-name-change.html",
        "imageurl": "https://pyxis.nymag.com/v1/imgs/19f/144/4c5cafe938bdbe27d3e15411a995c71c0d-shiloh-jolie-pitt-name-change-2.1x.rsocial.w1200.jpg",
        "score": 0
      },
      {
        "title": "It was a strong week for retail earnings. That doesn’t spell a consumer comeback - CNBC",
        "url": "https://www.cnbc.com/2024/05/31/first-quarter-retail-earnings-dont-spell-consumer-comeback.html",
        "imageurl": "https://image.cnbcfm.com/api/v1/image/107231013-1682460626637-gettyimages-1485201295-mt_23201_kgllqfog.jpeg?v=1709644936&w=1920&h=1080",
        "score": 0.125
      },
      {
        "title": "Yemen\"s Houthis threaten escalation after American strike using 5,000-pound bunker-buster bomb - CBS News",
        "url": "https://www.cbsnews.com/news/yemen-houthi-threat-red-sea-us-uk-strike-5000-pound-bunker-buster-bomb/",
        "imageurl": "https://assets1.cbsnewsstatic.com/hub/i/r/2024/05/31/ea582918-ffbc-4af5-a608-fcf26044259e/thumbnail/1200x630/d0569fc507ed83bb5396bb110567a7b6/yemen-protest-houthis.jpg?v=d7bbca61a2ddd34e0cfc8fb46aec1df3",
        "score": -0.142857142857143
      },
      {
        "title": "‘Planetary parade’ will see six planets line up in the morning sky - CNN",
        "url": "https://www.cnn.com/2024/05/31/science/planet-parade-six-planetary-alignment-scn/index.html",
        "imageurl": "https://media.cnn.com/api/v1/images/stellar/prod/ap24145610079099.jpg?c=16x9&q=w_800,c_fill",
        "score": 0
      },
      {
        "title": "Michelle Troconis sentenced to more than 14 years for helping boyfriend murder his wife - NBC News",
        "url": "https://www.nbcnews.com/news/crime-courts/michelle-troconis-sentenced-jennifer-dulos-murder-rcna154868",
        "imageurl": "https://media-cldnry.s-nbcnews.com/image/upload/t_nbcnews-fp-1200-630,f_auto,q_auto:best/rockcms/2024-05/240531-michelle-troconis-mn-0940-ceb911.jpg",
        "score": -0.117647058823529
      },
      {
        "title": "Mike Tyson vs. Jake Paul Boxing Fight Postponed After Icon\"s Medical Emergency - Bleacher Report",
        "url": "https://bleacherreport.com/articles/10123206-mike-tyson-vs-jake-paul-boxing-fight-postponed-after-icons-medical-emergency",
        "imageurl": "https://media.bleacherreport.com/image/upload/c_fill,g_faces,w_3800,h_2000,q_95/v1717191902/hri7g23vkpgt1c72szkk.jpg",
        "score": -0.333333333333333
      },
      {
        "title": "UFC 302: Ceremonial Weigh-In - UFC",
        "url": "https://www.youtube.com/watch?v=99R0wnF0RK8",
        "imageurl": "",
        "score": 0
      },
      {
        "title": "Biden presents new Israel ceasefire plan, calls on Hamas to accept - Reuters",
        "url": "https://www.reuters.com/world/biden-speak-middle-east-friday-white-house-says-2024-05-31/",
        "imageurl": "",
        "score": 0.0769230769230769
      },
      {
        "title": "Florida deputy who fatally shot Airman Roger Fortson fired - The Associated Press",
        "url": "https://apnews.com/article/airman-shot-florida-deputy-roger-fortson-c616444086b39d20a80f35ba86ec531b",
        "imageurl": "https://dims.apnews.com/dims4/default/8de0545/2147483647/strip/true/crop/4000x2250+0+208/resize/1440x810!/quality/90/?url=https%3A%2F%2Fassets.apnews.com%2F54%2Fb2%2Ffee758aeb4a54ae6e67f789cc821%2Fa0aebab5a60f4a76a0a94b4d8ce223e0",
        "score": -0.384615384615385
      },
      {
        "title": "Idaho jury begins deliberations in sentencing of Chad Daybell, who faces possible death penalty for 3 murders - CNN",
        "url": "https://www.cnn.com/2024/05/31/us/chad-daybell-sentencing-death-penalty-decision/index.html",
        "imageurl": "https://media.cnn.com/api/v1/images/stellar/prod/ap24151751257867.jpg?c=16x9&q=w_800,c_fill",
        "score": -0.421052631578947
      },
      {
        "title": "Chobani Yogurt Founder Buys Anchor Brewing Company - The New York Times",
        "url": "https://families.google.com/service-restricted",
        "imageurl": "",
        "score": 0
      },
      {
        "title": "Women on Mediterranean diet live significantly longer: Study - The Hill",
        "url": "https://thehill.com/policy/healthcare/4697185-women-mediterranean-diet-live-longer/",
        "imageurl": "https://thehill.com/wp-content/uploads/sites/2/2022/12/CA_Mediterranean_diet-e1678805813173.jpg?w=1280",
        "score": 0.181818181818182
      },
      {
        "title": "Canadian serial killer Robert Pickton, who brought victims to pig farm, is dead after prison assault - The Associated Press",
        "url": "https://news.google.com/rss/articles/CBMiZmh0dHBzOi8vYXBuZXdzLmNvbS9hcnRpY2xlL3BpY2t0b24tZGVhZC1jYW5hZGEtc2VyaWFsLWtpbGxlci1waWctZmFybS1mMmYyYzM1NDVhYzBiZWEyM2EzOGNjNjkwY2YxYzc5NtIBAA?oc=5",
        "imageurl": "",
        "score": -0.5
      },
      {
        "title": "Borussia Dortmund \"don\"t care\" Real Madrid are UCL favourites - ESPN",
        "url": "https://www.espn.com/soccer/story/_/id/40251698/borussia-dortmund-real-madrid-champions-league-favourites",
        "imageurl": "https://a1.espncdn.com/combiner/i?img=%2Fphoto%2F2024%2F0531%2Fr1340042_1296x729_16%2D9.jpg",
        "score": 0.181818181818182
      },
      {
        "title": "Trump responds to guilty verdict by falsely blasting \"rigged trial\" - The Associated Press",
        "url": "https://apnews.com/article/trump-2024-campaign-trial-4629840240cb308c5eae335532ad17ed",
        "imageurl": "https://dims.apnews.com/dims4/default/77f3507/2147483647/strip/true/crop/3822x2150+0+199/resize/1440x810!/quality/90/?url=https%3A%2F%2Fassets.apnews.com%2Fcd%2Fcc%2F88c34c91b4ad29867721084cf285%2Fd0de36ef8bd046608f2526d24f2ebd65",
        "score": -0.428571428571429
      },
      {
        "title": "US leaders invite Israel\"s Netanyahu to deliver an address to Congress - The Associated Press",
        "url": "https://apnews.com/article/israel-netanyahu-war-gaza-congress-596b0adf6ed8f71ccaaecccec8b9d341",
        "imageurl": "https://dims.apnews.com/dims4/default/6fe3131/2147483647/strip/true/crop/3600x2025+0+188/resize/1440x810!/quality/90/?url=https%3A%2F%2Fassets.apnews.com%2Faa%2F7b%2F0864817be313387dee983d887f4d%2F8971f06369ca4701b06b3cd4bf3f6c18",
        "score": 0.2
      },
      {
        "title": "Boeing\"s Starliner ready for Saturday launch to space station, first flight with crew on board - CBS News",
        "url": "https://www.cbsnews.com/news/boeings-starliner-ready-launch-space-station-first-flight-crew-on-board/",
        "imageurl": "https://assets3.cbsnewsstatic.com/hub/i/r/2024/05/31/2fde4fdb-8a13-4204-891b-c8245bf94fc0/thumbnail/1200x630/301d2075a6aeb78a1f597d290ad3e252/rollout2-access-arm.jpg?v=d7bbca61a2ddd34e0cfc8fb46aec1df3",
        "score": 0.0555555555555556
      },
      {
        "title": "Jennifer Lopez Cancels Summer Tour - Variety",
        "url": "https://variety.com/2024/music/news/jennifer-lopez-cancels-tour-1236021391/",
        "imageurl": "https://variety.com/wp-content/uploads/2024/02/Jennifer-Lopez-Variety-Cover-Story-5-16x9-1.jpg?w=1000&h=563&crop=1",
        "score": -0.142857142857143
      },
      {
        "title": "U.S. to make millions of bird flu vaccine doses this summer, as cases grow - CBS News",
        "url": "https://www.cbsnews.com/news/bird-flu-vaccine-doses-this-summer-cases/",
        "imageurl": "https://assets3.cbsnewsstatic.com/hub/i/r/2024/05/31/6a94aafb-537c-4f91-885e-d7690c8b8a1b/thumbnail/1200x630/7fc359155fe24a44260d6c967f68bb68/gettyimages-472088760.jpg?v=d7bbca61a2ddd34e0cfc8fb46aec1df3",
        "score": -0.0588235294117647
      },
      {
        "title": "Chance to see northern lights returns - WGN TV Chicago",
        "url": "https://wgntv.com/news/friday-night-solar-storm-northern-lights-chicago-wisconsin-michigan-iowa/",
        "imageurl": "https://wgntv.com/wp-content/uploads/sites/5/2024/05/AP24132585667237.jpg?w=1280",
        "score": 0.2
      },
      {
        "title": "Shiloh Jolie-Pitt Wants a Name Change - The Cut",
        "url": "http://www.thecut.com/article/shiloh-jolie-pitt-wants-a-name-change.html",
        "imageurl": "https://pyxis.nymag.com/v1/imgs/19f/144/4c5cafe938bdbe27d3e15411a995c71c0d-shiloh-jolie-pitt-name-change-2.1x.rsocial.w1200.jpg",
        "score": 0
      },
      {
        "title": "It was a strong week for retail earnings. That doesn’t spell a consumer comeback - CNBC",
        "url": "https://www.cnbc.com/2024/05/31/first-quarter-retail-earnings-dont-spell-consumer-comeback.html",
        "imageurl": "https://image.cnbcfm.com/api/v1/image/107231013-1682460626637-gettyimages-1485201295-mt_23201_kgllqfog.jpeg?v=1709644936&w=1920&h=1080",
        "score": 0.125
      },
      {
        "title": "Yemen\"s Houthis threaten escalation after American strike using 5,000-pound bunker-buster bomb - CBS News",
        "url": "https://www.cbsnews.com/news/yemen-houthi-threat-red-sea-us-uk-strike-5000-pound-bunker-buster-bomb/",
        "imageurl": "https://assets1.cbsnewsstatic.com/hub/i/r/2024/05/31/ea582918-ffbc-4af5-a608-fcf26044259e/thumbnail/1200x630/d0569fc507ed83bb5396bb110567a7b6/yemen-protest-houthis.jpg?v=d7bbca61a2ddd34e0cfc8fb46aec1df3",
        "score": -0.142857142857143
      },
      {
        "title": "‘Planetary parade’ will see six planets line up in the morning sky - CNN",
        "url": "https://www.cnn.com/2024/05/31/science/planet-parade-six-planetary-alignment-scn/index.html",
        "imageurl": "https://media.cnn.com/api/v1/images/stellar/prod/ap24145610079099.jpg?c=16x9&q=w_800,c_fill",
        "score": 0
      },
      {
        "title": "Live Nation says data breach at Ticketmaster exposed info of millions of customers - KOMO News",
        "url": "https://wsbt.com/news/nation-world/live-nation-says-data-breach-at-ticketmaster-exposed-info-of-millions-of-customers-shinyhunters-hacking-group-online-forum-data-names-addresses-credit-card-details-sec-filing-data-leak-criminal-threat",
        "imageurl": "https://wsbt.com/resources/media/e2800bcd-3539-49f9-aef5-67b61c4e600e-large16x9_AP24153542179779.jpg",
        "score": -0.0625
      },
      {
        "title": "NASA’s Boeing Starliner Crew Flight Test Launch – June 1, 2024 (Official NASA Broadcast) - NASA",
        "url": "https://www.youtube.com/watch?v=aEi5boWupRk",
        "imageurl": "https://i.ytimg.com/vi/aEi5boWupRk/maxresdefault.jpg",
        "score": 0.0625
      },
      {
        "title": "Fever defeat Sky, 71–70 in first WNBA meeting between Caitlin Clark and Angel Reese - Yahoo Sports",
        "url": "https://sports.yahoo.com/fever-defeat-sky-7170-in-first-wnba-meeting-between-caitlin-clark-and-angel-reese-180634075.html",
        "imageurl": "https://s.yimg.com/ny/api/res/1.2/qEgefA29q60Duj8n_mASpA--/YXBwaWQ9aGlnaGxhbmRlcjt3PTEyMDA7aD04MDA-/https://s.yimg.com/os/creatr-uploaded-images/2024-05/e2b376f0-2041-11ef-be7f-fcea25ed0b7f",
        "score": -0.235294117647059
      },
      {
        "title": "Dortmund vs. Real Madrid odds, picks, how to watch, stream, time: 2024 Champions League Final prediction - CBS Sports",
        "url": "https://www.cbssports.com/soccer/news/dortmund-vs-real-madrid-odds-picks-how-to-watch-stream-time-2024-champions-league-final-prediction/",
        "imageurl": "https://sportshub.cbsistatic.com/i/r/2024/05/30/15944e1f-8818-4ae1-a10c-2e2c55da5af0/thumbnail/1200x675/79e41ae63fbcd85f3f889de43320a127/joselu-vinijr-getty-cbs.jpg",
        "score": 0.105263157894737
      },
      {
        "title": "Deontay Wilder vs. Zhilei Zhang fight predictions, start time, odds, preview, undercard, expert picks - CBS Sports",
        "url": "https://www.cbssports.com/boxing/news/deontay-wilder-vs-zhilei-zhang-fight-predictions-start-time-odds-preview-undercard-expert-picks/",
        "imageurl": "https://sportshub.cbsistatic.com/i/r/2024/05/31/78c25c72-7dc9-4c30-b482-67fcd6d754bf/thumbnail/1200x675/24f6a9b8551df95c136f0d24acf3bb8d/zhang-wilder.jpg",
        "score": -0.117647058823529
      },
      {
        "title": "Obituary: Marian Robinson, Michelle Obama’s mother, dies - BBC.com",
        "url": "https://www.bbc.com/news/world-us-canada-57037248",
        "imageurl": "https://ichef.bbci.co.uk/news/1024/branded_news/15F11/production/_118437898_marianmichelle\"sinsta.png",
        "score": -0.333333333333333
      },
      {
        "title": "[Removed]",
        "url": "https://removed.com",
        "imageurl": "",
        "score": 0
      },
      {
        "title": "Homebuyers are starting to revolt over steep prices across US - Yahoo Finance",
        "url": "https://finance.yahoo.com/news/homebuyers-starting-revolt-over-steep-143000917.html",
        "imageurl": "https://s.yimg.com/ny/api/res/1.2/6mbNrpKbjUTuymzuednelg--/YXBwaWQ9aGlnaGxhbmRlcjt3PTEyMDA7aD04MDA-/https://media.zenfs.com/en/bloomberg_markets_842/01288ece2372da8041109488093b965c",
        "score": 0
      },
      {
        "title": "Northern lights could appear in US again, but too soon to tell - USA TODAY",
        "url": "https://www.usatoday.com/story/news/nation/2024/05/31/northern-lights-forecast-weekend-auroras-likely-more-could-be-coming/73921345007/",
        "imageurl": "https://www.usatoday.com/gcdn/authoring/authoring-images/2024/05/13/USAT/73668569007-20240512-t-170102-z-1560853664-rc-26-o-7-apbdbv-rtrmadp-3-canadaweatheraurora.JPG?crop=5153,2899,x0,y536&width=3200&height=1801&format=pjpg&auto=webp",
        "score": 0.133333333333333
      },
      {
        "title": "‘Garfield’ Still Has Upper Paw Over ‘Furiosa’ With $13M Second Weekend – Saturday AM Update - Deadline",
        "url": "http://deadline.com/2024/06/box-office-garfield-furiosa-haikyu-dumpster-battle-1235945804/",
        "imageurl": "https://deadline.com/wp-content/uploads/2024/05/MCDGAMO_CO026.jpg?w=1024",
        "score": 0.117647058823529
      },
      {
        "title": "Angelina Jolie and Brad Pitt\"s daughter Shiloh files for name change - BBC.com",
        "url": "https://www.bbc.com/news/articles/cyjjymklnvmo",
        "imageurl": "https://ichef.bbci.co.uk/news/1024/branded_news/42b7/live/1ce4bb20-201c-11ef-b7dc-a5e8bc96df26.jpg",
        "score": 0
      },
      {
        "title": "Idaho jury resumes deliberations Saturday in sentencing of Chad Daybell, who faces possible death penalty for 3 murders - CNN",
        "url": "https://www.cnn.com/2024/06/01/us/chad-daybell-murder-sentencing-death-penalty/index.html",
        "imageurl": "https://media.cnn.com/api/v1/images/stellar/prod/ap24151751034012.jpg?c=16x9&q=w_800,c_fill",
        "score": -0.4
      },
      {
        "title": "South Africa’s ANC loses 30-year parliamentary majority after election - Al Jazeera English",
        "url": "https://www.aljazeera.com/news/2024/6/1/south-africa-anc-loses-30-year-parliamentary-majority-after-election",
        "imageurl": "https://www.aljazeera.com/wp-content/uploads/2024/05/2024-05-29T125644Z_441809566_RC2B08AWQTMW_RTRMADP_3_SAFRICA-ELECTION-1717002029.jpg?resize=1920%2C1440",
        "score": -0.230769230769231
      },
      {
        "title": "Jennifer Lopez cancels 2024 North American tour - The Associated Press",
        "url": "https://apnews.com/article/jennifer-lopez-tour-340a7282847e4def128010caef400ebc",
        "imageurl": "https://dims.apnews.com/dims4/default/b39d197/2147483647/strip/true/crop/3500x1969+0+211/resize/1440x810!/quality/90/?url=https%3A%2F%2Fassets.apnews.com%2F47%2F22%2F62968688774b6875f8a2c0cb72f5%2F10fa2d9ba3c3480683ef998631ac832c",
        "score": -0.0909090909090909
      },
      {
        "title": "Here\"s why a Japanese billionaire just canceled his lunar flight on Starship - Ars Technica",
        "url": "https://arstechnica.com/space/2024/06/heres-why-a-japanese-billionaire-just-canceled-his-lunar-flight-on-starship/",
        "imageurl": "https://cdn.arstechnica.net/wp-content/uploads/2018/09/GettyImages-1035243904-760x380.jpg",
        "score": -0.0666666666666667
      },
      {
        "title": "India election: Modi\"s BJP alliance set to win parliamentary majority - CNBC",
        "url": "https://www.cnbc.com/2024/06/01/india-election-modis-bjp-alliance-set-to-win-parliamentary-majority.html",
        "imageurl": "https://image.cnbcfm.com/api/v1/image/107000504-1642058189513-gettyimages-1230740160-AFP_8ZD8HH.jpeg?v=1717157973&w=1920&h=1080",
        "score": 0.333333333333333
      },
      {
        "title": "Republicans join Trump\"s attacks on justice system and campaign of vengeance after guilty verdict - The Associated Press",
        "url": "https://apnews.com/article/trump-guilty-republicans-vengeance-a05db7fa2512a62afe035992f2baaf16",
        "imageurl": "https://dims.apnews.com/dims4/default/1719da9/2147483647/strip/true/crop/3000x1688+0+156/resize/1440x810!/quality/90/?url=https%3A%2F%2Fassets.apnews.com%2Fa9%2F82%2F0caa867125fdeb424b59a6e05fbf%2F8e369da136e6418e95c1c318280c8a27",
        "score": -0.111111111111111
      },
      {
        "title": "Chipotle denies social media accusations that portions are smaller - USA TODAY",
        "url": "https://www.usatoday.com/story/money/food/2024/06/01/chipotle-food-portions-claims/73928875007/",
        "imageurl": "https://www.usatoday.com/gcdn/authoring/authoring-images/2024/05/31/USAT/73929185007-2130940436.jpg?crop=5659,3183,x0,y342&width=3200&height=1800&format=pjpg&auto=webp",
        "score": -0.333333333333333
      },
      {
        "title": "China accuses US of seeking \"Asia-Pacific Nato\" - Financial Times",
        "url": "https://www.ft.com/content/b889d33c-7745-48b7-b847-64f2b3003409",
        "imageurl": "https://www.ft.com/__origami/service/image/v2/images/raw/https%3A%2F%2Fwww.ft.com%2F__origami%2Fservice%2Fimage%2Fv2%2Fimages%2Fraw%2Fhttps%253A%252F%252Fd1e00ek4ebabms.cloudfront.net%252Fproduction%252Fd337c074-93f0-4059-be02-c7803ad01dd5.jpg%3Fsource%3Dnext-article%26fit%3Dscale-down%26quality%3Dhighest%26width%3D700%26dpr%3D1?source=next-opengraph&fit=scale-down&width=900",
        "score": 0
      }
    ],
    "RowCtor": null,
    "rowAsArray": false,
    "_prebuiltEmptyResultObject": {
      "title": null,
      "url": null,
      "imageurl": null,
      "score": null
    }
  }
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  res.json(dummy)
})

app.get("/api/news", async (req, res) => {
  // this endpoint just fetches data, the one that writes to db is below
  try {
    const category = req.query.category || 'general';
    const response = await newsService.getNews(category);
    console.log('response',response)
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    res.json(response);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
})

const server = app.listen(port, () => console.log(`app up n running`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;


