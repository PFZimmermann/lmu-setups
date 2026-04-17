const classes = {
  Hypercar: [
    "Toyota GR010",
    "Porsche 963",
    "Ferrari 499P",
    "Cadillac V-Series.R",
    "Peugeot 9X8",
    "BMW M Hybrid V8",
    "Alpine A424",
    "Lamborghini SC63"
  ],
  LMP2: ["Oreca 07 Gibson"],
  LMP3: ["Ligier JS P320"],
  GT3: [
    "Porsche 911 GT3 R",
    "Ferrari 296 GT3",
    "BMW M4 GT3",
    "Lamborghini Huracán GT3 EVO2",
    "Mercedes-AMG GT3",
    "Aston Martin Vantage GT3",
    "Corvette Z06 GT3.R",
    "McLaren 720S GT3 EVO",
    "Ford Mustang GT3"
  ]
};

const tracks = [
  { id: "lemans", nome: "Le Mans (Circuit de la Sarthe)", perfil: "velocidade", dica: "Baixo arrasto ajuda na reta, mas mantenha estabilidade no Porsche Curves." },
  { id: "spa", nome: "Spa-Francorchamps", perfil: "tecnica", dica: "Poupe traseiros em stint longo e mantenha confiança em alta no setor 2." },
  { id: "monza", nome: "Monza", perfil: "velocidade", dica: "Freada reta e tração limpa nas chicanes valem mais que asa extra." },
  { id: "bahrain", nome: "Bahrain International Circuit", perfil: "tracao", dica: "Curvas lentas pedem controle de tração um pouco mais protetor." },
  { id: "portimao", nome: "Portimão (Algarve)", perfil: "tecnica", dica: "Mudanças de relevo favorecem carro previsível e freio estável." },
  { id: "fuji", nome: "Fuji Speedway", perfil: "velocidade", dica: "Equilibre reta principal com apoio no trecho final mais técnico." },
  { id: "cota", nome: "COTA (Circuit of the Americas)", perfil: "tecnica", dica: "Frente responsiva melhora o primeiro setor e a sequência em alta." },
  { id: "interlagos", nome: "Interlagos (São Paulo)", perfil: "tracao", dica: "Trabalhe tração na subida da Junção para defender/atacar na reta." },
  { id: "imola", nome: "Imola", perfil: "tecnica", dica: "Boa tração de baixa e confiança em zebra fazem diferença no ritmo." },
  { id: "silverstone", nome: "Silverstone", perfil: "tecnica", dica: "Curvas rápidas exigem equilíbrio aero e traseira estável." },
  { id: "sebring", nome: "Sebring", perfil: "irregular", dica: "Pista bumpy: alivie suspensão e aceite perder um pouco de resposta." },
  { id: "daytona", nome: "Daytona", perfil: "velocidade", dica: "Velocidade máxima ajuda muito, mas preserve pneus no infield." },
  { id: "nurburgring", nome: "Nürburgring", perfil: "tecnica", dica: "Mais carga e freio consistente ajudam no setor sinuoso." },
  { id: "redbullring", nome: "Red Bull Ring", perfil: "tracao", dica: "Saídas de curvas lentas e tração em subida ditam o pace." },
  { id: "zandvoort", nome: "Zandvoort", perfil: "tecnica", dica: "Precisão de frente e estabilidade em apoio contínuo são prioridade." },
  { id: "jeddah", nome: "Jeddah", perfil: "velocidade", dica: "Confiança em mudanças rápidas de direção é chave para não perder tempo." },
  { id: "lusail", nome: "Lusail", perfil: "tecnica", dica: "Curvas longas pedem equilíbrio aerodinâmico consistente." },
  { id: "barcelona", nome: "Barcelona-Catalunya", perfil: "tecnica", dica: "Gerencie temperatura dos dianteiros para manter volta estável." }
];

const controlsCatalog = {
  tc: { label: "TC", min: 1, max: 8 },
  tcPowerCut: { label: "TC Power Cut", min: 1, max: 8 },
  tcSlip: { label: "TC Slip", min: 1, max: 8 }
};

