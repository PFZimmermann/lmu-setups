import { useMemo, useState } from 'react'
import './App.css'

type CarClass = 'Hypercar' | 'LMP2' | 'LMP3' | 'GT3'
type SetupPhase = 'qualifying' | 'race' | 'sprint'
type TrackProfile = 'velocidade' | 'tecnica' | 'tracao' | 'irregular'

const classes: Record<CarClass, string[]> = {
  Hypercar: [
    'Toyota GR010 Hybrid',
    'Porsche 963',
    'Ferrari 499P',
    'Cadillac V-Series.R',
    'Peugeot 9X8',
    'BMW M Hybrid V8',
    'Alpine A424',
    'Lamborghini SC63'
  ],
  LMP2: ['Oreca 07 Gibson'],
  LMP3: ['Ligier JS P320'],
  GT3: [
    'Porsche 911 GT3 R (992)',
    'Ferrari 296 GT3',
    'BMW M4 GT3',
    'Lamborghini Huracán GT3 EVO2',
    'Mercedes-AMG GT3',
    'Aston Martin Vantage GT3',
    'Corvette Z06 GT3.R',
    'McLaren 720S GT3 EVO',
    'Ford Mustang GT3'
  ]
}

const tracks = [
  { id: 'lemans', nome: 'Le Mans (Circuit de la Sarthe)', perfil: 'velocidade', dica: 'Reduza arrasto e use mapa agressivo só em ataques pontuais.' },
  { id: 'spa', nome: 'Spa-Francorchamps', perfil: 'tecnica', dica: 'Cuidado com desgaste traseiro em stints longos.' },
  { id: 'monza', nome: 'Monza', perfil: 'velocidade', dica: 'Foque em freada estável para as chicanes com pouca asa.' },
  { id: 'bahrain', nome: 'Bahrain International Circuit', perfil: 'tracao', dica: 'Saídas de curva pedem gestão de slip e tração progressiva.' },
  { id: 'portimao', nome: 'Portimão (Algarve)', perfil: 'tecnica', dica: 'Oscilações de relevo pedem ride height mais seguro.' },
  { id: 'fuji', nome: 'Fuji Speedway', perfil: 'velocidade', dica: 'Equilibre reta longa com estabilidade no setor final.' },
  { id: 'cota', nome: 'COTA (Circuit of the Americas)', perfil: 'tecnica', dica: 'Apoio dianteiro ajuda no primeiro setor e no miolo.' },
  { id: 'interlagos', nome: 'Interlagos (São Paulo)', perfil: 'tracao', dica: 'Mantenha aceleração limpa na subida para a reta principal.' },
  { id: 'imola', nome: 'Imola', perfil: 'tecnica', dica: 'Use freio motor e balanço estável sobre zebras.' },
  { id: 'silverstone', nome: 'Silverstone', perfil: 'tecnica', dica: 'Sequências rápidas exigem frente precisa e traseira previsível.' },
  { id: 'sebring', nome: 'Sebring', perfil: 'irregular', dica: 'Pista muito bumpy: suavize suspensão e eleve o carro.' },
  { id: 'daytona', nome: 'Daytona', perfil: 'velocidade', dica: 'Baixo arrasto e atenção na temperatura de pneus no infield.' },
  { id: 'nurburgring', nome: 'Nürburgring', perfil: 'tecnica', dica: 'Mais downforce para setor sinuoso e frenagens fortes.' },
  { id: 'redbullring', nome: 'Red Bull Ring', perfil: 'tracao', dica: 'Tração na saída das curvas lentas define o pace.' },
  { id: 'zandvoort', nome: 'Zandvoort', perfil: 'tecnica', dica: 'Muita carga e precisão de frente para curvas em apoio.' },
  { id: 'jeddah', nome: 'Jeddah', perfil: 'velocidade', dica: 'Use carro firme para mudanças rápidas de direção em alta.' },
  { id: 'lusail', nome: 'Lusail', perfil: 'tecnica', dica: 'Equilíbrio aerodinâmico estável para curvas longas.' },
  { id: 'barcelona', nome: 'Barcelona-Catalunya', perfil: 'tecnica', dica: 'Pista sensível a desgaste dianteiro; preserve o eixo frontal.' }
] as const satisfies Array<{ id: string; nome: string; perfil: TrackProfile; dica: string }>

