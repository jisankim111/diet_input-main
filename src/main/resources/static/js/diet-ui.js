/* Diet UI Web Re-interpretation
   - Thymeleaf template(legacy markup) 위에 JS로 9개 컴포넌트를 렌더링합니다.
   - 지정된 백엔드 API를 호출해 선택 날짜의 식단/분석 결과를 카드에 반영합니다. */

(function () {
  'use strict';

  const apiBase = (window.DIET_UI && window.DIET_UI.apiBase) ? window.DIET_UI.apiBase : '';

  const monthNamesKo = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const weekdaysKo = ['일', '월', '화', '수', '목', '금', '토'];

  const root = document.getElementById('dietUiRoot');
  if (!root) return;

  const mount = {
    heroSection: document.getElementById('heroSection'),
    featureSection: document.getElementById('featureSection'),
    calendarHeatmap: document.getElementById('calendarHeatmap'),
    calorieRingCard: document.getElementById('calorieRingCard'),
    dailySummaryCard: document.getElementById('dailySummaryCard'),
    nutritionPieChart: document.getElementById('nutritionPieChart'),
    goalPlannerCard: document.getElementById('goalPlannerCard'),
    mealCard: document.getElementById('mealCard'),
    aiInputPanel: document.getElementById('aiInputPanel'),
  };

  const GOAL_TARGETS = {
    male: { cut: 2000, maintain: 2300, bulk: 2600 },
    female: { cut: 1500, maintain: 1800, bulk: 2100 },
  };

  const FEEDBACK_MESSAGES = {
    cut: {
      calorie_high: [
        '감량 목표보다 많은 칼로리를 섭취했습니다.',
        '현재 패턴이 지속되면 체중 감량 속도가 느려질 수 있습니다.',
        '총 섭취량 조절을 권장합니다.',
      ],
      calorie_low: [
        '감량 목표보다 적은 칼로리를 섭취했습니다.',
        '과도한 열량 제한은 지속 가능성이 낮을 수 있습니다.',
        '균형 잡힌 식사를 유지해보세요.',
      ],
      adequate: {
        normal: [
          '감량 목표에 맞는 칼로리를 섭취했습니다.',
          '탄수화물·단백질·지방 비율이 전반적으로 균형적입니다.',
          '현재 식습관을 유지해보세요.',
        ],
        carbs_high: [
          '감량 목표 칼로리 범위 내에서 식사했습니다.',
          '탄수화물 비중이 다소 높게 나타났습니다.',
          '다음 식사에서는 단백질 위주 식품을 추가해보세요.',
        ],
        protein_low: [
          '칼로리 섭취는 적절한 수준입니다.',
          '단백질 섭취량이 부족한 것으로 보입니다.',
          '근육량 유지를 위해 단백질 섭취를 늘려보세요.',
        ],
        fat_high: [
          '감량 목표에 맞게 칼로리를 조절했습니다.',
          '지방 섭취 비율이 권장 범위를 초과했습니다.',
          '튀김류와 가공식품 섭취를 줄여보세요.',
        ],
      },
    },
    maintain: {
      calorie_high: [
        '유지 목표보다 많은 칼로리를 섭취했습니다.',
        '장기간 지속될 경우 체중 증가 가능성이 있습니다.',
        '총 섭취량을 점검해보세요.',
      ],
      calorie_low: [
        '유지 목표보다 적은 칼로리를 섭취했습니다.',
        '에너지 부족으로 피로감을 느낄 수 있습니다.',
        '식사량을 조금 늘려보세요.',
      ],
      adequate: {
        normal: [
          '목표 칼로리를 안정적으로 달성했습니다.',
          '탄단지 비율도 권장 범위에 가깝습니다.',
          '현재 식습관을 유지하는 것을 권장합니다.',
        ],
        carbs_high: [
          '목표 칼로리는 적절하게 달성했습니다.',
          '탄수화물 섭취 비율이 다소 높게 나타났습니다.',
          '단백질 식품 비중을 늘려보세요.',
        ],
        protein_low: [
          '칼로리 섭취는 적정 수준입니다.',
          '단백질 섭취가 부족한 것으로 나타났습니다.',
          '단백질 공급원을 추가해보세요.',
        ],
        fat_high: [
          '전체 칼로리는 적절하게 섭취했습니다.',
          '지방 비율이 권장 범위를 초과했습니다.',
          '견과류, 튀김류 섭취량을 확인해보세요.',
        ],
      },
    },
    bulk: {
      calorie_high: [
        '증량 목표보다 많은 칼로리를 섭취했습니다.',
        '체지방 증가 가능성이 높아질 수 있습니다.',
        '적정 수준의 증량을 유지해보세요.',
      ],
      calorie_low: [
        '증량 목표보다 적은 칼로리를 섭취했습니다.',
        '현재 섭취량으로는 체중 증가가 제한될 수 있습니다.',
        '추가 식사나 간식을 고려해보세요.',
      ],
      adequate: {
        normal: [
          '증량 목표에 적합한 칼로리를 섭취했습니다.',
          '탄단지 비율도 비교적 균형적입니다.',
          '현재 식습관을 유지해보세요.',
        ],
        carbs_low: [
          '증량 목표에 맞는 식사를 진행했습니다.',
          '탄수화물 비율이 다소 부족합니다.',
          '에너지 확보를 위해 탄수화물을 늘려보세요.',
        ],
        protein_low: [
          '칼로리는 충분히 섭취했습니다.',
          '단백질 섭취가 부족해 근육 증가 효율이 낮아질 수 있습니다.',
          '단백질 식품을 추가해보세요.',
        ],
        fat_high: [
          '증량 목표 칼로리는 달성했습니다.',
          '지방 섭취 비율이 높게 나타났습니다.',
          '균형 잡힌 영양소 섭취를 권장합니다.',
        ],
      },
    },
  };

  const state = {
    currentMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    selectedDate: null,
    goalMode: 'maintain', // maintain | cut | bulk
    gender: 'male', // male | female
    monthSummaries: [],
    dietDay: null,
    exercises: [],
    burnedCalories: 0,
    aggregates: {
      totalCalories: 0,
      carbohydrate: 0,
      protein: 0,
      fat: 0,
      foods: [],
      feedback: '',
    },
    pieChart: null,
    burnedChart: null,
  };

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function toYMD(dateObj) {
    const y = dateObj.getFullYear();
    const m = pad2(dateObj.getMonth() + 1);
    const d = pad2(dateObj.getDate());
    return `${y}-${m}-${d}`;
  }

  function fromYMD(ymd) {
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(y, (m - 1), d);
  }

  const dateFmt = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  function formatKoDate(ymd) {
    try {
      return dateFmt.format(fromYMD(ymd));
    } catch (e) {
      return ymd;
    }
  }

  function monthKeyFromDate(dateObj) {
    const y = dateObj.getFullYear();
    const m = pad2(dateObj.getMonth() + 1);
    return `${y}-${m}`;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  async function fetchJson(path, opts) {
    const res = await fetch(apiBase + path, opts);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  function computeAggregatesFromDay(dietDay) {
    const records = dietDay && Array.isArray(dietDay.records) ? dietDay.records : [];

    let totalCalories = 0;
    let carbohydrate = 0;
    let protein = 0;
    let fat = 0;
    let feedback = '';

    const foodsFlat = [];
    for (const r of records) {
      const ar = r && r.analysisResult ? r.analysisResult : null;
      if (ar) {
        totalCalories += Number(ar.totalCalories || 0);
        carbohydrate += Number(ar.carbohydrate || 0);
        protein += Number(ar.protein || 0);
        fat += Number(ar.fat || 0);
        if (!feedback && ar.feedback) feedback = String(ar.feedback);
      }

      const ef = r && r.estimatedFoods ? r.estimatedFoods : [];
      for (const f of (ef || [])) {
        // input-service model uses: foodName / amount / unit
        // analysis-service mock may use: name / count / unit -> make it tolerant.
        const foodName = f.foodName ?? f.name ?? '';
        const amount = Number(f.amount ?? f.count ?? 0);
        const unit = f.unit ?? '';
        if (foodName && amount > 0) foodsFlat.push({ foodName, amount, unit });
      }
    }

    // group foods for the MealCard
    const grouped = new Map();
    for (const item of foodsFlat) {
      const key = `${item.foodName}__${item.unit}`;
      const prev = grouped.get(key) || { foodName: item.foodName, amount: 0, unit: item.unit };
      prev.amount += item.amount;
      grouped.set(key, prev);
    }

    const foods = Array.from(grouped.values()).sort((a, b) => b.amount - a.amount);

    return {
      totalCalories,
      carbohydrate,
      protein,
      fat,
      foods,
      feedback,
    };
  }

  function computeGoal(aggregates, mode, gender) {
    const genderKey = gender === 'female' ? 'female' : 'male';
    const modeKey = mode === 'cut' || mode === 'bulk' ? mode : 'maintain';
    const targetCalories = GOAL_TARGETS[genderKey][modeKey];

    const actual = Number(aggregates.totalCalories || 0);
    const ratio = actual > 0 ? targetCalories / actual : 1;

    const carbT = Math.round(Number(aggregates.carbohydrate || 0) * ratio);
    const proteinT = Math.round(Number(aggregates.protein || 0) * ratio);
    const fatT = Math.round(Number(aggregates.fat || 0) * ratio);

    return {
      targetCalories,
      macroTargets: {
        carbohydrate: carbT,
        protein: proteinT,
        fat: fatT,
      },
    };
  }

  function goalModeLabel(mode) {
    if (mode === 'cut') return '감량';
    if (mode === 'bulk') return '증량';
    return '유지';
  }

  function getCalorieStatus(actual, target) {
    if (target <= 0) return 'adequate';
    const ratio = actual / target;
    if (ratio < 0.85) return 'low';
    if (ratio > 1.10) return 'high';
    return 'adequate';
  }

  function getMacroStatus(carbs, protein, fat, goalMode) {
    const carbKcal = carbs * 4;
    const proteinKcal = protein * 4;
    const fatKcal = fat * 9;
    const total = carbKcal + proteinKcal + fatKcal;
    if (total <= 0) return 'normal';

    const carbPct = carbKcal / total;
    const proteinPct = proteinKcal / total;
    const fatPct = fatKcal / total;

    if (goalMode === 'bulk' && carbPct < 0.40) return 'carbs_low';
    if (carbPct > 0.55) return 'carbs_high';
    if (proteinPct < 0.20) return 'protein_low';
    if (fatPct > 0.35) return 'fat_high';
    return 'normal';
  }

  function adaptFeedbackForFemale(lines, goalMode) {
    return lines.map((line) => {
      let text = line;
      if (goalMode === 'cut') {
        text = text.replace(/감량/g, '체중 감량');
      }
      if (goalMode === 'bulk') {
        text = text.replace(/근육 증가/g, '체중 증가');
      }
      return text;
    });
  }

  function computeAiFeedback(aggregates, goalMode, gender) {
    const goal = computeGoal(aggregates, goalMode, gender);
    const actual = Number(aggregates.totalCalories || 0);
    const carbs = Number(aggregates.carbohydrate || 0);
    const protein = Number(aggregates.protein || 0);
    const fat = Number(aggregates.fat || 0);

    if (actual <= 0 && (carbs + protein + fat) <= 0) {
      return [
        '식단 기록이 없어 피드백을 생성할 수 없습니다.',
        '사진을 업로드하면 목표 모드에 맞는 맞춤 피드백이 표시됩니다.',
      ];
    }

    const modeKey = goalMode === 'cut' || goalMode === 'bulk' ? goalMode : 'maintain';
    const modeMessages = FEEDBACK_MESSAGES[modeKey];
    const calorieStatus = getCalorieStatus(actual, goal.targetCalories);

    let lines;
    if (calorieStatus === 'high') {
      lines = modeMessages.calorie_high;
    } else if (calorieStatus === 'low') {
      lines = modeMessages.calorie_low;
    } else {
      const macroStatus = getMacroStatus(carbs, protein, fat, modeKey);
      lines = modeMessages.adequate[macroStatus] || modeMessages.adequate.normal;
    }

    if (gender === 'female') {
      lines = adaptFeedbackForFemale(lines, modeKey);
    }

    return lines;
  }

  function bindGoalControls(container) {
    if (!container) return;

    container.querySelectorAll('button.segBtn[data-mode]').forEach((button) => {
      button.addEventListener('click', () => {
        const next = button.dataset.mode;
        if (next) state.goalMode = next;
        renderAllCards();
      });
    });

    container.querySelectorAll('button.segBtn[data-gender]').forEach((button) => {
      button.addEventListener('click', () => {
        const next = button.dataset.gender;
        if (next) state.gender = next;
        renderAllCards();
      });
    });
  }

  function mountMacroPieChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const a = state.aggregates;
    const carbs = Number(a.carbohydrate || 0);
    const protein = Number(a.protein || 0);
    const fat = Number(a.fat || 0);
    const sum = carbs + protein + fat;

    if (state.pieChart && typeof state.pieChart.destroy === 'function') {
      state.pieChart.destroy();
      state.pieChart = null;
    }

    if (sum <= 0) {
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const ctx = canvas.getContext('2d');
    state.pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['탄수', '단백', '지방'],
        datasets: [{
          data: [carbs, protein, fat],
          backgroundColor: [
            'rgba(16, 185, 129, 0.85)',
            'rgba(168, 85, 247, 0.80)',
            'rgba(142, 142, 147, 0.65)',
          ],
          borderColor: 'rgba(0,0,0,0)',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const v = context.parsed || 0;
                const label = context.label || '';
                const pct = sum > 0 ? Math.round((v / sum) * 100) : 0;
                return `${label}: ${v}g (${pct}%)`;
              },
            },
          },
        },
      },
    });
  }

  function mountBurnedCaloriesChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (state.burnedChart && typeof state.burnedChart.destroy === 'function') {
      state.burnedChart.destroy();
      state.burnedChart = null;
    }

    const selDate = state.selectedDate ? fromYMD(state.selectedDate) : new Date();
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(selDate);
      d.setDate(selDate.getDate() - i);
      dates.push(toYMD(d));
    }

    const summaryMap = new Map((state.monthSummaries || []).map((s) => [s.date, s]));
    const dataValues = dates.map((dKey) => {
      if (dKey === state.selectedDate) {
        return Number(state.burnedCalories || 0);
      }
      const s = summaryMap.get(dKey);
      return s ? Number(s.burnedCalories || 0) : 0;
    });

    const labels = dates.map((dKey) => {
      try {
        const d = fromYMD(dKey);
        return `${d.getMonth() + 1}/${d.getDate()}`;
      } catch (e) {
        return dKey;
      }
    });

    const backgroundColors = dates.map((dKey) => {
      return dKey === state.selectedDate ? 'rgba(239, 68, 68, 0.9)' : 'rgba(239, 68, 68, 0.35)';
    });

    const ctx = canvas.getContext('2d');
    state.burnedChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: dataValues,
          backgroundColor: backgroundColors,
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `${context.parsed.y || 0} kcal`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { size: 10 },
              color: '#86868b',
            },
          },
          y: {
            grid: { color: '#e5e5e7', drawBorder: false },
            ticks: {
              font: { size: 9 },
              color: '#86868b',
              maxTicksLimit: 4,
            },
          },
        },
      },
    });
  }

  function clearMount(el) {
    if (!el) return;
    el.innerHTML = '';
  }

  function renderHero() {
    if (!mount.heroSection) return;

    mount.heroSection.innerHTML = `
      <div class="heroGrid">
        <div>
          <div class="brandPill"><span class="brandDot"></span>Diet AI</div>
          <h1 class="heroTitle">사진 한 장으로</h1>
          <div class="heroSub">오늘의 식단을 정갈하게 기록</div>
          <p class="heroDesc">
            날짜 기반 캘린더에서 직관적으로 오늘의 식단을 기록하고, AI 분석 결과를 정교한 대시보드로 한눈에 확인하세요.
          </p>
          <div class="ctaRow">
            <button class="btn btnPrimary" id="ctaScrollToApp" type="button">식단 관리 시작</button>
            <button class="btn btnSecondary" id="ctaRandomDay" type="button">최근 기록 날짜 보기</button>
          </div>
        </div>
      </div>
    `;

    const btnScroll = document.getElementById('ctaScrollToApp');
    if (btnScroll) {
      btnScroll.addEventListener('click', () => {
        const el = mount.aiInputPanel || mount.calendarHeatmap;
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    const btnRandom = document.getElementById('ctaRandomDay');
    if (btnRandom) {
      btnRandom.addEventListener('click', () => {
        // Pick a day with records if available.
        const monthKey = monthKeyFromDate(state.currentMonth);
        const list = (state.monthSummaries || []).filter((x) => x && x.totalCalories > 0);
        if (list.length > 0) {
          const pick = list[Math.floor(Math.random() * list.length)];
          if (pick && pick.date) {
            state.selectedDate = pick.date;
            loadDayAndRender(state.selectedDate);
          }
        } else {
          // fallback: today
          const today = toYMD(new Date());
          state.selectedDate = today;
          loadDayAndRender(today);
        }
      });
    }
  }

  function renderFeature() {
    if (!mount.featureSection) return;

    mount.featureSection.innerHTML = `
      <div class="featureGrid">
        <div class="glass cardPad featureCard featureCard" style="background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03));">
          <div class="featureIcon">📸</div>
          <div class="featureTitle">사진 업로드 → 자동 요약</div>
          <p class="featureDesc">접시 사진을 올리면 칼로리와 탄단지가 추정되고, 기록이 캘린더에 반영됩니다.</p>
        </div>
        <div class="glass cardPad featureCard" style="background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03));">
          <div class="featureIcon">🗓️</div>
          <div class="featureTitle">월 히트맵 캘린더</div>
          <p class="featureDesc">날짜별 칼로리 강도를 색으로 표현합니다. 클릭하면 바로 상세 카드로 이동합니다.</p>
        </div>
        <div class="glass cardPad featureCard" style="background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03));">
          <div class="featureIcon">🎯</div>
          <div class="featureTitle">목표 플래너</div>
          <p class="featureDesc">유지/감량/증량 모드에 따라 목표 칼로리를 파생 계산하고, 진행률을 링으로 확인합니다.</p>
        </div>
      </div>
    `;
  }

  function renderCalendarHeatmap() {
    if (!mount.calendarHeatmap) return;

    const monthKey = monthKeyFromDate(state.currentMonth);
    const year = state.currentMonth.getFullYear();
    const mIndex = state.currentMonth.getMonth();
    const monthLabel = `${year}년 ${monthNamesKo[mIndex]}`;

    const monthMax = Math.max(1, ...((state.monthSummaries || []).map((x) => Number(x.totalCalories || 0))));

    const firstDay = new Date(year, mIndex, 1).getDay();
    const daysInMonth = new Date(year, mIndex + 1, 0).getDate();

    const summaryMap = new Map((state.monthSummaries || []).map((s) => [s.date, s]));

    mount.calendarHeatmap.innerHTML = `
      <div class="heatmapHeaderRow">
        <div class="heatmapTitle">
          <div class="monthLabel">${monthLabel}</div>
          <div class="monthSub">초록: 섭취 · 빨강: 운동 소모 칼로리</div>
        </div>
        <div class="miniBtns">
          <button type="button" class="miniBtn" id="prevMonthBtn">이전</button>
          <button type="button" class="miniBtn" id="todayJumpBtn">오늘</button>
          <button type="button" class="miniBtn" id="nextMonthBtn">다음</button>
        </div>
      </div>
      <div class="weekdayRow">
        ${weekdaysKo.map((d) => `<div class="weekdayCell">${d}</div>`).join('')}
      </div>
      <div class="heatmapGrid" id="heatmapGrid"></div>
    `;

    const gridEl = document.getElementById('heatmapGrid');
    if (!gridEl) return;
    gridEl.innerHTML = '';

    for (let i = 0; i < firstDay; i++) {
      const cell = document.createElement('div');
      cell.className = 'heatCell empty';
      gridEl.appendChild(cell);
    }

    function backgroundForIntensity(intensity) {
      const a = 0.1 + 0.45 * intensity;
      return `rgba(16, 185, 129, ${a})`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${monthKey}-${pad2(day)}`;
      const summary = summaryMap.get(dateKey);
      const recordCount = summary ? Number(summary.recordCount || 0) : 0;
      const kcal = summary ? Number(summary.totalCalories || 0) : 0;
      const burned = summary ? Number(summary.burnedCalories || 0) : 0;
      const hasDiet = recordCount > 0;
      const hasExercise = burned > 0;

      const intensity = monthMax > 0 ? Math.max(0, Math.min(1, kcal / monthMax)) : 0;

      const cell = document.createElement('div');
      cell.className = 'heatCell';
      cell.dataset.date = dateKey;
      cell.style.background = hasDiet ? backgroundForIntensity(intensity) : 'rgba(255,255,255,0.03)';

      if (hasDiet) cell.classList.add('has');
      if (hasExercise) cell.classList.add('has-exercise');
      if (dateKey === state.selectedDate) cell.classList.add('selected');
      if (!hasDiet && !hasExercise) {
        cell.style.opacity = '0.35';
      } else {
        cell.style.opacity = '1';
      }

      const consumedLine = hasDiet ? `<div class="heatKcal heatConsumed">+${kcal}</div>` : '';
      const burnedLine = hasExercise ? `<div class="heatKcal heatBurned">-${burned}</div>` : '';

      cell.innerHTML = `
        <div class="heatDayNum">${day}</div>
        ${consumedLine}
        ${burnedLine}
      `;

      cell.addEventListener('click', () => {
        // record 유무와 상관없이 날짜 선택은 항상 가능하게 합니다.
        state.selectedDate = dateKey;
        loadDayAndRender(state.selectedDate, { keepMonth: true });
      });

      gridEl.appendChild(cell);
    }

    const prevBtn = document.getElementById('prevMonthBtn');
    if (prevBtn) {
      prevBtn.addEventListener('click', async () => {
        const newDate = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth() - 1, 1);
        state.currentMonth = newDate;
        await loadMonthAndRender();
        const newMonthKey = monthKeyFromDate(state.currentMonth);
        if (state.selectedDate && state.selectedDate.startsWith(newMonthKey + '-')) {
          await loadDayAndRender(state.selectedDate, { keepMonth: true });
        } else {
          await loadDayAndRender(`${newMonthKey}-${pad2(1)}`, { keepMonth: true });
        }
      });
    }

    const nextBtn = document.getElementById('nextMonthBtn');
    if (nextBtn) {
      nextBtn.addEventListener('click', async () => {
        const newDate = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth() + 1, 1);
        state.currentMonth = newDate;
        await loadMonthAndRender();
        const newMonthKey = monthKeyFromDate(state.currentMonth);
        if (state.selectedDate && state.selectedDate.startsWith(newMonthKey + '-')) {
          await loadDayAndRender(state.selectedDate, { keepMonth: true });
        } else {
          await loadDayAndRender(`${newMonthKey}-${pad2(1)}`, { keepMonth: true });
        }
      });
    }

    const todayBtn = document.getElementById('todayJumpBtn');
    if (todayBtn) {
      todayBtn.addEventListener('click', async () => {
        const today = new Date();
        state.currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        state.selectedDate = toYMD(today);
        await loadMonthAndRender();
        await loadDayAndRender(state.selectedDate);
      });
    }
  }

  function renderCalorieRingCard() {
    if (!mount.calorieRingCard) return;

    const aggregates = state.aggregates;
    const goal = computeGoal(aggregates, state.goalMode, state.gender);

    const actual = Number(aggregates.totalCalories || 0);
    const target = Number(goal.targetCalories || 0);
    const progress = target > 0 ? Math.max(0, Math.min(1, actual / target)) : 0;

    const burned = Number(state.burnedCalories || 0);
    let targetBurned = 300;
    if (state.gender === 'female') {
      if (state.goalMode === 'cut') targetBurned = 400;
      else if (state.goalMode === 'bulk') targetBurned = 150;
      else targetBurned = 250;
    } else {
      if (state.goalMode === 'cut') targetBurned = 500;
      else if (state.goalMode === 'bulk') targetBurned = 200;
      else targetBurned = 300;
    }
    const progressBurned = targetBurned > 0 ? Math.max(0, Math.min(1, burned / targetBurned)) : 0;

    const carbs = Number(aggregates.carbohydrate || 0);
    const protein = Number(aggregates.protein || 0);
    const fat = Number(aggregates.fat || 0);
    const macroSum = carbs + protein + fat;

    const ringSize = 130;
    const stroke = 10;
    const r = (ringSize - stroke) / 2;
    const c = 2 * Math.PI * r;
    const dash = c * (1 - progress);
    const dashBurned = c * (1 - progressBurned);

    const gradId = `ringGrad_${state.goalMode}_${state.gender}`;
    const gradBurnedId = `ringGradBurned_${state.goalMode}_${state.gender}`;

    mount.calorieRingCard.innerHTML = `
      <div class="cardHeader">
        <div>
          <div class="kicker">Calorie Ring</div>
          <div class="cardTitle">오늘의 진행률</div>
        </div>
        <div class="kicker" style="text-align:right">${goalModeLabel(state.goalMode)} · ${state.gender === 'female' ? '여성' : '남성'}</div>
      </div>

      <div class="ringStackVertical">
        <div class="ringDateRow">
          <div class="ringDateLabel">선택 날짜</div>
          <div class="ringDateValue">${escapeHtml(formatKoDate(state.selectedDate || toYMD(new Date())))}</div>
        </div>

        <div class="ringFlexRow">
          <div class="ringChartWrapper">
            <div class="ringChartTitle">섭취 칼로리</div>
            <div class="ringChart" style="width: ${ringSize}px; height: ${ringSize}px;">
              <svg width="${ringSize}" height="${ringSize}" viewBox="0 0 ${ringSize} ${ringSize}">
                <defs>
                  <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="rgba(16, 185, 129, 0.95)"/>
                    <stop offset="100%" stop-color="rgba(168, 85, 247, 0.85)"/>
                  </linearGradient>
                </defs>
                <circle cx="${ringSize / 2}" cy="${ringSize / 2}" r="${r}" stroke="#e5e7eb" stroke-width="${stroke}" fill="none"/>
                <circle
                  cx="${ringSize / 2}" cy="${ringSize / 2}" r="${r}"
                  stroke="url(#${gradId})"
                  stroke-width="${stroke}"
                  fill="none"
                  stroke-linecap="round"
                  stroke-dasharray="${c}"
                  stroke-dashoffset="${dash}"
                  transform="rotate(-90 ${ringSize / 2} ${ringSize / 2})"
                  style="transition: stroke-dashoffset 400ms ease;"
                />
              </svg>
              <div class="ringCenterText">
                <span style="font-size: 9px; color: var(--muted); font-weight: 700;">섭취</span>
                <strong style="font-size: 19px; display: block; margin: 1px 0;">${actual || 0}<span style="font-size: 10px; font-weight: 600;"> kcal</span></strong>
                <span style="font-size: 9px; color: var(--muted); font-weight: 600;">목표 ${target || 0}</span>
              </div>
            </div>
          </div>

          <div class="ringChartWrapper">
            <div class="ringChartTitle">소모 칼로리</div>
            <div class="ringChart" style="width: ${ringSize}px; height: ${ringSize}px;">
              <svg width="${ringSize}" height="${ringSize}" viewBox="0 0 ${ringSize} ${ringSize}">
                <defs>
                  <linearGradient id="${gradBurnedId}" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="rgba(239, 68, 68, 0.95)"/>
                    <stop offset="100%" stop-color="rgba(249, 115, 22, 0.85)"/>
                  </linearGradient>
                </defs>
                <circle cx="${ringSize / 2}" cy="${ringSize / 2}" r="${r}" stroke="#e5e7eb" stroke-width="${stroke}" fill="none"/>
                <circle
                  cx="${ringSize / 2}" cy="${ringSize / 2}" r="${r}"
                  stroke="url(#${gradBurnedId})"
                  stroke-width="${stroke}"
                  fill="none"
                  stroke-linecap="round"
                  stroke-dasharray="${c}"
                  stroke-dashoffset="${dashBurned}"
                  transform="rotate(-90 ${ringSize / 2} ${ringSize / 2})"
                  style="transition: stroke-dashoffset 400ms ease;"
                />
              </svg>
              <div class="ringCenterText">
                <span style="font-size: 9px; color: var(--danger); font-weight: 700;">소모</span>
                <strong style="font-size: 19px; color: var(--danger); display: block; margin: 1px 0;">${burned || 0}<span style="font-size: 10px; font-weight: 600;"> kcal</span></strong>
                <span style="font-size: 9px; color: var(--muted); font-weight: 600;">목표 ${targetBurned}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="piePanel piePanelVertical">
          <div class="piePanelTitle">탄단지 비율</div>
          <div class="pieCanvasWrap pieCanvasWrapCentered">
            <canvas id="macroPieCanvasRing" height="180"></canvas>
          </div>
          <div class="pieLegend pieLegendCentered">
            ${[
              { v: carbs, t: '탄수', c: 'rgba(16, 185, 129, 0.95)' },
              { v: protein, t: '단백', c: 'rgba(168, 85, 247, 0.95)' },
              { v: fat, t: '지방', c: 'rgba(142, 142, 147, 0.85)' },
            ].map((x) => {
              const pct = macroSum > 0 ? Math.round((x.v / macroSum) * 100) : 0;
              return `
                <div class="pieLegendItem">
                  <span class="pieLegendDot" style="background:${x.c}"></span>
                  <span class="pieLegendName">${x.t}</span>
                  <span class="pieLegendVal">${x.v}g (${pct}%)</span>
                </div>
              `;
            }).join('')}
          </div>
          ${macroSum <= 0 ? '<div class="pieEmptyHint">식단 기록이 있으면 탄단지 비율이 표시됩니다.</div>' : ''}
        </div>

        ${buildAiFeedbackHtml()}
      </div>
    `;

    mountMacroPieChart('macroPieCanvasRing');
  }

  function buildAiFeedbackHtml() {
    const lines = computeAiFeedback(state.aggregates, state.goalMode, state.gender);
    const calorieStatus = getCalorieStatus(
      Number(state.aggregates.totalCalories || 0),
      computeGoal(state.aggregates, state.goalMode, state.gender).targetCalories
    );
    const macroStatus = getMacroStatus(
      Number(state.aggregates.carbohydrate || 0),
      Number(state.aggregates.protein || 0),
      Number(state.aggregates.fat || 0),
      state.goalMode
    );

    const statusLabels = {
      low: '칼로리 부족',
      adequate: '칼로리 적정',
      high: '칼로리 초과',
    };
    const macroLabels = {
      normal: '탄단지 정상',
      carbs_high: '탄수 과다',
      carbs_low: '탄수 부족',
      protein_low: '단백질 부족',
      fat_high: '지방 과다',
    };

    const macroTag = calorieStatus === 'adequate'
      ? `<span class="aiFeedbackTag">${macroLabels[macroStatus] || '—'}</span>`
      : '';

    return `
      <div class="aiFeedbackInline">
        <div class="aiFeedbackInlineHeader">
          <div class="aiFeedbackInlineTitle">AI 피드백</div>
          <div class="aiFeedbackTags">
            <span class="aiFeedbackTag">${goalModeLabel(state.goalMode)}</span>
            <span class="aiFeedbackTag">${statusLabels[calorieStatus] || '—'}</span>
            ${macroTag}
          </div>
        </div>
        <div class="feedbackLines feedbackLinesCompact">
          ${lines.map((line) => `<p class="feedbackLine">${escapeHtml(line)}</p>`).join('')}
        </div>
      </div>
    `;
  }

  function renderDailySummaryCard() {
    if (!mount.dailySummaryCard) return;

    const a = state.aggregates;
    const goal = computeGoal(a, state.goalMode, state.gender);
    const actual = Number(a.totalCalories || 0);
    const burned = Number(state.burnedCalories || 0);
    const net = actual - burned;
    const exercises = state.exercises || [];
    const exerciseList = exercises.map((item, index) => `
      <div class="exerciseItem">
        <div class="exerciseItemMain">
          <strong class="exerciseName">${escapeHtml(item.exerciseName || '운동')}</strong>
          <span class="exerciseMeta">${Number(item.duration || 0)}분 · ${Number(item.caloriesBurned || 0)} kcal</span>
        </div>
        <div class="exerciseActions">
          ${item.intensity ? `<span class="exerciseIntensity">${escapeHtml(item.intensity)}</span>` : ''}
          <button class="exerciseDeleteBtn" type="button" data-exercise-index="${index}" aria-label="운동 삭제">삭제</button>
        </div>
      </div>
    `).join('');

    mount.dailySummaryCard.innerHTML = `
      <div class="cardHeader">
        <div>
          <div class="kicker">Daily Summary</div>
          <div class="cardTitle">목표 모드</div>
        </div>
        <div class="kicker">${state.selectedDate ? '선택됨' : '—'}</div>
      </div>

      <div class="goalControlBlock">
        <div class="goalControlLabel">성별</div>
        <div class="segmented" role="tablist" aria-label="gender">
          <button type="button" class="segBtn ${state.gender === 'male' ? 'active' : ''}" data-gender="male">남</button>
          <button type="button" class="segBtn ${state.gender === 'female' ? 'active' : ''}" data-gender="female">여</button>
        </div>
      </div>

      <div class="goalControlBlock">
        <div class="goalControlLabel">모드</div>
        <div class="segmented" role="tablist" aria-label="goal mode">
          <button type="button" class="segBtn ${state.goalMode === 'cut' ? 'active' : ''}" data-mode="cut">감량</button>
          <button type="button" class="segBtn ${state.goalMode === 'maintain' ? 'active' : ''}" data-mode="maintain">유지</button>
          <button type="button" class="segBtn ${state.goalMode === 'bulk' ? 'active' : ''}" data-mode="bulk">증량</button>
        </div>
      </div>

      <div class="goalTargetBox">
        <div class="goalTargetLabel">목표 칼로리</div>
        <div class="goalTargetValue">${goal.targetCalories} kcal</div>
        <div class="goalTargetHint">${state.gender === 'female' ? '여성' : '남성'} · ${goalModeLabel(state.goalMode)} 기준</div>
      </div>

      <div class="bigKcal">
        ${actual || 0} kcal
        <span>${state.selectedDate ? escapeHtml(formatKoDate(state.selectedDate)) : '날짜 선택 필요'}</span>
      </div>

      <div class="summaryStatRow">
        <div class="macroItem summaryStatBurn">
          <div class="val">${burned}</div>
          <div class="lab">소모 (kcal)</div>
        </div>
        <div class="macroItem summaryStatNet">
          <div class="val">${net}</div>
          <div class="lab">순 섭취 (kcal)</div>
        </div>
      </div>

      <div class="exercisePanel">
        <div class="exercisePanelTitle">오늘 운동 (${exercises.length}개)</div>
        ${exerciseList ? `<div class="exerciseList">${exerciseList}</div>` : '<div class="exerciseEmpty">저장된 운동이 없습니다.</div>'}
        <form class="exerciseForm" id="exerciseForm">
          <input class="input exerciseInput" id="exerciseNameInput" name="exerciseName" type="text" placeholder="운동명 예: 빠른 걷기" autocomplete="off">
          <input class="input exerciseInput" id="exerciseDurationInput" name="duration" type="number" min="1" placeholder="시간(분)">
          <input class="input exerciseInput" id="exerciseCaloriesInput" name="caloriesBurned" type="number" min="0" placeholder="소모 kcal">
          <select class="input exerciseInput" id="exerciseIntensityInput" name="intensity">
            <option value="낮음">낮음</option>
            <option value="중간" selected>중간</option>
            <option value="높음">높음</option>
          </select>
          <button class="btn btnSecondary exerciseSaveBtn" type="submit">운동 저장</button>
        </form>
        <div class="exerciseStatus" id="exerciseStatusLine"></div>
      </div>
    `;

    bindGoalControls(mount.dailySummaryCard);
    bindExerciseForm();
    bindExerciseDeleteButtons();
  }

  function bindExerciseForm() {
    const form = document.getElementById('exerciseForm');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const statusLine = document.getElementById('exerciseStatusLine');
      const nameInput = document.getElementById('exerciseNameInput');
      const durationInput = document.getElementById('exerciseDurationInput');
      const caloriesInput = document.getElementById('exerciseCaloriesInput');
      const intensityInput = document.getElementById('exerciseIntensityInput');

      const exerciseName = nameInput && nameInput.value ? nameInput.value.trim() : '';
      const duration = Number(durationInput && durationInput.value ? durationInput.value : 0);
      const caloriesBurned = Number(caloriesInput && caloriesInput.value ? caloriesInput.value : 0);
      const intensity = intensityInput && intensityInput.value ? intensityInput.value : '중간';

      if (!state.selectedDate) {
        if (statusLine) statusLine.textContent = '날짜를 먼저 선택해 주세요.';
        return;
      }
      if (!exerciseName || duration <= 0) {
        if (statusLine) statusLine.textContent = '운동명과 운동 시간을 입력해 주세요.';
        return;
      }

      try {
        if (statusLine) statusLine.textContent = '운동 저장 중...';
        const resp = await fetch(apiBase + '/api/exercises', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            exerciseName,
            duration,
            caloriesBurned,
            date: state.selectedDate,
            intensity,
          }),
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        form.reset();
        if (intensityInput) intensityInput.value = '중간';
        await loadMonthAndRender();
        await loadDayAndRender(state.selectedDate, { keepMonth: true });
      } catch (e) {
        if (statusLine) statusLine.textContent = '저장 실패: ' + e.message;
      }
    });
  }

  function bindExerciseDeleteButtons() {
    const buttons = document.querySelectorAll('button.exerciseDeleteBtn[data-exercise-index]');
    buttons.forEach((button) => {
      button.addEventListener('click', async () => {
        const statusLine = document.getElementById('exerciseStatusLine');
        const index = Number(button.dataset.exerciseIndex);
        if (!state.selectedDate || Number.isNaN(index)) {
          if (statusLine) statusLine.textContent = '삭제할 운동을 찾을 수 없습니다.';
          return;
        }

        try {
          if (statusLine) statusLine.textContent = '운동 삭제 중...';
          const resp = await fetch(
            apiBase + `/api/exercises/${encodeURIComponent(state.selectedDate)}/${encodeURIComponent(index)}`,
            { method: 'DELETE' }
          );
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

          await loadMonthAndRender();
          await loadDayAndRender(state.selectedDate, { keepMonth: true });
        } catch (e) {
          if (statusLine) statusLine.textContent = '삭제 실패: ' + e.message;
        }
      });
    });
  }

  function renderNutritionPieChart() {
    if (mount.nutritionPieChart) {
      mount.nutritionPieChart.innerHTML = '';
    }
  }

  function renderGoalPlannerCard() {
    if (mount.goalPlannerCard) {
      mount.goalPlannerCard.innerHTML = '';
    }
  }

  function renderMealCard() {
    if (!mount.mealCard) return;

    const foods = state.aggregates.foods || [];

    const listTop = foods.slice(0, 8);

    mount.mealCard.innerHTML = `
      <div class="cardHeader">
        <div>
          <div class="kicker">Meal Card</div>
          <div class="cardTitle">선택 날짜의 식단 항목</div>
        </div>
        <div class="kicker">${state.selectedDate ? formatKoDateShort(state.selectedDate) : '—'}</div>
      </div>

      ${
        listTop.length > 0
          ? `<div class="mealList">
              ${listTop
                .map(
                  (f) => `
                    <div class="mealRow">
                      <div style="display:flex;flex-direction:column;gap:4px;min-width:0">
                        <div class="mealName" title="${escapeHtml(f.foodName)}">${escapeHtml(f.foodName)}</div>
                        <div style="color:rgba(255,255,255,0.55);font-weight:900;font-size:12px">기록 항목</div>
                      </div>
                      <div class="mealAmt">${Math.round(f.amount)} ${escapeHtml(f.unit || '')}</div>
                    </div>
                  `
                )
                .join('')}
            </div>`
          : `<div class="emptyState">선택한 날짜에 기록된 식단이 없습니다.</div>`
      }
    `;
  }

  function formatKoDateShort(ymd) {
    try {
      const d = fromYMD(ymd);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    } catch (e) {
      return ymd;
    }
  }

  function renderAIInputPanel() {
    if (!mount.aiInputPanel) return;

    mount.aiInputPanel.innerHTML = `
      <div class="cardHeader">
        <div>
          <div class="kicker">AI Input</div>
          <div class="cardTitle">사진 업로드</div>
        </div>
        <div class="kicker">선택 날짜: ${state.selectedDate ? escapeHtml(formatKoDate(state.selectedDate)) : '—'}</div>
      </div>

      <div class="aiPanelForm">
        <div class="fileRow">
          <div class="fileBox">
            <div class="fieldLabel">사진 업로드</div>
            <input id="dietPhotoInput" class="input" type="file" accept="image/*" style="padding:10px">
            <div class="fileHint">정면에서 찍은 접시 사진을 올려주세요. 업로드 후 해당 날짜의 카드가 갱신됩니다.</div>
            <div class="statusLine" id="uploadStatusLine">대기 중</div>
          </div>
          <div style="flex:0 0 260px;min-width:260px">
            <div class="fieldLabel">분석 진행</div>
            <div style="margin-top:10px;display:flex;flex-direction:column;gap:12px">
              <button type="button" class="btn btnPrimary" id="uploadDietBtn">사진 업로드 및 분석</button>
              <button type="button" class="btn btnSecondary" id="clearSelectedBtn">선택 날짜 유지</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const input = document.getElementById('dietPhotoInput');
    const statusLine = document.getElementById('uploadStatusLine');
    const uploadBtn = document.getElementById('uploadDietBtn');
    const clearBtn = document.getElementById('clearSelectedBtn');

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        // keep selection; just reset UI line
        if (statusLine) statusLine.textContent = '대기 중';
      });
    }

    if (uploadBtn) {
      uploadBtn.addEventListener('click', async () => {
        const file = input && input.files && input.files[0] ? input.files[0] : null;
        if (!file) {
          alert('사진을 선택해 주세요.');
          return;
        }
        if (!state.selectedDate) {
          alert('날짜를 선택해 주세요.');
          return;
        }

        try {
          if (statusLine) statusLine.textContent = '업로드 중...';

          const fd = new FormData();
          fd.append('date', state.selectedDate);
          fd.append('image', file);
          const resp = await fetch(apiBase + '/api/diets/photo', { method: 'POST', body: fd });
          if (!resp.ok) throw new Error('업로드 실패');

          if (statusLine) statusLine.textContent = '업로드 완료. 카드 갱신 중...';

          await loadMonthAndRender();
          await loadDayAndRender(state.selectedDate, { keepMonth: true });
          if (statusLine) statusLine.textContent = '완료!';
        } catch (e) {
          if (statusLine) statusLine.textContent = '오류: ' + e.message;
          alert('업로드 중 오류가 발생했습니다.');
        }
      });
    }

  }

  function renderAllCards() {
    renderCalorieRingCard();
    renderDailySummaryCard();
    renderNutritionPieChart();
    renderGoalPlannerCard();
    renderMealCard();
    renderAIInputPanel();
  }

  async function loadMonth() {
    const key = monthKeyFromDate(state.currentMonth);
    try {
      const data = await fetchJson(`/api/diets?month=${encodeURIComponent(key)}`);
      state.monthSummaries = Array.isArray(data.summaries) ? data.summaries : [];
    } catch (e) {
      state.monthSummaries = [];
    }
  }

  async function loadExercises(dateKey) {
    try {
      const exercises = await fetchJson(`/api/exercises/${encodeURIComponent(dateKey)}`);
      state.exercises = Array.isArray(exercises) ? exercises : [];
      state.burnedCalories = state.exercises.reduce((sum, item) => sum + Number(item.caloriesBurned || 0), 0);
    } catch (e) {
      state.exercises = [];
      state.burnedCalories = 0;
    }
  }

  async function loadDay(dateKey) {
    try {
      const data = await fetchJson(`/api/diets/${encodeURIComponent(dateKey)}`);
      state.dietDay = data;
      state.aggregates = computeAggregatesFromDay(data);
    } catch (e) {
      state.dietDay = null;
      state.aggregates = {
        totalCalories: 0,
        carbohydrate: 0,
        protein: 0,
        fat: 0,
        foods: [],
        feedback: '',
      };
    }

    await loadExercises(dateKey);
  }

  async function loadMonthAndRender() {
    await loadMonth();
    renderCalendarHeatmap();
  }

  async function loadDayAndRender(dateKey, opts) {
    // opts.keepMonth reserved for potential future enhancements
    state.selectedDate = dateKey;
    await loadDay(dateKey);
    renderAllCards();
    renderCalendarHeatmap();
  }

  async function init() {
    state.selectedDate = toYMD(new Date());

    renderHero();
    renderFeature();

    await loadMonthAndRender();

    // Ensure selected day is within current month heatmap context (optional).
    const selectedMonth = state.selectedDate.slice(0, 7);
    const curMonthKey = monthKeyFromDate(state.currentMonth);
    if (selectedMonth !== curMonthKey) {
      // If mismatch, we still load day based on selectedDate for cards.
      await loadDay(state.selectedDate);
    }
    await loadDay(state.selectedDate);

    renderCalendarHeatmap();
    renderAllCards();

    // Reduce double rendering while old legacy code is hidden.
    // (Legacy script still runs, but our mount nodes are independent.)
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Mount can be loaded before chart.js in rare cases; Chart.js is synchronous from CDN script.
    init();
  });
})();