const profileAdjust = {
  velocidade: { aero: -2.5, ride: -1, camber: -0.08, tc: -1, abs: -1, tcPowerCut: -1, tcSlip: 1 },
  tecnica: { aero: 2.5, ride: 1, camber: -0.15, tc: 0, abs: 1, tcPowerCut: 0, tcSlip: 0 },
  tracao: { aero: 1, ride: 1, camber: -0.12, tc: 1, abs: 0, tcPowerCut: 1, tcSlip: -1 },
  irregular: { aero: 1.5, ride: 3, camber: 0.08, tc: 1, abs: 1, tcPowerCut: 1, tcSlip: -1 }
};

const cars = Object.entries(classes).flatMap(([classe, nomes], classIndex) =>
  nomes.map((nome, index) => {
    const isGT3 = classe === "GT3";
    const isProto = classe === "Hypercar" || classe === "LMP2" || classe === "LMP3";
    const controlAvailability = ["tc", "tcPowerCut", "tcSlip"];

    return {
      nome,
      classe,
      classIndex,
      index,
      controlAvailability,
      type: isGT3 ? "gt3" : isProto ? "prototype" : "other",
      key: `${classe}-${nome}`.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    };
  })
);

const state = {
  selectedClass: "Todos",
  selectedCar: cars[0]?.key,
  selectedTrack: tracks[0]?.id,
  selectedTab: "qualifying",
  search: ""
};

const classFilter = document.getElementById("classFilter");
const carFilter = document.getElementById("carFilter");
const trackFilter = document.getElementById("trackFilter");
const searchInput = document.getElementById("searchInput");
const cardsEl = document.getElementById("carCards");
const titleEl = document.getElementById("selectionTitle");
const tipEl = document.getElementById("trackTip");
const openSetupEl = document.getElementById("openSetup");
const fixedSetupEl = document.getElementById("fixedSetup");
const tabs = [...document.querySelectorAll(".tab")];

function setupFilters() {
  classFilter.innerHTML = ['<option value="Todos">Todas as classes</option>', ...Object.keys(classes).map((c) => `<option value="${c}">${c}</option>`)].join("");
  trackFilter.innerHTML = tracks.map((t) => `<option value="${t.id}">${t.nome}</option>`).join("");
  refreshCarOptions();
}

function getFilteredCars() {
  return cars.filter((car) => {
    const byClass = state.selectedClass === "Todos" || car.classe === state.selectedClass;
    const bySearch = !state.search || car.nome.toLowerCase().includes(state.search) || car.classe.toLowerCase().includes(state.search);
    return byClass && bySearch;
  });
}

function refreshCarOptions() {
  const filtered = getFilteredCars();
  if (!filtered.some((car) => car.key === state.selectedCar)) state.selectedCar = filtered[0]?.key;

  carFilter.innerHTML = filtered.map((car) => `<option value="${car.key}">${car.nome} (${car.classe})</option>`).join("");
  if (!filtered.length) {
    cardsEl.innerHTML = "<p class='text-sm text-slate-300'>Nenhum carro encontrado para o filtro atual.</p>";
    openSetupEl.innerHTML = "";
    fixedSetupEl.innerHTML = "";
    return;
  }
  renderCars(filtered);
  renderSelection();
}

function baseFor(car) {
  if (car.type === "gt3") {
    return {
      psiF: 26.2,
      psiR: 26.7,
      rideF: 54,
      rideR: 66,
      wing: 9,
      camberF: -3.3,
      camberR: -2.1,
      toeF: -0.04,
      toeR: 0.16,
      bb: 57.5,
      diff: 40,
      abs: 4,
      tc: 3,
      tcPowerCut: 3,
      tcSlip: 5
    };
  }
  if (car.classe === "LMP3") {
    return {
      psiF: 24.7,
      psiR: 25.0,
      rideF: 44,
      rideR: 58,
      wing: 7,
      camberF: -3.0,
      camberR: -1.8,
      toeF: -0.03,
      toeR: 0.13,
      bb: 56.5,
      diff: 45,
      abs: 3,
      tc: 2,
      tcPowerCut: 2,
      tcSlip: 4
    };
  }
  if (car.classe === "LMP2") {
    return {
      psiF: 24.3,
      psiR: 24.8,
      rideF: 43,
      rideR: 57,
      wing: 8,
      camberF: -3.2,
      camberR: -1.9,
      toeF: -0.03,
      toeR: 0.12,
      bb: 55.7,
      diff: 44,
      abs: 3,
      tc: 2,
      tcPowerCut: 2,
      tcSlip: 4
    };
  }
  return {
    psiF: 24.1,
    psiR: 24.6,
    rideF: 41,
    rideR: 55,
    wing: 8,
    camberF: -3.1,
    camberR: -1.7,
    toeF: -0.02,
    toeR: 0.12,
    bb: 55.2,
    diff: 43,
    abs: 3,
    tc: 2,
    tcPowerCut: 2,
    tcSlip: 4
  };
}

