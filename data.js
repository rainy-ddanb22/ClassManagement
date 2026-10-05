// 5학년 학급 데이터 초기 프리셋 (21명 학생, 역할, 상점 아이템, 미션)
window.ClassData = {
  DEFAULT_STUDENTS: [
    { id: 1, number: 1, name: "김민준", balance: 120, exp: 120, roleId: 1, inventory: [] },
    { id: 2, number: 2, name: "이서아", balance: 250, exp: 250, roleId: 2, inventory: [] },
    { id: 3, number: 3, name: "박도윤", balance: 340, exp: 340, roleId: 3, inventory: [] },
    { id: 4, number: 4, name: "정서윤", balance: 180, exp: 180, roleId: 4, inventory: [] },
    { id: 5, number: 5, name: "최하준", balance: 410, exp: 410, roleId: 5, inventory: [] },
    { id: 6, number: 6, name: "조하은", balance: 90,  exp: 90,  roleId: 6, inventory: [] },
    { id: 7, number: 7, name: "윤지호", balance: 310, exp: 310, roleId: 7, inventory: [] },
    { id: 8, number: 8, name: "장지우", balance: 220, exp: 220, roleId: 8, inventory: [] },
    { id: 9, number: 9, name: "임유준", balance: 150, exp: 150, roleId: 9, inventory: [] },
    { id: 10, number: 10, name: "한수아", balance: 280, exp: 280, roleId: 10, inventory: [] },
    { id: 11, number: 11, name: "오준우", balance: 190, exp: 190, roleId: 11, inventory: [] },
    { id: 12, number: 12, name: "서지안", balance: 360, exp: 360, roleId: 12, inventory: [] },
    { id: 13, number: 13, name: "신은우", balance: 200, exp: 200, roleId: 13, inventory: [] },
    { id: 14, number: 14, name: "권시우", balance: 130, exp: 130, roleId: 14, inventory: [] },
    { id: 15, number: 15, name: "황예준", balance: 450, exp: 450, roleId: 15, inventory: [] },
    { id: 16, number: 16, name: "송다은", balance: 170, exp: 170, roleId: 16, inventory: [] },
    { id: 17, number: 17, name: "안민서", balance: 230, exp: 230, roleId: 17, inventory: [] },
    { id: 18, number: 18, name: "류하린", balance: 300, exp: 300, roleId: 18, inventory: [] },
    { id: 19, number: 19, name: "홍서진", balance: 110, exp: 110, roleId: 19, inventory: [] },
    { id: 20, number: 20, name: "전지안", balance: 270, exp: 270, roleId: 20, inventory: [] },
    { id: 21, number: 21, name: "문채원", balance: 380, exp: 380, roleId: 21, inventory: [] }
  ],

  DEFAULT_ROLES: [
    { id: 1, title: "칠판 지우개", icon: "🧹", salary: 50, desc: "쉬는 시간과 하교 전 칠판을 깨끗하게 정리합니다." },
    { id: 2, title: "에너지 지킴이", icon: "💡", salary: 50, desc: "이동수업 및 점심시간에 전등과 에어컨, 모니터를 끕니다." },
    { id: 3, title: "우유 도우미", icon: "🥛", salary: 50, desc: "우유 급식 수령 및 우유팩 정리/분리수거를 돕습니다." },
    { id: 4, title: "도서관 사서", icon: "📚", salary: 60, desc: "학급 문고 책 정리 및 대출/반납을 관리합니다." },
    { id: 5, title: "줄반장", icon: "🚶", salary: 50, desc: "이동수업이나 급식실 이동 시 줄을 바르게 세웁니다." },
    { id: 6, title: "위생 방역관", icon: "🧼", salary: 50, desc: "손 소독제 관리 및 교실 환기(창문 열기)를 담당합니다." },
    { id: 7, title: "방송 알리미", icon: "📢", salary: 50, desc: "학교 방송 및 알림장 전달 사항을 칠판에 적습니다." },
    { id: 8, title: "식물 집사", icon: "🌱", salary: 50, desc: "교실 화분에 주기적으로 물을 주고 상태를 살핍니다." },
    { id: 9, title: "체육 부장", icon: "⚽", salary: 60, desc: "체육 시간 전 운동기구 준비 및 반납을 총괄합니다." },
    { id: 10, title: "학용품 관리사", icon: "✏️", salary: 40, desc: "교실 공용 연필깎이와 보드마카를 채워둡니다." },
    { id: 11, title: "분리수거 감독", icon: "♻️", salary: 60, desc: "종이, 플라스틱, 캔 분리수거통을 매일 점검합니다." },
    { id: 12, title: "음악 DJ", icon: "🎵", salary: 50, desc: "아침 등교 시간과 청소 시간에 틀 음악을 선곡합니다." },
    { id: 13, title: "시간 지킴이", icon: "⏰", salary: 40, desc: "수업 시작 1분 전 종소리를 알리고 자리에 앉도록 합니다." },
    { id: 14, title: "안전 지킴이", icon: "🦺", salary: 50, desc: "복도에서 뛰거나 위험한 장난을 치는 친구를 계도합니다." },
    { id: 15, title: "신문 기자", icon: "📰", salary: 60, desc: "우리 반의 재미있는 소식이나 인터뷰를 게시판에 씁니다." },
    { id: 16, title: "보드게임 마스터", icon: "🎲", salary: 50, desc: "학급 보드게임 부품 분실 여부 및 정돈 상태를 관리합니다." },
    { id: 17, title: "우체부", icon: "💌", salary: 50, desc: "선생님 심부름이나 교무실 유인물 수령을 도맡습니다." },
    { id: 18, title: "환기 대장", icon: "🪟", salary: 40, desc: "매 시간 쉬는 시간마다 창문을 열어 공기를 순환시킵니다." },
    { id: 19, title: "책상 정리 도우미", icon: "🗄️", salary: 50, desc: "하교 전 책상 열과 서랍 정돈 상태를 점검합니다." },
    { id: 20, title: "창의 미술 도우미", icon: "🎨", salary: 50, desc: "미술 시간 물통과 팔레트 정리를 돕습니다." },
    { id: 21, title: "칭찬 요정", icon: "💖", salary: 60, desc: "오늘 착한 일을 한 친구를 발견해 칭찬 나무에 적습니다." }
  ],

  DEFAULT_STORE_ITEMS: [
    {
      id: 1,
      name: "자리 우선 선택권",
      icon: "🪑",
      category: "coupon",
      price: 150,
      stock: 3,
      desc: "자리 바꾸는 날, 원하는 자리를 먼저 선택할 수 있는 황금 티켓!"
    },
    {
      id: 2,
      name: "숙제 1회 면제권",
      icon: "📝",
      category: "coupon",
      price: 200,
      stock: 5,
      desc: "일기 또는 일일 숙제 1회를 정당하게 패스할 수 있는 쿠폰!"
    },
    {
      id: 3,
      name: "1일 급식 1등권",
      icon: "🍱",
      category: "coupon",
      price: 100,
      stock: 8,
      desc: "우리 모둠 또는 내가 오늘 가장 먼저 급식을 받을 수 있는 권리!"
    },
    {
      id: 4,
      name: "등교/청소 음악 신청권",
      icon: "🎧",
      category: "coupon",
      price: 50,
      stock: 12,
      desc: "내가 좋아하는 노래를 교실 스피커로 반 친구들과 함께 감상!"
    },
    {
      id: 5,
      name: "1일 짝꿍 지정권",
      icon: "🤝",
      category: "coupon",
      price: 180,
      stock: 2,
      desc: "하루 동안 내가 원하는 친구와 나란히 앉아 공부할 수 있어요."
    },
    {
      id: 6,
      name: "선생님과 보드게임 1판",
      icon: "♟️",
      category: "coupon",
      price: 120,
      stock: 4,
      desc: "점심시간에 선생님과 신나는 루미큐브/할리갈리 한 판 승부!"
    },
    {
      id: 7,
      name: "5분 자유시간 연장권",
      icon: "⏳",
      category: "coupon",
      price: 130,
      stock: 4,
      desc: "쉬는 시간이나 점심시간 5분 더 놀 수 있는 마법의 시계!"
    },
    {
      id: 8,
      name: "예쁜 젤펜 & 스티커 세트",
      icon: "✨",
      category: "item",
      price: 80,
      stock: 10,
      desc: "선생님이 직접 준비한 알록달록 캐릭터 문구 선물!"
    }
  ],

  DEFAULT_MISSIONS: [
    {
      id: 1,
      title: "아침 독서 15분 몰입하기",
      icon: "📖",
      rewardExp: 10,
      rewardMoney: 10,
      desc: "아침 8시 45분부터 9시까지 조용히 독서 책 읽기"
    },
    {
      id: 2,
      title: "우유팩 깨끗이 씻어 펼치기",
      icon: "🥛",
      rewardExp: 10,
      rewardMoney: 10,
      desc: "다 마신 우유팩을 물로 헹구고 완전히 펼쳐서 모으기"
    },
    {
      id: 3,
      title: "친구에게 따뜻한 칭찬 한마디",
      icon: "💬",
      rewardExp: 15,
      rewardMoney: 15,
      desc: "오늘 고마웠던 친구나 열심히 한 친구에게 직접 칭찬 전하기"
    },
    {
      id: 4,
      title: "하교 전 책상 서랍 및 바닥 정리",
      icon: "🧹",
      rewardExp: 10,
      rewardMoney: 10,
      desc: "내 자리 주변에 떨어진 지우개 가루와 쓰레기 말끔히 줍기"
    }
  ],

  INITIAL_TRANSACTIONS: [
    { id: 1, studentId: 1, studentName: "김민준", type: "deposit", amount: 50, reason: "1인 1역 주급 지급 (칠판 지우개)", date: "2026-10-01" },
    { id: 2, studentId: 3, studentName: "박도윤", type: "deposit", amount: 100, reason: "학급 미션 릴레이 우수 보너스", date: "2026-10-02" },
    { id: 3, studentId: 5, studentName: "최하준", type: "withdraw", amount: 50, reason: "상점 아이템 구매 (음악 신청권)", date: "2026-10-03" }
  ]
};
