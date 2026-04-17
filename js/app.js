const classes = {
  Hypercar: [
    "Toyota GR010 Hybrid",
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
    "Porsche 911 GT3 R (992)",
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
  { id: "lemans", nome: "Le Mans (Circuit de la Sarthe)", perfil: "velocidade", dica: "Reduza arrasto e use mapa de motor agressivo só em ataques pontuais." },
  { id: "spa", nome: "Spa-Francorchamps", perfil: "tecnica", dica: "Cuidado com desgaste traseiro em stints longos." },
  { id: "monza", nome: "Monza", perfil: "velocidade", dica: "Foque em freada estável para as chicanes com pouca asa." },
  { id: "bahrain", nome: "Bahrain International Circuit", perfil: "tracao", dica: "Saídas de curva pedem tração e controle térmico dos pneus traseiros." },
  { id: "portimao", nome: "Portimão (Algarve)", perfil: "tecnica", dica: "Oscilações de relevo pedem ride height mais seguro." },
  { id: "fuji", nome: "Fuji Speedway", perfil: "velocidade", dica: "Equilibre reta longa com estabilidade no setor final." },
  { id: "cota", nome: "COTA (Circuit of the Americas)", perfil: "tecnica", dica: "Apoio dianteiro ajuda no primeiro setor e no miolo." },
  { id: "interlagos", nome: "Interlagos (São Paulo)", perfil: "tracao", dica: "Mantenha tração limpa na subida para a reta principal." },
  { id: "imola", nome: "Imola", perfil: "tecnica", dica: "Use freio motor e balanço estável sobre zebras." },
  { id: "silverstone", nome: "Silverstone", perfil: "tecnica", dica: "Sequências rápidas exigem frente precisa e traseira previsível." },
  { id: "sebring", nome: "Sebring", perfil: "irregular", dica: "Pista muito bumpy: suavize suspensão e eleve o carro." },
  { id: "daytona", nome: "Daytona", perfil: "velocidade", dica: "Baixo arrasto e atenção na temperatura de pneus no infield." },
  { id: "nurburgring", nome: "Nürburgring", perfil: "tecnica", dica: "Mais downforce para setor sinuoso e frenagens fortes." },
  { id: "redbullring", nome: "Red Bull Ring", perfil: "tracao", dica: "Tração na saída das curvas lentas define o pace." },
  { id: "zandvoort", nome: "Zandvoort", perfil: "tecnica", dica: "Muita carga e precisão de frente para curvas em apoio." },
  { id: "jeddah", nome: "Jeddah", perfil: "velocidade", dica: "Use carro firme para mudanças rápidas de direção em alta." },
  { id: "lusail", nome: "Lusail", perfil: "tecnica", dica: "Equilíbrio aerodinâmico estável para curvas longas." },
  { id: "barcelona", nome: "Barcelona-Catalunya", perfil: "tecnica", dica: "Pista sensível a desgaste dianteiro; preserve o eixo frontal." }
];

const profileAdjust = {
  velocidade: { aero: -3, ride: -2, camber: -0.1, tc: -1, abs: -1 },
  tecnica: { aero: 3, ride: 2, camber: -0.2, tc: 0, abs: 1 },
  tracao: { aero: 1, ride: 1, camber: -0.15, tc: 1, abs: 0 },
  irregular: { aero: 2, ride: 4, camber: 0.1, tc: 1, abs: 1 }
};

const cars = Object.entries(classes).flatMap(([classe, nomes], classIndex) =>
  nomes.map((nome, index) => {
    const isGT3 = classe === "GT3";
    const isProto = classe === "Hypercar" || classe === "LMP2" || classe === "LMP3";
    return {
      nome,
      classe,
      classIndex,
      index,
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
    cardsEl.innerHTML = "<p>Nenhum carro encontrado para o filtro atual.</p>";
    openSetupEl.innerHTML = "";
    fixedSetupEl.innerHTML = "";
    return;
  }
  renderCars(filtered);
  renderSelection();
}

function baseFor(car) {
  if (car.type === "gt3") return { psiF: 26.2, psiR: 26.7, rideF: 54, rideR: 66, wing: 9, camberF: -3.3, camberR: -2.1, toeF: -0.04, toeR: 0.16, bb: 57.5, diff: 40, abs: 4, tc: 3, tc2: 5 };
  if (car.classe === "LMP3") return { psiF: 24.7, psiR: 25.0, rideF: 44, rideR: 58, wing: 7, camberF: -3.0, camberR: -1.8, toeF: -0.03, toeR: 0.13, bb: 56.5, diff: 45, abs: 3, tc: 2, tc2: 3 };
  if (car.classe === "LMP2") return { psiF: 24.3, psiR: 24.8, rideF: 43, rideR: 57, wing: 8, camberF: -3.2, camberR: -1.9, toeF: -0.03, toeR: 0.12, bb: 55.7, diff: 44, abs: 3, tc: 2, tc2: 3 };
  return { psiF: 24.1, psiR: 24.6, rideF: 41, rideR: 55, wing: 8, camberF: -3.1, camberR: -1.7, toeF: -0.02, toeR: 0.12, bb: 55.2, diff: 43, abs: 3, tc: 2, tc2: 2 };
}

function generateSetup(car, track, phase) {
  const base = baseFor(car);
  const adjust = profileAdjust[track.perfil];
  const carOffset = (car.classIndex + 1) * 0.25 + (car.index + 1) * 0.14;
  const trackOffset = tracks.findIndex((t) => t.id === track.id) * 0.11;

  let phaseAdjust = { wing: 0, fuel: "Médio", bb: 0, diff: 0, tc: 0, abs: 0 };
  if (phase === "qualifying") phaseAdjust = { wing: -1, fuel: "Baixo (2-4 voltas)", bb: -0.2, diff: -2, tc: -1, abs: -1 };
  if (phase === "race") phaseAdjust = { wing: 0, fuel: "Planejado por stint", bb: 0, diff: 0, tc: 0, abs: 0 };
  if (phase === "sprint") phaseAdjust = { wing: -0.5, fuel: "20 min + 1 volta", bb: -0.1, diff: -1, tc: -1, abs: -1 };

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
    tc: Math.round(clamp(base.tc + adjust.tc + phaseAdjust.tc + (car.classIndex % 2), 1, 6)),
    tc2: Math.round(clamp(base.tc2 + (track.perfil === "tracao" ? 1 : 0), 1, 8)),
    fuel: phaseAdjust.fuel,
    notes:
      phase === "qualifying"
        ? "Voltado para volta rápida: carro mais solto, menos combustível e resposta imediata."
        : phase === "sprint"
          ? "Agressivo para 20min: priorize ataque sem necessidade de poupar o equipamento."
          : "Foco em consistência de stint, preservando pneus e estabilidade em tráfego."
  };
}

function fixedSetup(car, track) {
  const race = generateSetup(car, track, "race");
  const sprint = generateSetup(car, track, "sprint");
  const enduranceAbs = Math.min(6, race.abs + 1);
  const enduranceTc = Math.min(6, race.tc + 1);

  return {
    sprint: {
      abs: sprint.abs,
      tc: Math.max(1, sprint.tc - 1),
      tc2: Math.max(1, sprint.tc2 - 1),
      bb: Math.max(54, sprint.bb - 0.2).toFixed(1) + "%",
      map: track.perfil === "velocidade" ? "Map 1-2" : "Map 2",
      fuel: "20 min + 1 volta (margem mínima)"
    },
    endurance: {
      abs: enduranceAbs,
      tc: enduranceTc,
      tc2: Math.min(8, race.tc2 + 1),
      bb: Math.min(60, race.bb + 0.3).toFixed(1) + "%",
      map: track.perfil === "velocidade" ? "Map 2-3" : "Map 3",
      fuel: "Stint completo + margem de segurança"
    }
  };
}

function renderCars(filtered) {
  cardsEl.innerHTML = filtered
    .map(
      (car) => `
      <article class="car-card ${car.key === state.selectedCar ? "is-selected" : ""}" data-key="${car.key}">
        <h3>${car.nome}</h3>
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
    <h3>Open Setup • ${state.selectedTab.toUpperCase()}</h3>
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
      <li>TC / TC2: ${setup.tc} / ${setup.tc2}</li>
      <li>Estratégia de combustível: ${setup.fuel}</li>
    </ul>
  `;

  const downloads = document.createElement("div");
  downloads.className = "box";
  downloads.innerHTML = "<h4>Downloads .svm</h4><p>Use placeholders até inserir seus arquivos reais.</p>";
  ["qualifying", "race", "sprint"].forEach((kind) => downloads.appendChild(setupDownloadButton(kind, car, track)));

  openSetupEl.innerHTML = "";
  const wrapper = document.createElement("div");
  wrapper.className = "grid-2";
  wrapper.append(openBox, downloads);
  openSetupEl.appendChild(wrapper);

  const fixed = fixedSetup(car, track);
  fixedSetupEl.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Formato</th>
          <th>ABS</th>
          <th>TC</th>
          <th>TC2</th>
          <th>Brake Bias</th>
          <th>Engine Map</th>
          <th>Fuel Strategy</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Sprint 20min (agressivo)</td>
          <td>${fixed.sprint.abs}</td>
          <td>${fixed.sprint.tc}</td>
          <td>${fixed.sprint.tc2}</td>
          <td>${fixed.sprint.bb}</td>
          <td>${fixed.sprint.map}</td>
          <td>${fixed.sprint.fuel}</td>
        </tr>
        <tr>
          <td>Endurance (conservador)</td>
          <td>${fixed.endurance.abs}</td>
          <td>${fixed.endurance.tc}</td>
          <td>${fixed.endurance.tc2}</td>
          <td>${fixed.endurance.bb}</td>
          <td>${fixed.endurance.map}</td>
          <td>${fixed.endurance.fuel}</td>
        </tr>
      </tbody>
    </table>
  `;
}

classFilter.addEventListener("change", (e) => {
  state.selectedClass = e.target.value;
  refreshCarOptions();
});

carFilter.addEventListener("change", (e) => {
  state.selectedCar = e.target.value;
  renderSelection();
  renderCars(getFilteredCars());
});

trackFilter.addEventListener("change", (e) => {
  state.selectedTrack = e.target.value;
  renderSelection();
});

searchInput.addEventListener("input", (e) => {
  state.search = e.target.value.trim().toLowerCase();
  refreshCarOptions();
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