function generateSetup(car, track, phase) {
  const base = baseFor(car);
  const adjust = profileAdjust[track.perfil];
  const carOffset = (car.classIndex + 1) * 0.25 + (car.index + 1) * 0.14;
  const trackOffset = tracks.findIndex((t) => t.id === track.id) * 0.11;

  let phaseAdjust = { wing: 0, fuel: "Médio", bb: 0, diff: 0, tc: 0, abs: 0, tcPowerCut: 0, tcSlip: 0 };
  if (phase === "qualifying") phaseAdjust = { wing: -1, fuel: "Baixo (2-4 voltas)", bb: -0.2, diff: -2, tc: -1, abs: -1, tcPowerCut: -1, tcSlip: 1 };
  if (phase === "race") phaseAdjust = { wing: 0, fuel: "Planejado por stint", bb: 0, diff: 0, tc: 0, abs: 0, tcPowerCut: 0, tcSlip: 0 };
  if (phase === "sprint") phaseAdjust = { wing: -0.5, fuel: "20 min + 1 volta", bb: -0.1, diff: -1, tc: -1, abs: -1, tcPowerCut: -1, tcSlip: 1 };

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const round = (v, p = 1) => Number(v.toFixed(p));

  return {
    psiF: round(base.psiF + carOffset * 0.2 - trackOffset * 0.1, 1),
    psiR: round(base.psiR + carOffset * 0.2 - trackOffset * 0.08, 1),
    rideF: Math.round(base.rideF + adjust.ride + (car.index % 3) - (phase === "qualifying" ? 1 : 0)),
    rideR: Math.round(base.rideR + adjust.ride + (car.index % 4)),
    wing: round(clamp(base.wing + adjust.aero + phaseAdjust.wing + (car.classIndex % 2), 2, 14), 1),
    camberF: round(base.camberF + adjust.camber - carOffset * 0.02, 2),
    camberR: round(base.camberR + adjust.camber * 0.7 - carOffset * 0.01, 2),
    toeF: round(base.toeF - (track.perfil === "tecnica" ? 0.01 : 0), 2),
    toeR: round(base.toeR + (track.perfil === "tracao" ? 0.01 : 0), 2),
    springs: `Dianteira ${Math.round(145 + carOffset * 12 + (track.perfil === "irregular" ? -12 : 5))} N/mm • Traseira ${Math.round(155 + carOffset * 10 + (track.perfil === "irregular" ? -9 : 4))} N/mm`,
    dampers: track.perfil === "irregular" ? "Comp/Bump mais suave e Rebound médio" : "Comp/Bump médio e Rebound firme",
    arb: `Dianteira ${Math.round(4 + (car.index % 3))} • Traseira ${Math.round(3 + (trackOffset % 3))}`,
    bb: round(clamp(base.bb + phaseAdjust.bb + (car.index % 4) * 0.2 + (track.perfil === "velocidade" ? 0.2 : -0.1), car.type === "gt3" ? 55 : 54, car.type === "gt3" ? 60 : 58), 1),
    diff: Math.round(clamp(base.diff + phaseAdjust.diff + (track.perfil === "tracao" ? 3 : 0), 32, 58)),
    abs: Math.round(clamp(base.abs + adjust.abs + phaseAdjust.abs + (car.index % 2), 1, 6)),
    tc: Math.round(clamp(base.tc + adjust.tc + phaseAdjust.tc + (car.classIndex % 2), controlsCatalog.tc.min, controlsCatalog.tc.max)),
    tcPowerCut: Math.round(clamp(base.tcPowerCut + adjust.tcPowerCut + phaseAdjust.tcPowerCut + (car.classIndex % 2), controlsCatalog.tcPowerCut.min, controlsCatalog.tcPowerCut.max)),
    tcSlip: Math.round(clamp(base.tcSlip + adjust.tcSlip + phaseAdjust.tcSlip + (track.perfil === "tracao" ? -1 : 0), controlsCatalog.tcSlip.min, controlsCatalog.tcSlip.max)),
    fuel: phaseAdjust.fuel,
    notes:
      phase === "qualifying"
        ? "Qualifying: resposta mais direta para volta rápida, com menor margem de proteção eletrônica."
        : phase === "sprint"
          ? "Sprint 20min: estilo agressivo, menor corte de potência e mais slip permitido para acelerar saída de curva."
          : "Race: ritmo de stint, foco em consistência térmica de pneus e estabilidade em tráfego."
  };
}

