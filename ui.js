// 임시 가짜 recommend(). CLAUDE.md의 약속 모양을 따르되, 아래는 의진과 합의가 필요한 확장이다.
// - stop.type에 "이벤트", "체험" 추가 / 선택 필드 stop.period(기간)
// - prefs.companion, prefs.style 사용
// 진짜 logic.js가 recommend()를 정의하면 그쪽이 자동으로 쓰인다. (아래 getRecommend 참고)
const FAKE_COURSES = [
  {
    id: "c1",
    title: "서촌 한옥 자수 클래스 코스",
    totalCost: 50000,
    fit: { companion: ["부모님", "데이트"], walk: "적게", stay: "오래 앉아 대화", crowd: "한적한", mood: ["조용한", "전통"] },
    stops: [
      { time: "10:30", name: "서촌 한옥 자수 원데이 클래스", type: "체험", cost: 25000 },
      { time: "13:00", name: "서촌 한정식", type: "식사", cost: 18000 },
      { time: "15:00", name: "대오서점 카페", type: "카페", cost: 7000 }
    ]
  },
  {
    id: "c2",
    title: "청계천 빛초롱축제 저녁 코스",
    totalCost: 20000,
    fit: { companion: ["데이트", "친구", "혼자"], walk: "많이", stay: "여러 곳 둘러보기", crowd: "상관없음", mood: ["활기찬", "전통"] },
    stops: [
      { time: "15:00", name: "익선동 한옥 카페", type: "카페", cost: 8000 },
      { time: "17:30", name: "광장시장 빈대떡", type: "식사", cost: 12000 },
      { time: "19:00", name: "서울빛초롱축제 (청계천)", type: "이벤트", cost: 0, period: "11.01~11.17" }
    ]
  },
  {
    id: "c3",
    title: "성수 팝업스토어 투어",
    totalCost: 42000,
    fit: { companion: ["데이트", "친구"], walk: "많이", stay: "여러 곳 둘러보기", crowd: "상관없음", mood: ["트렌디", "활기찬"] },
    stops: [
      { time: "12:00", name: "성수 브런치", type: "식사", cost: 18000 },
      { time: "13:30", name: "성수 브랜드 팝업스토어", type: "이벤트", cost: 0, period: "10.18~11.03" },
      { time: "15:30", name: "성수 편집숍", type: "쇼핑", cost: 15000 },
      { time: "17:00", name: "성수 루프탑 카페", type: "카페", cost: 9000 }
    ]
  },
  {
    id: "c4",
    title: "한강 밤도깨비 야시장 코스",
    totalCost: 15000,
    fit: { companion: ["친구", "혼자", "데이트"], walk: "많이", stay: "여러 곳 둘러보기", crowd: "상관없음", mood: ["활기찬", "자연"] },
    stops: [
      { time: "16:00", name: "반포 한강공원 산책", type: "관광", cost: 0 },
      { time: "18:00", name: "서울 밤도깨비 야시장", type: "이벤트", cost: 15000, period: "매주 금·토" },
      { time: "20:00", name: "달빛무지개분수", type: "관광", cost: 0 }
    ]
  },
  {
    id: "c5",
    title: "창덕궁 후원과 북촌 다도 체험",
    totalCost: 36000,
    fit: { companion: ["부모님", "혼자"], walk: "적당히", stay: "오래 앉아 대화", crowd: "한적한", mood: ["조용한", "전통", "자연"] },
    stops: [
      { time: "10:00", name: "창덕궁 후원", type: "관광", cost: 5000 },
      { time: "12:00", name: "북촌 손칼국수", type: "식사", cost: 11000 },
      { time: "14:00", name: "북촌 전통 다도 체험", type: "체험", cost: 20000 }
    ]
  },
  {
    id: "c6",
    title: "연남동 향수 공방 데이트",
    totalCost: 61000,
    fit: { companion: ["데이트", "친구"], walk: "적게", stay: "오래 앉아 대화", crowd: "한적한", mood: ["조용한", "트렌디"] },
    stops: [
      { time: "13:00", name: "연남동 파스타", type: "식사", cost: 17000 },
      { time: "14:30", name: "나만의 향수 만들기 공방", type: "체험", cost: 35000 },
      { time: "16:30", name: "연남동 정원 카페", type: "카페", cost: 9000 }
    ]
  }
];

// 가짜 점수: 기본 40 + 동행 20 + 걷기 10 + 머무는 방식 10 + 붐빔 10 + 분위기(태그당 5, 최대 10)
function fakeScore(fit, prefs) {
  let score = 40;
  if (fit.companion.includes(prefs.companion)) score += 20;
  if (fit.walk === prefs.style.walk) score += 10;
  if (fit.stay === prefs.style.stay) score += 10;
  if (prefs.style.crowd === "상관없음" || fit.crowd === prefs.style.crowd) score += 10;
  const moodHits = prefs.mood.filter((m) => fit.mood.includes(m)).length;
  score += Math.min(moodHits * 5, 10);
  return score;
}

function fakeRecommend(prefs) {
  return FAKE_COURSES
    .filter((c) => c.totalCost <= prefs.budget)
    .map(({ fit, ...course }) => ({ ...course, score: fakeScore(fit, prefs) }))
    .sort((a, b) => b.score - a.score);
}

// logic.js가 로드되어 recommend가 있으면 진짜를, 없으면 가짜를 쓴다.
function getRecommend() {
  return typeof recommend === "function" ? recommend : fakeRecommend;
}

function checkedValue(name) {
  return document.querySelector(`input[name="${name}"]:checked`).value;
}

function readPrefs() {
  const mood = [...document.querySelectorAll('input[name="mood"]:checked')].map((el) => el.value);
  return {
    area: null,
    budget: Number(document.getElementById("budget").value),
    mood,
    spicyOk: false,
    // 약속(CLAUDE.md)에는 없는 추가 필드. logic.js가 쓰려면 의진과 합의 필요.
    companion: checkedValue("companion"),
    style: {
      walk: checkedValue("walk"),
      stay: checkedValue("stay"),
      crowd: checkedValue("crowd")
    }
  };
}

function formatWon(n) {
  return n.toLocaleString("ko-KR") + "원";
}

function renderCard(course) {
  const card = document.createElement("article");
  card.className = "card";

  const title = document.createElement("h3");
  title.textContent = course.title;

  const meta = document.createElement("p");
  meta.textContent = `점수 ${course.score}점 · 1인 ${formatWon(course.totalCost)}`;

  const list = document.createElement("ul");
  for (const stop of course.stops) {
    const li = document.createElement("li");
    let text = `${stop.time} [${stop.type}] ${stop.name} (${formatWon(stop.cost)})`;
    if (stop.period) text += ` · 기간: ${stop.period}`;
    // 이벤트·체험은 굵게 강조한다. 모르는 type이 와도 그대로 글자로 보여준다.
    if (stop.type === "이벤트" || stop.type === "체험") {
      const strong = document.createElement("strong");
      strong.textContent = text;
      li.appendChild(strong);
    } else {
      li.textContent = text;
    }
    list.appendChild(li);
  }

  card.append(title, meta, list);
  return card;
}

function renderResults(courses) {
  const results = document.getElementById("results");
  results.innerHTML = "";
  if (courses.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "조건에 맞는 코스가 없어요. 예산이나 스타일을 바꿔보세요.";
    results.appendChild(empty);
    return;
  }
  for (const course of courses.slice(0, 3)) {
    results.appendChild(renderCard(course));
  }
}

document.getElementById("prefs-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const courses = getRecommend()(readPrefs());
  renderResults(courses);
});
