// Persistência de tema + menu mobile + carrinho + formulário
(function(){
  const root = document.documentElement;
  const themeBtn = document.getElementById('themeToggle');
  const nav = document.getElementById('main-nav');
  const burger = document.getElementById('hamburger');
  const cartBtn = document.getElementById('cartBtn');
  const cartCount = document.getElementById('cartCount');
  const toast = document.getElementById('toast');
  const form = document.getElementById('contactForm');
  const yearEl = document.getElementById('year');
  let count = 0;

  // Ano no rodapé
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Tema salvo
  const saved = localStorage.getItem('aurora:theme');
  if(saved){ document.documentElement.setAttribute('data-theme', saved); updateThemeButton(saved); }

  themeBtn?.addEventListener('click', ()=>{
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('aurora:theme', next);
    updateThemeButton(next);
  });

  function updateThemeButton(mode){
    if(!themeBtn) return;
    themeBtn.textContent = (mode === 'dark') ? '☀️ Tema' : '🌙 Tema';
    themeBtn.setAttribute('aria-pressed', mode === 'dark');
  }

  // Menu mobile
  burger?.addEventListener('click', ()=>{
    const opened = nav.classList.toggle('show');
    burger.setAttribute('aria-expanded', opened);
  });

  // Add ao carrinho
  // Dentro do script.js
document.querySelectorAll('[data-add]').forEach(btn => {
  btn.addEventListener('click', ()=>{
    const id = btn.closest('.product').querySelector('h3').textContent;
    const price = Number(btn.closest('.product').querySelector('.price').textContent.replace(/\D/g,''))/100;
    const img = btn.closest('.product').querySelector('img').src;

    // pega carrinho do localStorage ou inicia vazio
    let cart = JSON.parse(localStorage.getItem('aurora:cart')) || [];
    let item = cart.find(i => i.id === id);
    if(item){ item.qty++; }
    else { cart.push({id, name:id, price, qty:1, img}); }

    localStorage.setItem('aurora:cart', JSON.stringify(cart));

    // atualizar badge
    document.getElementById('cartCount').textContent = 
      cart.reduce((sum,i)=> sum+i.qty,0);

    // animação
    pulse(cartBtn);
  });
});


  // Envio do formulário (fake)
  form?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const nome = document.getElementById('nome').value.trim();
    const mensagem = document.getElementById('mensagem').value.trim();
    if(!nome || !mensagem){
      showToast('Preencha todos os campos.');
      return;
    }
    e.target.reset();
    showToast(`Obrigado, ${nome}! Responderemos em breve.`);
  });

  function showToast(text){
    if(!toast) return;
    toast.textContent = text;
    toast.classList.add('show');
    setTimeout(()=> toast.classList.remove('show'), 2400);
  }
})();