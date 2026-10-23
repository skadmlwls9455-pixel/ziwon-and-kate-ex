// 임시 가짜 recommend(). CLAUDE.md의 약속 모양을 그대로 따른다.
// 진짜 logic.js가 recommend()를 정의하면 그쪽이 자동으로 쓰인다. (아래 getRecommend 참고)
function fakeRecommend(prefs) {
  const courses = [
    {
      id: "c1",
      title: "종로 전통 산책 코스",
      totalCost: 31000,
      score: 87,
      stops: [
        { time: "10:00", name: "경복궁", type: "관광", cost: 3000 },
        { time: "12:30", name: "토속촌", type: "식사", cost: 20000 },
        { time: "15:00", name: "익선동 카페", type: "카페", cost: 8000 }
      ]
    },
    {
      id: "c2",
      title: "성수 트렌디 코스",
      totalCost: 45000,
      score: 74,
      stops: [
        { time: "11:00", name: "서울숲", type: "관광", cost: 0 },
        { time: "13:00", name: "성수 수제버거", type: "식사", cost: 18000 },
        { time: "15:00", name: "성수 편집숍", type: "쇼핑", cost: 15000 },
        { time: "17:00", name: "대림창고 카페", type: "카페", cost: 12000 }
      ]
    },
    {
      id: "c3",
      title: "홍대 활기찬 코스",
      totalCost: 38000,
      score: 62,
      stops: [
        { time: "12:00", name: "홍대 떡볶이", type: "식사", cost: 9000 },
        { time: "14:00", name: "홍대 걷고싶은거리", type: "관광", cost: 0 },
        { time: "16:00", name: "연남동 소품숍", type: "쇼핑", cost: 20000 },
        { time: "18:00", name: "연남동 카페", type: "카페", cost: 9000 }
      ]
    }
  ];
  return courses
    .filter((c) => c.totalCost <= prefs.budget)
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
    li.textContent = `${stop.time} [${stop.type}] ${stop.name} (${formatWon(stop.cost)})`;
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