function fixedSetup(car, track) {
  const race = generateSetup(car, track, "race");
  const sprint = generateSetup(car, track, "sprint");
  const lowSpeedBias = track.perfil === "tracao" || track.perfil === "irregular" ? 1 : 0;
  const highSpeedBias = track.perfil === "velocidade" ? 1 : 0;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  return {
    sprint: {
      abs: sprint.abs,
      tc: clamp(sprint.tc - 1 + lowSpeedBias - highSpeedBias, 1, 8),
      tcPowerCut: clamp(sprint.tcPowerCut - 1 + lowSpeedBias, 1, 8),
      tcSlip: clamp(sprint.tcSlip + 1 - lowSpeedBias + highSpeedBias, 1, 8),
      bb: Math.max(54, sprint.bb - 0.2).toFixed(1) + "%",
      map: track.perfil === "velocidade" ? "Map 1-2" : "Map 2",
      fuel: "20 min + 1 volta (margem mínima)"
    },
    endurance: {
      abs: Math.min(6, race.abs + 1),
      tc: clamp(race.tc + 1 + lowSpeedBias - highSpeedBias, 1, 8),
      tcPowerCut: clamp(race.tcPowerCut + 1 + lowSpeedBias, 1, 8),
      tcSlip: clamp(race.tcSlip - 1 - lowSpeedBias + highSpeedBias, 1, 8),
      bb: Math.min(60, race.bb + 0.3).toFixed(1) + "%",
      map: track.perfil === "velocidade" ? "Map 2-3" : "Map 3",
      fuel: "Stint completo + margem de segurança"
    }
  };
}

function levelClass(_controlKey, value) {
  if (value >= 6) return "level-high";
  if (value >= 4) return "level-mid";
  return "level-low";
}

function levelBadge(controlKey, value) {
  return `<span class="level ${levelClass(controlKey, value)}">${value}</span>`;
}

function renderCars(filtered) {
  cardsEl.innerHTML = filtered
    .map(
      (car) => `
      <article class="car-card reveal ${car.key === state.selectedCar ? "is-selected" : ""}" data-key="${car.key}">
        <h3 class="font-race text-base text-slate-50">${car.nome}</h3>
        <p>${car.classe}</p>
      </article>`
    )
    .join("");

  cardsEl.querySelectorAll(".car-card").forEach((card) => {
    card.addEventListener("click", () => {
      state.selectedCar = card.dataset.key;
      carFilter.value = state.selectedCar;
      renderSelection();
      renderCars(filtered);
      runRevealAnimation();
    });
  });
}