const profileAdjust: Record<TrackProfile, { aero: number; ride: number; camber: number; tcMode: number; tcSlip: number; tcCut: number; abs: number }> = {
  velocidade: { aero: -3, ride: -2, camber: -0.1, tcMode: -1, tcSlip: -1, tcCut: -1, abs: -1 },
  tecnica: { aero: 3, ride: 2, camber: -0.2, tcMode: 0, tcSlip: 1, tcCut: 1, abs: 1 },
  tracao: { aero: 1, ride: 1, camber: -0.15, tcMode: 1, tcSlip: 1, tcCut: 2, abs: 0 },
  irregular: { aero: 2, ride: 4, camber: 0.1, tcMode: 1, tcSlip: 2, tcCut: 1, abs: 1 }
}

const cars = (Object.entries(classes) as Array<[CarClass, string[]]>).flatMap(([classe, nomes], classIndex) =>
  nomes.map((nome, index) => {
    const isGT3 = classe === 'GT3'
    const isProto = classe === 'Hypercar' || classe === 'LMP2' || classe === 'LMP3'
    return {
      nome,
      classe,
      classIndex,
      index,
      type: isGT3 ? 'gt3' : isProto ? 'prototype' : 'other',
      key: `${classe}-${nome}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    }
  })
)

const phases: Array<{ id: SetupPhase; label: string }> = [
  { id: 'qualifying', label: 'Qualifying' },
  { id: 'race', label: 'Race' },
  { id: 'sprint', label: 'Sprint (20min)' }
]

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
const round = (value: number, precision = 1) => Number(value.toFixed(precision))

function baseFor(car: (typeof cars)[number]) {
  if (car.type === 'gt3') {
    return {
      psiF: 26.2, psiR: 26.7, rideF: 54, rideR: 66, wing: 9, camberF: -3.3, camberR: -2.1, toeF: -0.04, toeR: 0.16, bb: 57.5, diff: 40, abs: 4,
      tcMode: 4, tcSlip: 4, tcCut: 5
    }
  }
  if (car.classe === 'LMP3') {
    return {
      psiF: 24.7, psiR: 25, rideF: 44, rideR: 58, wing: 7, camberF: -3, camberR: -1.8, toeF: -0.03, toeR: 0.13, bb: 56.5, diff: 45, abs: 3,
      tcMode: 3, tcSlip: 3, tcCut: 4
    }
  }
  if (car.classe === 'LMP2') {
    return {
      psiF: 24.3, psiR: 24.8, rideF: 43, rideR: 57, wing: 8, camberF: -3.2, camberR: -1.9, toeF: -0.03, toeR: 0.12, bb: 55.7, diff: 44, abs: 3,
      tcMode: 2, tcSlip: 3, tcCut: 3
    }
  }
  return {
    psiF: 24.1, psiR: 24.6, rideF: 41, rideR: 55, wing: 8, camberF: -3.1, camberR: -1.7, toeF: -0.02, toeR: 0.12, bb: 55.2, diff: 43, abs: 3,
    tcMode: 2, tcSlip: 2, tcCut: 2
  }
}

function generateSetup(car: (typeof cars)[number], track: (typeof tracks)[number], phase: SetupPhase) {
  const base = baseFor(car)
  const adjust = profileAdjust[track.perfil]
  const carOffset = (car.classIndex + 1) * 0.25 + (car.index + 1) * 0.14
  const trackOffset = tracks.findIndex((item) => item.id === track.id) * 0.11

  let phaseAdjust = { wing: 0, fuel: 'Médio', bb: 0, diff: 0, tcMode: 0, tcSlip: 0, tcCut: 0, abs: 0 }
  if (phase === 'qualifying') {
    phaseAdjust = { wing: -1, fuel: 'Baixo (2-4 voltas)', bb: -0.2, diff: -2, tcMode: -1, tcSlip: -1, tcCut: -1, abs: -1 }
  }
  if (phase === 'sprint') {
    phaseAdjust = { wing: -0.5, fuel: '20 min + 1 volta', bb: -0.1, diff: -1, tcMode: -1, tcSlip: -1, tcCut: -1, abs: -1 }
  }

  return {
    psiF: round(base.psiF + carOffset * 0.2 - trackOffset * 0.1, 1),
    psiR: round(base.psiR + carOffset * 0.2 - trackOffset * 0.08, 1),
    rideF: Math.round(base.rideF + adjust.ride + (car.index % 3) - (phase === 'qualifying' ? 1 : 0)),
    rideR: Math.round(base.rideR + adjust.ride + (car.index % 4)),
    wing: round(clamp(base.wing + adjust.aero + phaseAdjust.wing + (car.classIndex % 2), 2, 14), 1),
    camberF: round(base.camberF + adjust.camber - carOffset * 0.02, 2),
    camberR: round(base.camberR + adjust.camber * 0.7 - carOffset * 0.01, 2),
    toeF: round(base.toeF - (track.perfil === 'tecnica' ? 0.01 : 0), 2),
    toeR: round(base.toeR + (track.perfil === 'tracao' ? 0.01 : 0), 2),
    springs: `Dianteira ${Math.round(145 + carOffset * 12 + (track.perfil === 'irregular' ? -12 : 5))} N/mm • Traseira ${Math.round(155 + carOffset * 10 + (track.perfil === 'irregular' ? -9 : 4))} N/mm`,
    dampers: track.perfil === 'irregular' ? 'Comp/Bump mais suave e Rebound médio' : 'Comp/Bump médio e Rebound firme',
    arb: `Dianteira ${Math.round(4 + (car.index % 3))} • Traseira ${Math.round(3 + (trackOffset % 3))}`,
    bb: round(clamp(base.bb + phaseAdjust.bb + (car.index % 4) * 0.2 + (track.perfil === 'velocidade' ? 0.2 : -0.1), car.type === 'gt3' ? 55 : 54, car.type === 'gt3' ? 60 : 58), 1),
    diff: Math.round(clamp(base.diff + phaseAdjust.diff + (track.perfil === 'tracao' ? 3 : 0), 32, 58)),
    abs: Math.round(clamp(base.abs + adjust.abs + phaseAdjust.abs + (car.index % 2), 1, 6)),
    tcMode: Math.round(clamp(base.tcMode + adjust.tcMode + phaseAdjust.tcMode + (car.classIndex % 2), 1, 8)),
    tcSlip: Math.round(clamp(base.tcSlip + adjust.tcSlip + phaseAdjust.tcSlip, 1, 10)),
    tcCut: Math.round(clamp(base.tcCut + adjust.tcCut + phaseAdjust.tcCut, 1, 10)),
    fuel: phaseAdjust.fuel,
    notes:
      phase === 'qualifying'
        ? 'Voltado para volta rápida: carro mais solto, menos combustível e resposta imediata.'
        : phase === 'sprint'
          ? 'Agressivo para 20min: priorize ataque sem necessidade de poupar o equipamento.'
          : 'Foco em consistência de stint, preservando pneus e estabilidade em tráfego.'
  }
}

function fixedSetup(car: (typeof cars)[number], track: (typeof tracks)[number]) {
  const race = generateSetup(car, track, 'race')
  const sprint = generateSetup(car, track, 'sprint')
  return {
    sprint: {
      abs: sprint.abs,
      tcMode: Math.max(1, sprint.tcMode - 1),
      tcSlip: Math.max(1, sprint.tcSlip - 1),
      tcCut: Math.max(1, sprint.tcCut - 1),
      bb: `${Math.max(54, sprint.bb - 0.2).toFixed(1)}%`,
      map: track.perfil === 'velocidade' ? 'Map 1-2' : 'Map 2',
      fuel: '20 min + 1 volta (margem mínima)'
    },
    endurance: {
      abs: Math.min(6, race.abs + 1),
      tcMode: Math.min(8, race.tcMode + 1),
      tcSlip: Math.min(10, race.tcSlip + 1),
      tcCut: Math.min(10, race.tcCut + 1),
      bb: `${Math.min(60, race.bb + 0.3).toFixed(1)}%`,
      map: track.perfil === 'velocidade' ? 'Map 2-3' : 'Map 3',
      fuel: 'Stint completo + margem de segurança'
    }
  }
}

function createPlaceholder(car: (typeof cars)[number], track: (typeof tracks)[number], setupType: SetupPhase) {
  const safeCar = car.nome.replace(/[^a-z0-9]+/gi, '-').toLowerCase()
  const filename = `${setupType}-${safeCar}-${track.id}.svm`
  const content = `PLACEHOLDER SVM\n\nCarro: ${car.nome}\nClasse: ${car.classe}\nPista: ${track.nome}\nSetup: ${setupType}\n\nSubstitua este arquivo por um .svm real exportado do jogo e mantenha o mesmo nome.\nCaminho sugerido: setups/${car.classe.toLowerCase()}/${safeCar}/${track.id}/${setupType}.svm`
  const blob = new Blob([content], { type: 'application/octet-stream' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

function App() {
  const [selectedClass, setSelectedClass] = useState<'Todos' | CarClass>('Todos')
  const [selectedCar, setSelectedCar] = useState(cars[0]?.key ?? '')
  const [selectedTrack, setSelectedTrack] = useState<string>(tracks[0]?.id ?? '')
  const [selectedTab, setSelectedTab] = useState<SetupPhase>('qualifying')
  const [search, setSearch] = useState('')

  const filteredCars = useMemo(
    () =>
      cars.filter((car) => {
        const byClass = selectedClass === 'Todos' || car.classe === selectedClass
        const lookup = search.trim().toLowerCase()
        const bySearch = !lookup || car.nome.toLowerCase().includes(lookup) || car.classe.toLowerCase().includes(lookup)
        return byClass && bySearch
      }),
    [selectedClass, search]
  )

  const activeCarKey = filteredCars.some((item) => item.key === selectedCar) ? selectedCar : (filteredCars[0]?.key ?? '')
  const car = cars.find((item) => item.key === activeCarKey)
  const track = tracks.find((item) => item.id === selectedTrack)
  const setup = car && track ? generateSetup(car, track, selectedTab) : null
  const fixed = car && track ? fixedSetup(car, track) : null

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="container topbar-content">
          <div>
            <p className="eyebrow">Le Mans Ultimate</p>
            <h1>LMU Setups Brasil</h1>
            <p className="subtitle">Classe → Carro → Pista → Quali/Race/Sprint + Fixed Setup</p>
          </div>
          <nav className="top-nav">
            <a href="#setups">Setups</a>
            <a href="#fixed">Fixed</a>
            <a href="#svm">.svm</a>
          </nav>
        </div>
      </header>

      <main className="container main-content">
        <section id="setups" className="card reveal">
          <h2>Busca e Filtros</h2>
          <div className="filter-grid">
            <label>
              Buscar carro
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ex: Ferrari 499P" />
            </label>
            <label>
              Classe
              <select value={selectedClass} onChange={(event) => setSelectedClass(event.target.value as 'Todos' | CarClass)}>
                <option value="Todos">Todas as classes</option>
                {Object.keys(classes).map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Carro
              <select value={activeCarKey} onChange={(event) => setSelectedCar(event.target.value)}>
                {filteredCars.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.nome} ({item.classe})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Pista
              <select value={selectedTrack} onChange={(event) => setSelectedTrack(event.target.value)}>
                {tracks.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nome}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="card reveal">
          <h2>Carros</h2>
          <div className="cards">
            {filteredCars.length === 0 ? (
              <p>Nenhum carro encontrado para o filtro atual.</p>
            ) : (
              filteredCars.map((item) => (
                <button key={item.key} className={`car-card ${item.key === selectedCar ? 'is-selected' : ''}`} onClick={() => setSelectedCar(item.key)} type="button">
                  <h3>{item.nome}</h3>
                  <p>{item.classe}</p>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="card reveal">
          <h2>{car && track ? `${car.classe} → ${car.nome} → ${track.nome}` : 'Setup'}</h2>
          {track && <p className="tip">Dica rápida: {track.dica}</p>}
          <div className="tabs" role="tablist" aria-label="Tipos de setup">
            {phases.map((phase) => (
              <button key={phase.id} type="button" className={`tab ${selectedTab === phase.id ? 'is-active' : ''}`} onClick={() => setSelectedTab(phase.id)}>
                {phase.label}
              </button>
            ))}
          </div>
          {setup && car && track && (
            <div className="grid-2 transition-in">
              <article className="box">
                <h3>Open Setup • {selectedTab.toUpperCase()}</h3>
                <p>{setup.notes}</p>
                <ul>
                  <li>Pressão pneus (fr/tr): {setup.psiF} / {setup.psiR} psi</li>
                  <li>Ride height (fr/tr): {setup.rideF} / {setup.rideR} mm</li>
                  <li>Asa: {setup.wing}</li>
                  <li>Camber (fr/tr): {setup.camberF}° / {setup.camberR}°</li>
                  <li>Toe (fr/tr): {setup.toeF}° / {setup.toeR}°</li>
                  <li>Molas: {setup.springs}</li>
                  <li>Amortecedores: {setup.dampers}</li>
                  <li>Barra estabilizadora: {setup.arb}</li>
                  <li>Brake Bias: {setup.bb}%</li>
                  <li>Diferencial: {setup.diff}%</li>
                  <li>ABS: {setup.abs}</li>
                  <li>TC Modo: {setup.tcMode}</li>
                  <li>TC Slip: {setup.tcSlip}</li>
                  <li>TC Cut: {setup.tcCut}</li>
                  <li>Estratégia de combustível: {setup.fuel}</li>
                </ul>
              </article>
              <article className="box">
                <h3>Downloads .svm</h3>
                <p>Use placeholders até inserir seus arquivos reais.</p>
                <div className="button-list">
                  {phases.map((phase) => (
                    <button key={phase.id} className="btn" type="button" onClick={() => createPlaceholder(car, track, phase.id)}>
                      Download {phase.id}.svm
                    </button>
                  ))}
                </div>
              </article>
            </div>
          )}
          <details className="details">
            <summary>Novo modelo de controle de tração (LMU)</summary>
            <ul>
              <li><strong>TC Modo:</strong> perfil geral de intervenção do sistema.</li>
              <li><strong>TC Slip:</strong> tolerância de patinagem antes de intervir.</li>
              <li><strong>TC Cut:</strong> intensidade de corte de torque durante intervenção.</li>
            </ul>
          </details>
        </section>

        <section id="fixed" className="card reveal">
          <h2>Setup Fixo (Fixed Setup)</h2>
          <p>Em corridas fixed, use os ajustes livres focando no formato da prova: sprint mais agressivo, endurance mais estável.</p>
          {fixed && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Formato</th>
                    <th>ABS</th>
                    <th>TC Modo</th>
                    <th>TC Slip</th>
                    <th>TC Cut</th>
                    <th>Brake Bias</th>
                    <th>Engine Map</th>
                    <th>Fuel Strategy</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Sprint 20min (agressivo)</td>
                    <td>{fixed.sprint.abs}</td>
                    <td>{fixed.sprint.tcMode}</td>
                    <td>{fixed.sprint.tcSlip}</td>
                    <td>{fixed.sprint.tcCut}</td>
                    <td>{fixed.sprint.bb}</td>
                    <td>{fixed.sprint.map}</td>
                    <td>{fixed.sprint.fuel}</td>
                  </tr>
                  <tr>
                    <td>Endurance (conservador)</td>
                    <td>{fixed.endurance.abs}</td>
                    <td>{fixed.endurance.tcMode}</td>
                    <td>{fixed.endurance.tcSlip}</td>
                    <td>{fixed.endurance.tcCut}</td>
                    <td>{fixed.endurance.bb}</td>
                    <td>{fixed.endurance.map}</td>
                    <td>{fixed.endurance.fuel}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section id="svm" className="card reveal">
          <h2>Compatibilidade de pastas .svm</h2>
          <p>Estrutura mantida para setup real exportado do jogo:</p>
          <code>setups/[classe]/[carro]/[pista]/(qualifying|race|sprint).svm</code>
          <details className="details">
            <summary>Como trocar placeholder por setup real</summary>
            <ol>
              <li>Exporte o setup no Le Mans Ultimate.</li>
              <li>Salve com o padrão de pastas acima.</li>
              <li>Opcionalmente versione arquivos por atualização de pista/carro.</li>
            </ol>
          </details>
        </section>
      </main>
    </div>
  )
}

export default App