function setupDownloadButton(setupType, car, track) {
  const btn = document.createElement("button");
  btn.className = "btn";
  btn.textContent = `Download ${setupType}.svm (placeholder)`;
  btn.addEventListener("click", () => {
    const safeCar = car.nome.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    const filename = `${setupType}-${safeCar}-${track.id}.svm`;
    const content = `PLACEHOLDER SVM\n\nCarro: ${car.nome}\nClasse: ${car.classe}\nPista: ${track.nome}\nSetup: ${setupType}\n\nSubstitua este arquivo por um .svm real exportado do jogo e mantenha o mesmo nome.\nCaminho sugerido: setups/${car.classe.toLowerCase()}/${safeCar}/${track.id}/${setupType}.svm`;
    const blob = new Blob([content], { type: "application/octet-stream" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  });
  return btn;
}

function renderControlRows(car, setup) {
  const controlLines = [];
  car.controlAvailability.forEach((controlKey) => {
    if (controlKey === "tc") controlLines.push(`<li>TC: ${setup.tc}</li>`);
    if (controlKey === "tcPowerCut") controlLines.push(`<li>TC Power Cut: ${setup.tcPowerCut}</li>`);
    if (controlKey === "tcSlip") controlLines.push(`<li>TC Slip: ${setup.tcSlip}</li>`);
  });
  return controlLines.join("");
}

function renderFixedTable(car, fixed) {
  const fixedControls = car.controlAvailability;
  const staticColumns = [
    { key: "abs", label: "ABS" },
    ...fixedControls.map((controlKey) => ({ key: controlKey, label: controlsCatalog[controlKey].label })),
    { key: "bb", label: "Brake Bias" },
    { key: "map", label: "Engine Map" },
    { key: "fuel", label: "Fuel Strategy" }
  ];

  const rows = [
    { label: "Sprint 20min (agressivo)", values: fixed.sprint },
    { label: "Endurance (conservador)", values: fixed.endurance }
  ];

  const toCell = (column, values) => {
    if (["tc", "tcPowerCut", "tcSlip"].includes(column.key)) {
      return levelBadge(column.key, values[column.key]);
    }
    if (column.key === "abs") {
      return levelBadge("abs", values.abs);
    }
    return values[column.key];
  };

  fixedSetupEl.innerHTML = `
    <div class="table-wrap panel-anim">
      <table>
        <thead>
          <tr>
            <th>Formato</th>
            ${staticColumns.map((column) => `<th>${column.label}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
            <tr>
              <td>${row.label}</td>
              ${staticColumns.map((column) => `<td>${toCell(column, row.values)}</td>`).join("")}
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderSelection() {
  const car = cars.find((c) => c.key === state.selectedCar);
  const track = tracks.find((t) => t.id === state.selectedTrack);
  if (!car || !track) return;

  titleEl.textContent = `${car.classe} → ${car.nome} → ${track.nome}`;
  tipEl.textContent = `Dica rápida: ${track.dica}`;

  const setup = generateSetup(car, track, state.selectedTab);
  const openBox = document.createElement("div");
  openBox.className = "box";
  openBox.innerHTML = `
    <h3>Open setup • ${state.selectedTab.toUpperCase()}</h3>
    <p>${setup.notes}</p>
    <ul>
      <li>Pressão pneus (fr/tr): ${setup.psiF} / ${setup.psiR} psi</li>
      <li>Ride height (fr/tr): ${setup.rideF} / ${setup.rideR} mm</li>
      <li>Asa: ${setup.wing}</li>
      <li>Camber (fr/tr): ${setup.camberF}° / ${setup.camberR}°</li>
      <li>Toe (fr/tr): ${setup.toeF}° / ${setup.toeR}°</li>
      <li>Molas: ${setup.springs}</li>
      <li>Amortecedores: ${setup.dampers}</li>
      <li>Barra estabilizadora: ${setup.arb}</li>
      <li>Brake Bias: ${setup.bb}%</li>
      <li>Diferencial: ${setup.diff}%</li>
      <li>ABS: ${setup.abs}</li>
      ${renderControlRows(car, setup)}
      <li>Estratégia de combustível: ${setup.fuel}</li>
    </ul>
  `;

  const downloads = document.createElement("div");
  downloads.className = "box";
  downloads.innerHTML = "<h4>Downloads .svm</h4><p>Use placeholders até inserir seus arquivos reais.</p>";
  ["qualifying", "race", "sprint"].forEach((kind) => downloads.appendChild(setupDownloadButton(kind, car, track)));

  openSetupEl.innerHTML = "";
  const wrapper = document.createElement("div");
  wrapper.className = "setup-grid panel-anim";
  wrapper.append(openBox, downloads);
  openSetupEl.appendChild(wrapper);

  const fixed = fixedSetup(car, track);
  renderFixedTable(car, fixed);
}

function runRevealAnimation() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

classFilter.addEventListener("change", (e) => {
  state.selectedClass = e.target.value;
  refreshCarOptions();
  runRevealAnimation();
});

carFilter.addEventListener("change", (e) => {
  state.selectedCar = e.target.value;
  renderSelection();
  renderCars(getFilteredCars());
  runRevealAnimation();
});

trackFilter.addEventListener("change", (e) => {
  state.selectedTrack = e.target.value;
  renderSelection();
});

searchInput.addEventListener("input", (e) => {
  state.search = e.target.value.trim().toLowerCase();
  refreshCarOptions();
  runRevealAnimation();
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("is-active"));
    tab.classList.add("is-active");
    state.selectedTab = tab.dataset.tab;
    renderSelection();
  });
});

setupFilters();
classFilter.value = state.selectedClass;
trackFilter.value = state.selectedTrack;
renderSelection();
runRevealAnimation();
